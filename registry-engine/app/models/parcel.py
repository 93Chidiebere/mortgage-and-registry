from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from geoalchemy2 import Geometry
from app.db.database import Base

class ParcelStatus(str, enum.Enum):
    PENDING_APPROVAL = "PENDING_APPROVAL" # Surveyor proposed, waiting on landowner
    ACTIVE = "ACTIVE" # Accepted and valid
    RETIRED = "RETIRED" # Split or merged away (Historical)
    DISPUTED = "DISPUTED" # Overlap detected or legal flag

class Parcel(Base):
    __tablename__ = "parcels"

    id = Column(Integer, primary_key=True, index=True)
    
    # Dual-Key & Lineage Tracking
    owner_id = Column(Integer, ForeignKey("users.id"), index=True)
    surveyor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    parent_parcel_id = Column(Integer, ForeignKey("parcels.id"), nullable=True) 
    
    metadata_uri = Column(String) # Link to the digital survey plan PDF
    raw_geometry = Column(Geometry(geometry_type='POLYGON', srid=4326))
    status = Column(Enum(ParcelStatus), default=ParcelStatus.PENDING_APPROVAL)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships for ORM
    owner = relationship("User", foreign_keys=[owner_id])
    surveyor = relationship("User", foreign_keys=[surveyor_id])
    parent = relationship("Parcel", remote_side=[id])

class ParcelHash(Base):
    __tablename__ = "parcel_hashes"

    id = Column(Integer, primary_key=True, index=True)
    parcel_id = Column(Integer, ForeignKey("parcels.id"))
    h3_index = Column(String(15), index=True)
