import hashlib
import json
from shapely.geometry import Polygon

def sha256(data: bytes) -> bytes:
    return hashlib.sha256(data).digest()

def canonical_json(data: dict) -> bytes:
    def walk(obj):
        if isinstance(obj, float):
            raise TypeError("Floats not allowed in canonical JSON")
        if isinstance(obj, dict):
            return {k: walk(v) for k, v in sorted(obj.items())}
        if isinstance(obj, list):
            return [walk(v) for v in obj]
        return obj
    
    cleaned = walk(data)
    # The test expects: E.canonical_json({"b": 1, "a": [2, {"y": 1, "x": 2}]}) == b'{"a":[2,{"x":2,"y":1}],"b":1}'
    return json.dumps(cleaned, separators=(',', ':')).encode('utf-8')

def geom_hash(poly: Polygon) -> bytes:
    # Test: p = wgs(rect(0, 0, 20, 30))
    # rotated = Polygon(list(p.exterior.coords)[2:-1] + list(p.exterior.coords)[:2])
    # reversed_ = Polygon(list(p.exterior.coords)[::-1])
    # E.geom_hash(p) == E.geom_hash(rotated) == E.geom_hash(reversed_)
    
    # We round to avoid precision issues
    coords = [(round(x, 6), round(y, 6)) for x, y in poly.exterior.coords[:-1]]
    if not coords:
        return sha256(b"")
    
    # Find minimum vertex
    min_idx = min(range(len(coords)), key=lambda i: coords[i])
    
    # Check both directions
    dir1 = coords[min_idx:] + coords[:min_idx]
    dir2 = [coords[i % len(coords)] for i in range(min_idx, min_idx - len(coords), -1)]
    
    canonical_coords = min(dir1, dir2)
    canonical_str = ",".join(f"{x}:{y}" for x, y in canonical_coords)
    return sha256(canonical_str.encode('utf-8'))
