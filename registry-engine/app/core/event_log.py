"""event_log.py - canonical encoding, commitments and the append-only event log.

Hash definitions (shared with the SQL trigger in schema.sql):
    canonical_payload = canonical_json({"v":1, "type", "parcel_id", "parcel_seq", "body"})
    event_hash        = sha256(prev_hash || canonical_payload)
"""
from __future__ import annotations

import hashlib
import json
from uuid import UUID

import shapely
from shapely.geometry import Polygon
from shapely.geometry.polygon import orient

# Serialises event appends so global `seq` order == commit order. The anchoring job takes
# the same lock, which is what guarantees it never skips an in-flight event.
# (Registry writes are low-volume; if that ever changes, move to a single-writer queue.)
EVENT_LOG_LOCK = 0x4D6F5265  # "MoRe"
ZERO_HASH = bytes(32)

EVENT_TYPES = {
    "PARCEL_PROPOSED", "OWNER_APPROVED", "PARCEL_ACTIVATED", "PARCEL_RETIRED",
    "DISPUTE_OPENED", "DISPUTE_RESOLVED", "ENCUMBRANCE_ADDED", "ENCUMBRANCE_DISCHARGED",
    "OWNERSHIP_TRANSFERRED",
}


def sha256(b: bytes) -> bytes:
    return hashlib.sha256(b).digest()


def _reject_floats(o):
    if isinstance(o, float):
        raise TypeError("floats are not allowed in canonical payloads; use ints or strings")
    if isinstance(o, dict):
        for k, v in o.items():
            if not isinstance(k, str):
                raise TypeError("canonical payload keys must be strings")
            _reject_floats(v)
    elif isinstance(o, (list, tuple)):
        for v in o:
            _reject_floats(v)


def canonical_json(obj) -> bytes:
    """Deterministic JSON: sorted keys, no whitespace, UTF-8, no floats.
    (A pragmatic subset of RFC 8785; adopt a full JCS library if third parties will re-derive it.)"""
    _reject_floats(obj)
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def event_hash(prev_hash: bytes, canonical_payload: bytes) -> bytes:
    return sha256(prev_hash + canonical_payload)


def geom_hash(poly_wgs84: Polygon, grid: float = 1e-7) -> bytes:
    """sha256 of a canonical form of the geometry: snapped to ~1 cm, CCW exterior, normalised
    start vertex, 2D WKB. The same surveyed polygon always hashes to the same value."""
    g = shapely.set_precision(poly_wgs84, grid)
    g = orient(g, 1.0)
    g = shapely.normalize(g)
    return sha256(shapely.to_wkb(g, output_dimension=2, byte_order=1))


def owner_commitment(owner_id: str | UUID, salt: bytes) -> str:
    """Salted commitment so events can reference an owner without exposing who it is."""
    return sha256(bytes(salt) + UUID(str(owner_id)).bytes).hex()


def append_event(cur, parcel_id: str, event_type: str, body: dict, actor_ref: str | None = None):
    """Append one event to a parcel's chain. Must run inside the caller's transaction.
    Returns (seq, event_hash). The DB trigger re-verifies linkage and hash."""
    if event_type not in EVENT_TYPES:
        raise ValueError(f"unknown event type {event_type}")
    cur.execute("SELECT pg_advisory_xact_lock(%s)", (EVENT_LOG_LOCK,))
    cur.execute(
        "SELECT parcel_seq, event_hash FROM parcel_events "
        "WHERE parcel_id = %s ORDER BY parcel_seq DESC LIMIT 1", (str(parcel_id),))
    row = cur.fetchone()
    parcel_seq, prev = (row[0] + 1, bytes(row[1])) if row else (1, ZERO_HASH)

    payload = {"v": 1, "type": event_type, "parcel_id": str(parcel_id),
               "parcel_seq": parcel_seq, "body": body}
    canonical = canonical_json(payload)
    h = event_hash(prev, canonical)
    cur.execute(
        "INSERT INTO parcel_events (parcel_id, parcel_seq, event_type, payload, canonical_payload,"
        " prev_hash, event_hash, actor_ref) VALUES (%s,%s,%s,%s::jsonb,%s,%s,%s,%s) RETURNING seq",
        (str(parcel_id), parcel_seq, event_type, canonical.decode("utf-8"), canonical, prev, h, actor_ref))
    return cur.fetchone()[0], h


def verify_parcel_chain(events: list[dict]) -> bool:
    """events: [{parcel_seq, prev_hash, canonical_payload, event_hash}] for ONE parcel, ordered.
    Pure function: lets a lender or auditor re-check a chain without trusting our database."""
    prev = ZERO_HASH
    for i, e in enumerate(events, start=1):
        if e["parcel_seq"] != i or bytes(e["prev_hash"]) != prev:
            return False
        if event_hash(prev, bytes(e["canonical_payload"])) != bytes(e["event_hash"]):
            return False
        prev = bytes(e["event_hash"])
    return True
