import h3

def polygon_to_h3(coordinates: list[list[float]], resolution: int = 13) -> set[str]:
    """
    Converts a polygon (list of [lng, lat] points) to a set of covering H3 indices.
    
    Args:
        coordinates: A list of [longitude, latitude] pairs forming a polygon.
        resolution: The H3 resolution. Default is 13 (~14m edge length).
        
    Returns:
        A set of H3 hexadecimal index strings.
    """
    if not coordinates:
        return set()
        
    # h3 v4 expects coordinates as (lat, lng) tuples
    lat_lng_coords = [(pt[1], pt[0]) for pt in coordinates]
    
    try:
        # h3-py 4.x API
        polygon = h3.LatLngPoly(lat_lng_coords)
        hexagons = h3.polygon_to_cells(polygon, resolution)
    except AttributeError:
        # h3-py 3.x API fallback
        # Ensure closed polygon for GeoJSON
        if coordinates[0] != coordinates[-1]:
            coordinates.append(coordinates[0])
        geo_json = {
            "type": "Polygon",
            "coordinates": [coordinates]
        }
        hexagons = h3.polyfill(geo_json, resolution, geo_json_conformant=True)
        
    return set(hexagons)
