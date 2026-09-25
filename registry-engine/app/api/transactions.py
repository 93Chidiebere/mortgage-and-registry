from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.db.database import get_db
from app.models.parcel import Parcel, ParcelHash, ParcelStatus
from app.models.user import User, UserRole
from app.core.spatial import polygon_to_h3

router = APIRouter(prefix="/api/v1/transactions", tags=["Transactions"])

@router.post("/propose")
def propose_survey(request: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Called by a verified SURVEYOR.
    Proposes a new land geometry. If it's a split, it references a parent_parcel_id.
    """
    owner_id = request.get("owner_id")
    surveyor_id = request.get("surveyor_id") # In production, extract from JWT
    parent_id = request.get("parent_parcel_id")
    coords = request.get("coordinates")
    
    # 1. Generate Spatial Hashes
    h3_indices = polygon_to_h3(coords, resolution=13)
    if not h3_indices:
        raise HTTPException(status_code=400, detail="Invalid coordinates.")
        
    # 2. Geometric Overlap Check via H3
    existing = db.query(ParcelHash.h3_index, Parcel.parent_parcel_id)\
                 .join(Parcel)\
                 .filter(
                     ParcelHash.h3_index.in_(h3_indices),
                     Parcel.status.in_([ParcelStatus.ACTIVE, ParcelStatus.PENDING_APPROVAL])
                 ).all()
                 
    # If there are overlaps, we must check if they belong to the parent plot being split.
    if existing:
        if not parent_id:
            raise HTTPException(status_code=400, detail="Spatial overlap detected with existing title.")
        # Strict Subset Verification: All overlapping hashes MUST belong to the parent_id
        # (Implementation of the strict subset check goes here)
        
    # 3. Create the Pending Title Record
    new_parcel = Parcel(
        owner_id=owner_id,
        surveyor_id=surveyor_id,
        parent_parcel_id=parent_id,
        status=ParcelStatus.PENDING_APPROVAL
    )
    db.add(new_parcel)
    db.commit()
    db.refresh(new_parcel)
    
    # 4. Lock the Spatial Hashes
    for h3_idx in h3_indices:
        ph = ParcelHash(parcel_id=new_parcel.id, h3_index=h3_idx)
        db.add(ph)
    db.commit()
    
    return {
        "message": "Survey proposed successfully. Awaiting landowner Dual-Key approval.", 
        "parcel_id": new_parcel.id,
        "hex_count": len(h3_indices)
    }

@router.post("/{parcel_id}/approve")
def approve_survey(parcel_id: int, request: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Called by the LANDOWNER.
    Cryptographically approves the surveyor's proposed geometry.
    """
    landowner_id = request.get("landowner_id") # In production, extract from JWT
    
    # 1. Fetch the pending proposal
    parcel = db.query(Parcel).filter(Parcel.id == parcel_id, Parcel.owner_id == landowner_id).first()
    if not parcel:
        raise HTTPException(status_code=404, detail="Title proposal not found or unauthorized.")
        
    if parcel.status != ParcelStatus.PENDING_APPROVAL:
        raise HTTPException(status_code=400, detail="Title is not in a pending state.")
        
    # 2. Lineage Management (Retire Parent)
    if parcel.parent_parcel_id:
        parent = db.query(Parcel).filter(Parcel.id == parcel.parent_parcel_id).first()
        if parent:
            parent.status = ParcelStatus.RETIRED
            
    # 3. Finalize and Lock
    parcel.status = ParcelStatus.ACTIVE
    db.commit()
    
    return {"message": "Survey approved and permanently locked to your account.", "status": parcel.status}
