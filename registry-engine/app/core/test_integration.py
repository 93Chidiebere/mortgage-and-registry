import os
import threading
from pathlib import Path

import pytest
from pyproj import Transformer
from shapely.geometry import Polygon, box, mapping
import numpy as np
import shapely

import anchoring as A
import event_log as E
import overlap_pipeline as O

E0, N0 = 544200.0, 718500.0          # roughly central Lagos, UTM 31N (EPSG:32631)
_to_wgs = Transformer.from_crs(32631, 4326, always_xy=True).transform

def rect(e, n, w, h) -> Polygon:
    """Axis-aligned rectangle in metric UTM coordinates (for metric-space tests)."""
    return box(E0 + e, N0 + n, E0 + e + w, N0 + n + h)

def wgs(poly_m: Polygon) -> Polygon:
    return shapely.transform(poly_m, lambda c: np.column_stack(_to_wgs(c[:, 0], c[:, 1])))

# ------------------------------------------------------------------ merkle / canonical encoding
@pytest.mark.parametrize("n", list(range(1, 41)))
def test_every_proof_verifies_and_tampering_fails(n):
    leaves = [A.leaf_hash(E.sha256(bytes([i]))) for i in range(n)]
    levels = A.build_levels(leaves)
    root = A.merkle_root(levels)
    for i in range(n):
        path = A.inclusion_path(levels, i)
        assert A.verify_path(leaves[i], path, root)
        assert not A.verify_path(E.sha256(b"forged"), path, root)

def test_leaf_and_node_domains_are_separated():
    a, b = E.sha256(b"a"), E.sha256(b"b")
    assert A.leaf_hash(a + b) != A.node_hash(a, b)          # no second-preimage via fake leaf
    assert A.merkle_root(A.build_levels([A.leaf_hash(a)] * 3)) != A.merkle_root(A.build_levels([A.leaf_hash(a)] * 4))

def test_anchor_payload_layout():
    p = A.anchor_payload(5, 99, 95, bytes(32))
    assert len(p) == 57 and p[:4] == b"MORE" and p[4] == 1

def test_canonical_json_is_deterministic_and_rejects_floats():
    assert E.canonical_json({"b": 1, "a": [2, {"y": 1, "x": 2}]}) == b'{"a":[2,{"x":2,"y":1}],"b":1}'
    with pytest.raises(TypeError):
        E.canonical_json({"area": 12.5})

def test_geom_hash_ignores_vertex_order_and_orientation():
    p = wgs(rect(0, 0, 20, 30))
    rotated = Polygon(list(p.exterior.coords)[2:-1] + list(p.exterior.coords)[:2])
    reversed_ = Polygon(list(p.exterior.coords)[::-1])
    assert E.geom_hash(p) == E.geom_hash(rotated) == E.geom_hash(reversed_)
    assert E.geom_hash(p) != E.geom_hash(wgs(rect(0, 0, 20, 31)))

# ------------------------------------------------------------------ overlap classification
P = O.POLICY
TS, HAND = P.accuracy_m["TOTAL_STATION"], P.accuracy_m["HANDHELD"]

def test_adjoining_plots_sharing_a_boundary_are_fine():
    assert O.classify_pair(rect(0, 0, 20, 30), TS, rect(20, 0, 20, 30), TS, P) is None

def test_sliver_within_survey_noise_is_only_a_warning():
    f = O.classify_pair(rect(0, 0, 20, 30), TS, rect(19.92, 0, 20, 30), TS, P)   # 8 cm overlap
    assert f.code == "OVERLAP_WITHIN_TOLERANCE" and f.severity == "warning"

def test_three_metre_encroachment_is_a_dispute_for_precise_surveys():
    f = O.classify_pair(rect(0, 0, 20, 30), TS, rect(17, 0, 20, 30), TS, P)
    assert f.code == "MATERIAL_OVERLAP" and f.severity == "dispute"
    assert f.overlap_area_m2 == pytest.approx(90.0, abs=0.1)

def test_same_encroachment_is_inside_noise_for_handheld_gps():
    f = O.classify_pair(rect(0, 0, 20, 30), HAND, rect(17, 0, 20, 30), HAND, P)
    assert f.severity in ("warning", "review")           # handheld cannot adjudicate a 3 m encroachment

def test_identical_claim_is_duplicate():
    f = O.classify_pair(rect(0, 0, 20, 30), TS, rect(0, 0, 20, 30), TS, P)
    assert f.code == "DUPLICATE_CLAIM"

