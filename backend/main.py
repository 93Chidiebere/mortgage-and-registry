from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

from app.core.spatial import polygon_to_h3
from app.api.transactions import router as transactions_router
from app.api.auth import router as auth_router

app = FastAPI(title="Geo-Hash Cadastral API")

app.include_router(transactions_router)
app.include_router(auth_router)

class PolygonRequest(BaseModel):
    coordinates: List[List[float]] # List of [lng, lat]
    
class PolygonResponse(BaseModel):
    h3_indices: List[str]
    count: int

@app.get("/")
def read_root():
    return {"message": "Geo-Hash API is running. Ready for spatial locking."}

@app.post("/api/v1/spatial/hash", response_model=PolygonResponse)
def hash_polygon(request: PolygonRequest):
    """
    Endpoint to test converting a GPS polygon to H3 Resolution 13 indices.
    """
    h3_indices_set = polygon_to_h3(request.coordinates, resolution=13)
    indices_list = list(h3_indices_set)
    return {
        "h3_indices": indices_list,
        "count": len(indices_list)
    }
