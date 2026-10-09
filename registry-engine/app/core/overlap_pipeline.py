"""overlap_pipeline.py - exact-geometry overlap detection and dispute routing.

validate -> candidate search (PostGIS GiST) -> exact metric comparison with survey-accuracy
tolerance -> verdict -> routing. A conflicting claim is QUARANTINED for triage; it is never
silently rejected, and the incumbent parcel is never frozen automatically (that would let
anyone grief a neighbour by filing a bogus overlapping proposal).

Verdicts, worst wins:
    REJECT_INVALID > DISPUTE > REQUIRES_REVIEW > ACCEPT_WITH_WARNINGS > ACCEPT
"""
from __future__ import annotations

import json
import math
from dataclasses import dataclass, field
from enum import Enum
from functools import lru_cache

import numpy as np
import shapely
from pyproj import Transformer
from pyproj.transformer import AreaOfInterest, TransformerGroup
from shapely.geometry import Polygon, shape
from shapely.ops import unary_union
from shapely.validation import explain_validity

from event_log import append_event, geom_hash, owner_commitment, sha256

try:  # optional: only used for the coarse h3_r12 column
    import h3
except ImportError:  # pragma: no cover
    h3 = None


# --------------------------------------------------------------------------- policy
@dataclass(frozen=True)
class Policy:
    # Combined 1-sigma-ish positional uncertainty per accuracy class, in metres.
    # PLACEHOLDERS: calibrate with practising surveyors before relying on them.
    accuracy_m: dict = field(default_factory=lambda: {
        "TOTAL_STATION": 0.05, "RTK_GNSS": 0.30, "DGPS": 1.0, "HANDHELD": 5.0})
    auto_accept_classes: tuple = ("TOTAL_STATION", "RTK_GNSS", "DGPS")
    min_area_m2: float = 20.0
    max_area_m2: float = 5_000_000.0        # 500 ha
    declared_area_tol: float = 0.02         # computed vs plan-stated area
    duplicate_ratio: float = 0.80           # overlap / smaller parcel => duplicate claim
    contain_slack_ratio: float = 0.005      # split child may poke outside parent by this much
    split_residual_ratio: float = 0.005     # parent area left uncovered by children
    eps_area_m2: float = 0.01               # numerical noise floor
    surveyor_dispute_limit: int = 3         # disputes in 30 days before extra scrutiny
    max_lock_tiles: int = 400


POLICY = Policy()
NIGERIA_BBOX = (2.6, 4.2, 14.7, 13.9)       # lon_min, lat_min, lon_max, lat_max
NIGERIA_AOI = AreaOfInterest(*NIGERIA_BBOX)
CANDIDATE_STATUSES = ("ACTIVE", "PENDING_OWNER_APPROVAL", "UNDER_REVIEW", "DISPUTED")


class Verdict(str, Enum):
    ACCEPT = "ACCEPT"
    ACCEPT_WITH_WARNINGS = "ACCEPT_WITH_WARNINGS"
    REQUIRES_REVIEW = "REQUIRES_REVIEW"
    DISPUTE = "DISPUTE"
    REJECT_INVALID = "REJECT_INVALID"


_SEVERITY_TO_VERDICT = {"invalid": Verdict.REJECT_INVALID, "dispute": Verdict.DISPUTE,
                        "review": Verdict.REQUIRES_REVIEW, "warning": Verdict.ACCEPT_WITH_WARNINGS}
_RANK = [Verdict.ACCEPT, Verdict.ACCEPT_WITH_WARNINGS, Verdict.REQUIRES_REVIEW,
         Verdict.DISPUTE, Verdict.REJECT_INVALID]


@dataclass
class Finding:
    code: str
    severity: str                      # invalid | dispute | review | warning
    message: str
    parcel_id: str | None = None       # the other parcel involved, if any
    child_index: int | None = None     # which submitted polygon
    overlap_area_m2: float | None = None
    overlap_ratio: float | None = None

    def as_dict(self) -> dict:
        return {k: v for k, v in self.__dict__.items() if v is not None}


@dataclass
class Decision:
    findings: list[Finding] = field(default_factory=list)

    @property
    def verdict(self) -> Verdict:
        worst = Verdict.ACCEPT
        for f in self.findings:
            v = _SEVERITY_TO_VERDICT[f.severity]
            if _RANK.index(v) > _RANK.index(worst):
                worst = v
        return worst