def test_minna_datum_is_transformed_and_its_uncertainty_is_carried():
    gj = mapping(rect(0, 0, 20, 30))
    minna, op, acc = O.ingest_polygon(gj, 26331)
    plain, op2, acc2 = O.ingest_polygon(gj, 32631)
    shift_m = O.to_metric(minna, 32631).centroid.distance(O.to_metric(plain, 32631).centroid)
    print(f"\nMinna->WGS84: shift {shift_m:.0f} m, transformation accuracy +/-{acc:.0f} m, op: {op}")
    assert "Minna" in op and shift_m > 50          
    assert acc >= 5 and acc2 == 0                  
    
    d = O.evaluate_polygons([minna], "TOTAL_STATION", [None], [[]], transform_accuracy_m=acc)
    assert d.verdict == O.Verdict.REQUIRES_REVIEW and d.findings[0].code == "LOCAL_DATUM_UNCERTAINTY"
    
    u = O.effective_uncertainty("TOTAL_STATION", acc)
    assert O.classify_pair(rect(0, 0, 20, 30), u, rect(17, 0, 20, 30), u, P).severity != "dispute"

def test_evaluate_clean_and_conflicting_proposals():
    existing = O.Candidate("inc-1", "ACTIVE", TS, wgs(rect(0, 0, 20, 30)))
    ok = O.evaluate_polygons([wgs(rect(20, 0, 20, 30))], "TOTAL_STATION", [600.0], [[existing]])
    assert ok.verdict == O.Verdict.ACCEPT
    bad = O.evaluate_polygons([wgs(rect(15, 0, 20, 30))], "TOTAL_STATION", [600.0], [[existing]])
    assert bad.verdict == O.Verdict.DISPUTE and bad.findings[0].parcel_id == "inc-1"
    swapped = O.evaluate_polygons([Polygon([(y, x) for x, y in wgs(rect(0, 0, 20, 30)).exterior.coords])],
                                  "TOTAL_STATION", [None], [[]])
    assert swapped.verdict == O.Verdict.REJECT_INVALID    
    assert O.evaluate_polygons([wgs(rect(40, 0, 20, 30))], "HANDHELD", [None], [[]]).verdict == O.Verdict.REQUIRES_REVIEW
    assert O.evaluate_polygons([wgs(rect(40, 0, 20, 30))], "TOTAL_STATION", [700.0], [[]]).verdict == O.Verdict.REQUIRES_REVIEW

def test_split_must_partition_parent():
    parent = wgs(rect(0, 0, 20, 40))
    halves = [wgs(rect(0, 0, 20, 20)), wgs(rect(0, 20, 20, 20))]
    assert O.split_findings(parent, TS, halves, TS, False) == []
    gap = O.split_findings(parent, TS, [halves[0]], TS, False)
    assert [f.code for f in gap] == ["SPLIT_DOES_NOT_COVER_PARENT"]
    poke = O.split_findings(parent, TS, [wgs(rect(0, 0, 20, 20)), wgs(rect(0, 20, 20, 25))], TS, False)
    assert "CHILD_OUTSIDE_PARENT" in [f.code for f in poke]
    assert "PARENT_ENCUMBERED" in [f.code for f in O.split_findings(parent, TS, halves, TS, True)]

# ------------------------------------------------------------------ live database
DB = os.getenv("DATABASE_URL")
db = pytest.mark.skipif(not DB, reason="set DATABASE_URL to run integration tests")

@pytest.fixture()
def conn():
    import psycopg
    c = psycopg.connect(DB, autocommit=True)
    c.execute("DROP SCHEMA public CASCADE")
    c.execute("CREATE SCHEMA public")
    c.execute((Path(__file__).parent / "schema.sql").read_text())
    yield c
    c.close()

def new_owner(conn):
    return str(conn.execute("INSERT INTO owners DEFAULT VALUES RETURNING id").fetchone()[0])

SURVEYOR_A = "11111111-1111-1111-1111-111111111111"
SURVEYOR_B = "22222222-2222-2222-2222-222222222222"
TITLE = [E.sha256(b"deed-of-assignment").hex()]

def proposal(owner, surveyor, polys_m, kind="NEW_PARCEL", parent=None, accuracy="TOTAL_STATION"):
    return O.ProposalInput(kind=kind, surveyor_id=surveyor, accuracy=accuracy, source_crs=4326,
                           children=[O.Child(mapping(wgs(p))) for p in polys_m], parent_parcel_id=parent,
                           owner_id=owner, root_title_hashes=TITLE)

@db
def test_clean_then_conflicting_claim_routes_to_triage_without_touching_incumbent(conn):
    owner, thief = new_owner(conn), new_owner(conn)
    a = O.submit_proposal(conn, proposal(owner, SURVEYOR_A, [rect(0, 0, 20, 30)]))
    assert a["verdict"] == "ACCEPT"
    conn.execute("UPDATE parcels SET status='ACTIVE' WHERE id=%s", (a["parcel_ids"][0],))

    b = O.submit_proposal(conn, proposal(thief, SURVEYOR_B, [rect(10, 0, 20, 30)]))
    assert b["verdict"] == "DISPUTE" and b["findings"][0]["code"] == "MATERIAL_OVERLAP"
    status = lambda pid: conn.execute("SELECT status::text FROM parcels WHERE id=%s", (pid,)).fetchone()[0]
    assert status(b["parcel_ids"][0]) == "DISPUTED" and status(a["parcel_ids"][0]) == "ACTIVE"
    d = conn.execute("SELECT status, incumbent_parcel_id::text FROM disputes").fetchall()
    assert d == [("TRIAGE", a["parcel_ids"][0])]
    n = conn.execute("SELECT count(*) FROM parcel_events WHERE parcel_id=%s", (a["parcel_ids"][0],)).fetchone()[0]
    assert n == 1                                            

