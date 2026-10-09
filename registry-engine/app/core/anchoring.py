import struct
from typing import List, Optional, Dict, Any
from event_log import sha256

def leaf_hash(data: bytes) -> bytes:
    return sha256(b'\x00' + data)

def node_hash(left: bytes, right: bytes) -> bytes:
    return sha256(b'\x01' + left + right)

def build_levels(leaves: List[bytes]) -> List[List[bytes]]:
    if not leaves:
        return []
    levels = [leaves]
    while len(levels[-1]) > 1:
        current = levels[-1]
        next_level = []
        for i in range(0, len(current), 2):
            if i + 1 < len(current):
                next_level.append(node_hash(current[i], current[i+1]))
            else:
                # pass odd node up
                next_level.append(current[i])
        levels.append(next_level)
    return levels

def merkle_root(levels: List[List[bytes]]) -> bytes:
    if not levels:
        return bytes(32)
    return levels[-1][0]

def inclusion_path(levels: List[List[bytes]], index: int) -> List[tuple]:
    path = []
    curr_idx = index
    for level in levels[:-1]:
        if curr_idx % 2 == 0:
            if curr_idx + 1 < len(level):
                path.append((True, level[curr_idx + 1])) # sibling is on the right
            # if no right sibling, nothing to append to path
        else:
            path.append((False, level[curr_idx - 1])) # sibling is on the left
        curr_idx //= 2
    return path

def verify_path(leaf: bytes, path: List[tuple], root: bytes) -> bool:
    curr = leaf
    for is_right_sibling, sibling_hash in path:
        if is_right_sibling:
            curr = node_hash(curr, sibling_hash)
        else:
            curr = node_hash(sibling_hash, curr)
    return curr == root

def anchor_payload(first_seq: int, last_seq: int, count: int, root: bytes) -> bytes:
    # Test requires: len(p) == 57 and p[:4] == b"MORE" and p[4] == 1
    # 57 bytes: 4 (MORE) + 1 (version=1) + 8 (first_seq) + 8 (last_seq) + 4 (count) + 32 (root) = 57
    return struct.pack(">4sBQQI32s", b"MORE", 1, first_seq, last_seq, count, root)

# Database integration stubs for later
def build_batch(conn, chain_id: int):
    # build the next batch from parcel_events
    # we'll implement this when writing the integration sql logic
    pass

def get_receipt(conn, seq: int) -> dict:
    pass

def verify_receipt(receipt: dict, onchain_input: bytes = None) -> bool:
    pass
