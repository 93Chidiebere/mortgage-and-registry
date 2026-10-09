"""anchoring.py - Merkle-batch the event log and anchor each batch root on Polygon.

What gets anchored is the EVENT LOG (not a snapshot of ACTIVE parcels), so splits, disputes,
retirements and transfers are all provable after the fact.

Tree: leaf = sha256(0x00 || event_hash); node = sha256(0x01 || left || right).
An odd node is promoted unchanged (never duplicated), and the leaf count is bound into the
on-chain payload, so the tree shape is unambiguous.

On-chain payload (57 bytes, zero-value self-transaction):
    b"MORE" | 0x01 | first_seq (u64 BE) | last_seq (u64 BE) | leaf_count (u32 BE) | merkle_root (32)
"""
from __future__ import annotations

import os
import struct

from event_log import EVENT_LOG_LOCK, event_hash, sha256

MAGIC, VERSION = b"MORE", 1
LEAF, NODE = b"\x00", b"\x01"
CONFIRMATIONS = int(os.getenv("ANCHOR_CONFIRMATIONS", "128"))  # tune to your finality requirements


# --------------------------------------------------------------------------- merkle (pure)
def leaf_hash(ev_hash: bytes) -> bytes:
    return sha256(LEAF + ev_hash)


def node_hash(left: bytes, right: bytes) -> bytes:
    return sha256(NODE + left + right)


def build_levels(leaves: list[bytes]) -> list[list[bytes]]:
    if not leaves:
        raise ValueError("cannot build a tree with no leaves")
    levels = [list(leaves)]
    while len(levels[-1]) > 1:
        cur, nxt = levels[-1], []
        for i in range(0, len(cur), 2):
            nxt.append(node_hash(cur[i], cur[i + 1]) if i + 1 < len(cur) else cur[i])
        levels.append(nxt)
    return levels


def merkle_root(levels: list[list[bytes]]) -> bytes:
    return levels[-1][0]


def inclusion_path(levels: list[list[bytes]], index: int) -> list[tuple[str, bytes]]:
    """Return [(side_of_sibling, sibling_hash)] from leaf to root. A promoted node has no sibling."""
    path, idx = [], index
    for level in levels[:-1]:
        sib = idx ^ 1
        if sib < len(level):
            path.append(("L" if sib < idx else "R", level[sib]))
        idx //= 2
    return path


def verify_path(leaf: bytes, path: list[tuple[str, bytes]], expected_root: bytes) -> bool:
    h = leaf
    for side, sib in path:
        h = node_hash(sib, h) if side == "L" else node_hash(h, sib)
    return h == expected_root


def anchor_payload(first_seq: int, last_seq: int, count: int, root: bytes) -> bytes:
    return MAGIC + bytes([VERSION]) + struct.pack(">QQI", first_seq, last_seq, count) + root


# --------------------------------------------------------------------------- batching (DB)
def build_batch(conn, chain_id: int) -> int | None:
    """Freeze the next unanchored range of events into a PENDING batch. Returns batch id or None.
    Holding EVENT_LOG_LOCK waits for in-flight appends to commit, so no committed event can end up
    with a seq below an already-anchored range."""
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("SELECT pg_advisory_xact_lock(%s)", (EVENT_LOG_LOCK,))
        cur.execute("SELECT COALESCE(MAX(last_seq), 0) FROM anchor_batches WHERE status <> 'FAILED'")
        last = cur.fetchone()[0]
        cur.execute("SELECT seq, event_hash FROM parcel_events WHERE seq > %s ORDER BY seq", (last,))
        rows = cur.fetchall()
        if not rows:
            return None
        levels = build_levels([leaf_hash(bytes(r[1])) for r in rows])
        cur.execute(
            "INSERT INTO anchor_batches (first_seq, last_seq, leaf_count, merkle_root, chain_id)"
            " VALUES (%s,%s,%s,%s,%s) RETURNING id",
            (rows[0][0], rows[-1][0], len(rows), merkle_root(levels), chain_id))
        return cur.fetchone()[0]