@db
def test_log_is_append_only_and_database_verifies_hashes(conn):
    import psycopg
    owner = new_owner(conn)
    a = O.submit_proposal(conn, proposal(owner, SURVEYOR_A, [rect(0, 0, 20, 30)]))
    pid = a["parcel_ids"][0]
    for sql in ("UPDATE parcel_events SET actor_ref='x'", "DELETE FROM parcel_events", "TRUNCATE parcel_events"):
        with pytest.raises(psycopg.errors.RaiseException):
            conn.execute(sql)
    with pytest.raises(psycopg.errors.RaiseException):        
        conn.execute("INSERT INTO parcel_events (parcel_id,parcel_seq,event_type,payload,canonical_payload,prev_hash,event_hash)"
                     " SELECT parcel_id, 2, 'PARCEL_ACTIVATED', '{}', '\\x7b7d'::bytea, event_hash, repeat('ab',32)::bytea::bytea"
                     " FROM parcel_events WHERE parcel_id=%s" % ("'" + pid + "'"))

@db
def test_batch_receipts_verify_and_detect_tampering(conn):
    owner = new_owner(conn)
    for i in range(7):
        O.submit_proposal(conn, proposal(owner, SURVEYOR_A, [rect(i * 40, 0, 20, 30)]))
    bid = A.build_batch(conn, chain_id=80002)
    assert bid and A.build_batch(conn, chain_id=80002) is None          
    for seq, in conn.execute("SELECT seq FROM parcel_events ORDER BY seq").fetchall():
        r = A.get_receipt(conn, seq)
        assert A.verify_receipt(r)
        onchain = A.anchor_payload(r["first_seq"], r["last_seq"], r["leaf_count"], bytes.fromhex(r["merkle_root"]))
        assert A.verify_receipt(r, onchain_input=onchain)
        forged = dict(r, event=dict(r["event"], canonical_payload=r["event"]["canonical_payload"].replace("PROPOSED", "ACTIVATED")))
        assert not A.verify_receipt(forged)
    O.submit_proposal(conn, proposal(owner, SURVEYOR_A, [rect(400, 0, 20, 30)]))
    bid2 = A.build_batch(conn, chain_id=80002)
    ranges = conn.execute("SELECT first_seq, last_seq FROM anchor_batches ORDER BY id").fetchall()
    assert bid2 and ranges[1][0] == ranges[0][1] + 1

@db
def test_split_creates_lineage_and_checks_partition(conn):
    owner = new_owner(conn)
    p = O.submit_proposal(conn, proposal(owner, SURVEYOR_A, [rect(0, 0, 20, 40)]))
    pid = p["parcel_ids"][0]
    conn.execute("UPDATE parcels SET status='ACTIVE' WHERE id=%s", (pid,))
    ok = O.submit_proposal(conn, proposal(None, SURVEYOR_A, [rect(0, 0, 20, 20), rect(0, 20, 20, 20)], "SPLIT", pid))
    assert ok["verdict"] == "ACCEPT" and len(ok["parcel_ids"]) == 2
    assert conn.execute("SELECT count(*) FROM parcel_lineage WHERE parent_id=%s", (pid,)).fetchone()[0] == 2
    again = O.submit_proposal(conn, proposal(None, SURVEYOR_A, [rect(0, 0, 20, 20)], "SPLIT", pid))
    assert again["verdict"] == "DISPUTE"
    p2 = O.submit_proposal(conn, proposal(owner, SURVEYOR_A, [rect(200, 0, 20, 40)]))["parcel_ids"][0]
    conn.execute("UPDATE parcels SET status='ACTIVE' WHERE id=%s", (p2,))
    gap = O.submit_proposal(conn, proposal(None, SURVEYOR_A, [rect(200, 0, 20, 20)], "SPLIT", p2))
    assert gap["verdict"] == "REQUIRES_REVIEW" and gap["findings"][0]["code"] == "SPLIT_DOES_NOT_COVER_PARENT"

@db
def test_concurrent_overlapping_claims_cannot_both_pass(conn):
    import psycopg
    owners = [new_owner(conn) for _ in range(6)]
    results, barrier = [], threading.Barrier(6)

    def worker(i):
        c = psycopg.connect(DB, autocommit=True)
        barrier.wait()
        results.append(O.submit_proposal(c, proposal(owners[i], SURVEYOR_A, [rect(i, 0, 20, 30)])))   
        c.close()

    ts = [threading.Thread(target=worker, args=(i,)) for i in range(6)]
    [t.start() for t in ts]
    [t.join() for t in ts]
    assert sorted(r["verdict"] for r in results).count("ACCEPT") == 1     