@dataclass
class Candidate:
    id: str
    status: str
    uncertainty_m: float               # effective: survey accuracy combined with datum-transform accuracy
    geom_wgs: Polygon


class InvalidGeometry(ValueError):
    pass


# --------------------------------------------------------------------------- geometry
@lru_cache(maxsize=64)
def _transformer(src: int, dst: int) -> Transformer:
    # allow_ballpark=False: refuse to silently fall back to a "roughly right" datum shift.
    return Transformer.from_crs(src, dst, always_xy=True, area_of_interest=NIGERIA_AOI,
                                allow_ballpark=False)


@lru_cache(maxsize=16)
def _group(src: int) -> TransformerGroup:
    return TransformerGroup(src, 4326, always_xy=True, area_of_interest=NIGERIA_AOI, allow_ballpark=False)


def pick_transformer(src: int, x: float, y: float):
    """Choose the most accurate datum transformation whose area of use covers the parcel.
    Returns (transformer, accuracy_m). Local Nigerian datums (Minna) have several candidate
    operations with published accuracies of ~5-15 m: that uncertainty must flow into overlap checks."""
    group = _group(src)
    lon, lat = group.transformers[0].transform(x, y)
    best = None
    for t in group.transformers:
        a = t.area_of_use
        if a and not (a.west <= lon <= a.east and a.south <= lat <= a.north):
            continue
        acc = t.accuracy if t.accuracy is not None else -1.0
        if acc < 0:   # unknown: a pure projection of a WGS84-based CRS adds nothing; anything else is suspect
            acc = 0.0 if (src == 4326 or 32601 <= src <= 32660) else 30.0
        if best is None or acc < best[1]:
            best = (t, acc)
    if best is None:
        raise InvalidGeometry(f"no datum transformation from EPSG:{src} covers this location")
    return best


def _project(geom, t: Transformer):
    return shapely.transform(geom, lambda c: np.column_stack(t.transform(c[:, 0], c[:, 1])))