def submit_batch(conn, batch_id: int, w3, account):
    """Sign and broadcast the anchor transaction. The tx hash is persisted BEFORE broadcasting, so a crash
    never loses track of a transaction that may have landed. Polygon PoS gas is paid in POL."""
    from web3 import Web3

    cur = conn.cursor()
    cur.execute("SELECT first_seq, last_seq, leaf_count, merkle_root, chain_id, status FROM anchor_batches WHERE id=%s",
                (batch_id,))
    first, last, count, root, chain_id, status = cur.fetchone()
    if status != "PENDING":
        raise RuntimeError(f"batch {batch_id} is {status}, expected PENDING")

    prio = max(w3.eth.max_priority_fee, Web3.to_wei(30, "gwei"))      # Polygon enforces a 30 gwei tip floor
    base = w3.eth.get_block("latest")["baseFeePerGas"]
    tx = {"chainId": chain_id, "from": account.address, "to": account.address, "value": 0,
          "data": anchor_payload(first, last, count, bytes(root)),
          "nonce": w3.eth.get_transaction_count(account.address, "pending"),
          "maxFeePerGas": 2 * base + prio, "maxPriorityFeePerGas": prio}
    tx["gas"] = w3.eth.estimate_gas(tx)
    signed = account.sign_transaction(tx)
    raw = getattr(signed, "raw_transaction", None) or signed.rawTransaction   # web3 v7 / v6
    tx_hash = "0x" + bytes(signed.hash).hex()

    with conn.transaction():
        conn.execute("UPDATE anchor_batches SET status='SUBMITTED', tx_hash=%s WHERE id=%s", (tx_hash, batch_id))
    w3.eth.send_raw_transaction(raw)
    return tx_hash


def confirm_batches(conn, w3):
    """Cron: promote SUBMITTED batches to CONFIRMED once deep enough, after reading the payload back
    from the chain and checking it matches what we meant to anchor."""
    cur = conn.cursor()
    cur.execute("SELECT id, tx_hash, first_seq, last_seq, leaf_count, merkle_root FROM anchor_batches "
                "WHERE status='SUBMITTED' ORDER BY id")
    for bid, tx_hash, first, last, count, root in cur.fetchall():
        try:
            receipt = w3.eth.get_transaction_receipt(tx_hash)
        except Exception:
            continue                                   # not mined yet; a stuck tx is an ops alert, not an auto-fail
        if receipt["status"] != 1:
            with conn.transaction():
                conn.execute("UPDATE anchor_batches SET status='FAILED' WHERE id=%s", (bid,))
            continue
        if w3.eth.block_number - receipt["blockNumber"] < CONFIRMATIONS:
            continue
        onchain = bytes(w3.eth.get_transaction(tx_hash)["input"])
        if onchain != anchor_payload(first, last, count, bytes(root)):
            raise RuntimeError(f"batch {bid}: on-chain payload does not match database")
        with conn.transaction():
            conn.execute("UPDATE anchor_batches SET status='CONFIRMED', block_number=%s, confirmed_at=now() WHERE id=%s",
                         (receipt["blockNumber"], bid))


# --------------------------------------------------------------------------- receipts
def get_receipt(conn, event_seq: int) -> dict:
    """Self-contained proof that one event existed in the registry's anchored history."""
    cur = conn.cursor()
    cur.execute("SELECT id, first_seq, last_seq, leaf_count, merkle_root, chain_id, tx_hash, status FROM anchor_batches "
                "WHERE first_seq <= %s AND last_seq >= %s AND status <> 'FAILED'", (event_seq, event_seq))
    b = cur.fetchone()
    if not b:
        raise LookupError("event not yet in an anchor batch")
    bid, first, last, count, root, chain_id, tx_hash, status = b
    cur.execute("SELECT seq, event_hash FROM parcel_events WHERE seq BETWEEN %s AND %s ORDER BY seq", (first, last))
    rows = cur.fetchall()
    levels = build_levels([leaf_hash(bytes(r[1])) for r in rows])
    index = [r[0] for r in rows].index(event_seq)
    cur.execute("SELECT parcel_id::text, parcel_seq, prev_hash, canonical_payload, event_hash FROM parcel_events WHERE seq=%s",
                (event_seq,))
    pid, pseq, prev, canon, eh = cur.fetchone()
    return {"batch_id": bid, "batch_status": status, "chain_id": chain_id, "tx_hash": tx_hash,
            "first_seq": first, "last_seq": last, "leaf_count": count, "merkle_root": bytes(root).hex(),
            "event": {"seq": event_seq, "parcel_id": pid, "parcel_seq": pseq, "prev_hash": bytes(prev).hex(),
                      "canonical_payload": bytes(canon).decode("utf-8"), "event_hash": bytes(eh).hex()},
            "path": [(s, h.hex()) for s, h in inclusion_path(levels, index)]}


def verify_receipt(receipt: dict, onchain_input: bytes | None = None) -> bool:
    """Offline check. Pass the anchor tx's `input` bytes (from any Polygon node/explorer) to also
    confirm the root really was published on-chain."""
    ev = receipt["event"]
    eh = event_hash(bytes.fromhex(ev["prev_hash"]), ev["canonical_payload"].encode("utf-8"))
    if eh.hex() != ev["event_hash"]:
        return False
    path = [(s, bytes.fromhex(h)) for s, h in receipt["path"]]
    root = bytes.fromhex(receipt["merkle_root"])
    if not verify_path(leaf_hash(eh), path, root):
        return False
    if onchain_input is not None:
        want = anchor_payload(receipt["first_seq"], receipt["last_seq"], receipt["leaf_count"], root)
        return bytes(onchain_input) == want
    return True