def utm_srid(lon: float, lat: float) -> int:
    """WGS84/UTM (northern hemisphere) EPSG code. Lagos is zone 31, i.e. EPSG:32631."""
    return 32600 + int((lon + 180) // 6) + 1


def ingest_polygon(geojson: dict, source_crs: int) -> tuple[Polygon, str, float]:
    """Parse a surveyor polygon -> (WGS84 polygon, transformation used, transformation accuracy in m)."""
    geom = shape(geojson)
    if geom.geom_type != "Polygon":
        raise InvalidGeometry(f"expected a single Polygon, got {geom.geom_type}")
    if source_crs == 4326:
        return geom, "identity", 0.0
    c = geom.centroid
    t, acc = pick_transformer(source_crs, c.x, c.y)
    return _project(geom, t), t.description.replace(" (with axis order normalized for visualization)", ""), acc


def to_metric(poly_wgs: Polygon, srid: int) -> Polygon:
    return _project(poly_wgs, _transformer(4326, srid))


def h3_cover(poly_wgs: Polygon, res: int = 12) -> list[int]:
    """OPTIONAL coarse cover for analytics/previews. NEVER used for a verdict.
    Center-containment can return nothing for small polygons, so vertex cells are added."""
    if h3 is None:
        return []
    cells = set(h3.geo_to_cells(poly_wgs, res))
    cells |= {h3.latlng_to_cell(y, x, res) for x, y in poly_wgs.exterior.coords}
    return sorted(h3.str_to_int(c) for c in cells)


def validate_wgs(poly_wgs: Polygon, idx: int) -> list[Finding]:
    """Checks that must pass before we project anything (bad CRS/axis order breaks the projection)."""
    if not poly_wgs.is_valid:
        return [Finding("INVALID_GEOMETRY", "invalid", explain_validity(poly_wgs), child_index=idx)]
    out: list[Finding] = []
    if len(poly_wgs.interiors):
        out.append(Finding("HAS_HOLES", "invalid", "Interior rings are not supported; submit enclaves separately.", child_index=idx))
    x0, y0, x1, y1 = poly_wgs.bounds
    if not (NIGERIA_BBOX[0] <= x0 and x1 <= NIGERIA_BBOX[2] and NIGERIA_BBOX[1] <= y0 and y1 <= NIGERIA_BBOX[3]):
        out.append(Finding("OUTSIDE_NIGERIA", "invalid", "Coordinates fall outside Nigeria; check CRS and axis order.", child_index=idx))
    return out


def validate_metric(poly_m: Polygon, declared_area: float | None, policy: Policy, idx: int) -> list[Finding]:
    out: list[Finding] = []
    area = poly_m.area
    if not (policy.min_area_m2 <= area <= policy.max_area_m2):
        out.append(Finding("AREA_OUT_OF_RANGE", "invalid", f"Computed area {area:.1f} m2 outside allowed range.", child_index=idx))
    if declared_area:
        diff = abs(area - declared_area) / declared_area
        if diff > policy.declared_area_tol:
            out.append(Finding("AREA_MISMATCH", "review",
                               f"Computed {area:.1f} m2 vs plan-stated {declared_area:.1f} m2 ({diff:.1%} apart).", child_index=idx))
    return out


def classify_pair(a: Polygon, ua: float, b: Polygon, ub: float, p: Policy) -> Finding | None:
    """Compare two parcels in a metric CRS, tolerating survey error.
    Each polygon is shrunk by its own positional uncertainty; if they still intersect, the
    overlap is bigger than measurement noise can explain (errors treated as additive: conservative)."""
    if not a.intersects(b):
        return None
    inter_area = a.intersection(b).area
    if inter_area < p.eps_area_m2:
        return None                                   # shared boundary / touching only
    ratio = inter_area / min(a.area, b.area)
    a_in, b_in = a.buffer(-ua), b.buffer(-ub)
    if a_in.is_empty or b_in.is_empty:
        return Finding("UNCERTAINTY_EXCEEDS_PARCEL", "review",
                       "Positional uncertainty is larger than the parcel; cannot rule overlap in or out.",
                       overlap_area_m2=round(inter_area, 2), overlap_ratio=round(ratio, 4))
    if a_in.intersection(b_in).area < p.eps_area_m2:
        return Finding("OVERLAP_WITHIN_TOLERANCE", "warning",
                       "Boundaries overlap by less than combined survey uncertainty.",
                       overlap_area_m2=round(inter_area, 2), overlap_ratio=round(ratio, 4))
    code = "DUPLICATE_CLAIM" if ratio >= p.duplicate_ratio else "MATERIAL_OVERLAP"
    return Finding(code, "dispute", "Overlap exceeds survey tolerance.",
                   overlap_area_m2=round(inter_area, 2), overlap_ratio=round(ratio, 4))


# --------------------------------------------------------------------------- pure evaluation
def evaluate_polygons(polys: list[Polygon], accuracy: str, declared: list[float | None],
                      candidates_for: list[list[Candidate]], policy: Policy = POLICY,
                      transform_accuracy_m: float = 0.0) -> Decision:
    """Pure core (no DB): validate each polygon, compare with its candidates, and with its siblings."""
    d = Decision()
    u = effective_uncertainty(accuracy, transform_accuracy_m, policy)
    if accuracy not in policy.auto_accept_classes:
        d.findings.append(Finding("LOW_ACCURACY", "review", f"{accuracy} surveys cannot be auto-accepted."))
    if transform_accuracy_m > policy.accuracy_m["DGPS"]:
        d.findings.append(Finding("LOCAL_DATUM_UNCERTAINTY", "review",
                                  f"Datum transformation is only good to ~{transform_accuracy_m:.0f} m; "
                                  "re-observe against control points or review manually."))
    if not polys:
        return Decision([Finding("EMPTY_PROPOSAL", "invalid", "No polygons submitted.")])

    for i, poly in enumerate(polys):
        d.findings += validate_wgs(poly, i)
    if any(f.severity == "invalid" for f in d.findings):
        return d

    c = unary_union(polys).centroid
    srid = utm_srid(c.x, c.y)          # one metric CRS for the whole proposal
    metric = [to_metric(p, srid) for p in polys]
    for i, pm in enumerate(metric):
        d.findings += validate_metric(pm, declared[i], policy, i)
    if any(f.severity == "invalid" for f in d.findings):
        return d

    for i, pm in enumerate(metric):
        for cand in candidates_for[i]:
            f = classify_pair(pm, u, to_metric(cand.geom_wgs, srid), cand.uncertainty_m, policy)
            if f:
                f.parcel_id, f.child_index = cand.id, i
                d.findings.append(f)
    d.findings += sibling_findings(metric, u, policy)
    return d


def effective_uncertainty(accuracy: str, transform_accuracy_m: float, policy: Policy = POLICY) -> float:
    return math.hypot(policy.accuracy_m[accuracy], transform_accuracy_m)


def sibling_findings(metric: list[Polygon], u: float, policy: Policy) -> list[Finding]:
    out = []
    for i in range(len(metric)):
        for j in range(i + 1, len(metric)):
            f = classify_pair(metric[i], u, metric[j], u, policy)
            if not f:
                continue
            if f.severity == "dispute":
                out.append(Finding("SIBLINGS_OVERLAP", "invalid",
                                   f"Submitted polygons {i} and {j} overlap each other.",
                                   child_index=i, overlap_area_m2=f.overlap_area_m2, overlap_ratio=f.overlap_ratio))
            else:
                out.append(f)
    return out


def split_findings(parent_wgs: Polygon, parent_u: float, children: list[Polygon],
                   child_u: float, parent_encumbered: bool, policy: Policy = POLICY) -> list[Finding]:
    """A split must partition its parent: children inside it, not overlapping, covering it."""
    out: list[Finding] = []
    c = parent_wgs.centroid
    srid = utm_srid(c.x, c.y)
    parent_m = to_metric(parent_wgs, srid)
    up, uc = parent_u, child_u
    kids = [to_metric(k, srid) for k in children]
    grown = parent_m.buffer(up + uc)
    for i, k in enumerate(kids):
        outside = k.difference(grown).area
        if outside > max(policy.eps_area_m2, policy.contain_slack_ratio * k.area):
            out.append(Finding("CHILD_OUTSIDE_PARENT", "review",
                               f"Child {i} extends {outside:.1f} m2 beyond the parent parcel.",
                               child_index=i, overlap_area_m2=round(outside, 2)))
    uncovered = parent_m.difference(unary_union(kids).buffer(up + uc)).area
    if uncovered > max(policy.eps_area_m2, policy.split_residual_ratio * parent_m.area):
        out.append(Finding("SPLIT_DOES_NOT_COVER_PARENT", "review",
                           f"{uncovered:.1f} m2 of the parent is not in any child; submit the remainder as a child."))
    if parent_encumbered:
        out.append(Finding("PARENT_ENCUMBERED", "review", "Parent has an active encumbrance; lender/holder consent required."))
    return out


# --------------------------------------------------------------------------- DB layer
@dataclass
class Child:
    geojson: dict
    declared_area_m2: float | None = None


@dataclass
class ProposalInput:
    kind: str                                  # NEW_PARCEL | SPLIT
    surveyor_id: str
    accuracy: str
    source_crs: int
    children: list[Child]
    parent_parcel_id: str | None = None
    owner_id: str | None = None                # required for NEW_PARCEL; inherited for SPLIT
    survey_plan_no: str | None = None
    root_title_hashes: list[str] = field(default_factory=list)   # hex sha256 of title documents


def lock_area(cur, bounds, policy: Policy = POLICY, tile: float = 0.01, pad: float = 0.0005):
    """Serialise proposals touching the same ~1 km tiles so two overlapping claims cannot both
    pass the check concurrently. Tiles are locked in sorted order to avoid deadlocks."""
    x0, y0, x1, y1 = bounds
    xs = range(math.floor((x0 - pad) / tile), math.floor((x1 + pad) / tile) + 1)
    ys = range(math.floor((y0 - pad) / tile), math.floor((y1 + pad) / tile) + 1)
    keys = sorted((x, y) for x in xs for y in ys)
    if len(keys) > policy.max_lock_tiles:
        raise InvalidGeometry("proposal footprint too large")
    for x, y in keys:
        cur.execute("SELECT pg_advisory_xact_lock(%s, %s)", (x + 1_000_000, y + 1_000_000))


def fetch_candidates(cur, poly_wgs: Polygon, pad_m: float, exclude_ids: list[str]) -> list[Candidate]:
    """Candidate search = PostGIS bounding-box (GiST) lookup. The exact decision happens in Python."""
    cur.execute(
        "SELECT id::text, status::text, uncertainty_m::float8, ST_AsBinary(geom) FROM parcels "
        "WHERE status::text = ANY(%s) AND NOT (id = ANY(%s::uuid[])) "
        "AND geom && ST_Expand(ST_GeomFromWKB(%s, 4326), %s)",
        (list(CANDIDATE_STATUSES), exclude_ids, poly_wgs.wkb, pad_m / 111_000.0))
    return [Candidate(r[0], r[1], r[2], shapely.from_wkb(bytes(r[3]))) for r in cur.fetchall()]


def _load_parent(cur, parcel_id: str) -> dict:
    cur.execute(
        "SELECT p.id::text, p.status::text, p.uncertainty_m::float8, ST_AsBinary(p.geom), p.owner_id::text,"
        " p.root_title_hashes, EXISTS (SELECT 1 FROM encumbrances e WHERE e.parcel_id = p.id AND e.status = 'ACTIVE')"
        " FROM parcels p WHERE p.id = %s FOR UPDATE", (parcel_id,))
    r = cur.fetchone()
    if not r:
        raise InvalidGeometry("parent parcel not found")
    return {"id": r[0], "status": r[1], "u": r[2], "geom": shapely.from_wkb(bytes(r[3])),
            "owner_id": r[4], "root_title_hashes": [bytes(h) for h in r[5]], "encumbered": r[6]}


def submit_proposal(conn, prop: ProposalInput, policy: Policy = POLICY) -> dict:
    """Run the full pipeline and persist the outcome atomically (psycopg 3 connection)."""
    try:
        parsed = [ingest_polygon(c.geojson, prop.source_crs) for c in prop.children]
        u_eff = effective_uncertainty(prop.accuracy, max(a for _, _, a in parsed), policy)
    except Exception as e:  # unparseable input is a verdict, not a 500
        return {"verdict": Verdict.REJECT_INVALID.value, "findings": [
            Finding("UNPARSEABLE", "invalid", str(e)).as_dict()], "parcel_ids": []}
    polys, ops = [p for p, _, _ in parsed], [o for _, o, _ in parsed]
    transform_acc = max(a for _, _, a in parsed)

    with conn.transaction():
        cur = conn.cursor()
        lock_area(cur, unary_union(polys).bounds, policy)
        parent = None
        exclude: list[str] = []
        if prop.kind == "SPLIT":
            parent = _load_parent(cur, prop.parent_parcel_id)
            if parent["status"] != "ACTIVE":
                raise InvalidGeometry("only ACTIVE parcels can be split")
            exclude = [parent["id"]]
        pad_m = u_eff + 50.0                       # generous bbox pre-filter; exact test follows
        cands = [fetch_candidates(cur, p, pad_m, exclude) for p in polys]
        decision = evaluate_polygons(polys, prop.accuracy, [c.declared_area_m2 for c in prop.children], cands, policy, transform_acc)

        if not any(f.severity == "invalid" for f in decision.findings):
            if prop.kind == "SPLIT":
                decision.findings += split_findings(parent["geom"], parent["u"], polys, u_eff,
                                                    parent["encumbered"], policy)
            else:
                if not prop.owner_id:
                    decision.findings.append(Finding("MISSING_OWNER", "invalid", "NEW_PARCEL requires owner_id."))
                if not prop.root_title_hashes:
                    decision.findings.append(Finding("NO_ROOT_OF_TITLE", "review", "No root-of-title document attached."))
            cur.execute("SELECT count(*) FROM proposals WHERE surveyor_id = %s AND verdict = 'DISPUTE' "
                        "AND created_at > now() - interval '30 days'", (prop.surveyor_id,))
            if cur.fetchone()[0] >= policy.surveyor_dispute_limit:
                decision.findings.append(Finding("SURVEYOR_DISPUTE_RATE", "review",
                                                 "Surveyor has several recent conflicting proposals."))

        verdict = decision.verdict
        cur.execute("INSERT INTO proposals (kind, surveyor_id, parent_parcel_id, verdict, findings) "
                    "VALUES (%s,%s,%s,%s,%s::jsonb) RETURNING id::text",
                    (prop.kind, prop.surveyor_id, prop.parent_parcel_id, verdict.value,
                     json.dumps([f.as_dict() for f in decision.findings])))
        proposal_id = cur.fetchone()[0]
        result = {"proposal_id": proposal_id, "verdict": verdict.value,
                  "findings": [f.as_dict() for f in decision.findings], "parcel_ids": []}
        if verdict == Verdict.REJECT_INVALID:
            return result

        status = {Verdict.ACCEPT: "PENDING_OWNER_APPROVAL", Verdict.ACCEPT_WITH_WARNINGS: "PENDING_OWNER_APPROVAL",
                  Verdict.REQUIRES_REVIEW: "UNDER_REVIEW", Verdict.DISPUTE: "DISPUTED"}[verdict]
        owner_id = prop.owner_id or (parent or {}).get("owner_id")
        title_hashes = [bytes.fromhex(h) for h in prop.root_title_hashes] or (parent or {}).get("root_title_hashes", [])
        salt = None
        if owner_id:
            cur.execute("SELECT commitment_salt FROM owners WHERE id = %s", (owner_id,))
            salt = bytes(cur.fetchone()[0])

        for i, poly in enumerate(polys):
            area = round(to_metric(poly, utm_srid(poly.centroid.x, poly.centroid.y)).area, 2)
            gh = geom_hash(poly)
            cur.execute(
                "INSERT INTO parcels (status, geom, area_m2, declared_area_m2, accuracy, uncertainty_m, source_crs,"
                " transform_op, geom_hash, owner_id, surveyor_id, survey_plan_no, root_title_hashes, h3_r12)"
                " VALUES (%s::parcel_status, ST_GeomFromWKB(%s, 4326), %s, %s, %s::accuracy_class, %s, %s, %s,"
                " %s, %s, %s, %s, %s, %s) RETURNING id::text",
                (status, poly.wkb, area, prop.children[i].declared_area_m2, prop.accuracy, round(u_eff, 3),
                 prop.source_crs, ops[i], gh, owner_id, prop.surveyor_id, prop.survey_plan_no, title_hashes,
                 h3_cover(poly)))
            pid = cur.fetchone()[0]
            result["parcel_ids"].append(pid)
            if parent:
                cur.execute("INSERT INTO parcel_lineage (child_id, parent_id, relation) VALUES (%s,%s,'SPLIT')",
                            (pid, parent["id"]))
            append_event(cur, pid, "PARCEL_PROPOSED", {
                "proposal_id": proposal_id, "kind": prop.kind, "verdict": verdict.value,
                "geom_hash": gh.hex(), "area_m2": f"{area:.2f}", "accuracy": prop.accuracy,
                "transform_op": ops[i], "parent_id": parent["id"] if parent else None,
                "owner_commitment": owner_commitment(owner_id, salt) if owner_id else None,
                "surveyor_ref": sha256(prop.surveyor_id.encode()).hex(),
                "root_title_hashes": sorted(h.hex() for h in title_hashes)}, actor_ref=f"surveyor:{prop.surveyor_id}")

        # Dispute routing: one TRIAGE row per (claimant child, incumbent). The incumbent's own chain and
        # status are untouched until an admin moves the dispute to OPEN.
        for f in decision.findings:
            if f.severity == "dispute" and f.parcel_id is not None and f.child_index is not None:
                cur.execute(
                    "INSERT INTO disputes (proposal_id, claimant_parcel_id, incumbent_parcel_id, code,"
                    " overlap_area_m2, overlap_ratio) VALUES (%s,%s,%s,%s,%s,%s)",
                    (proposal_id, result["parcel_ids"][f.child_index], f.parcel_id, f.code,
                     f.overlap_area_m2, f.overlap_ratio))
        return result

# NOTE (TOCTOU): the check above is a point-in-time answer. Re-run `fetch_candidates` + `classify_pair`
# for the child parcels inside the transaction that activates them (after owner approval), under
# the same `lock_area`, before flipping status to ACTIVE.
