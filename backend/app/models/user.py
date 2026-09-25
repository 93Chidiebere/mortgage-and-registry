from sqlalchemy import Column, Integer, String, Boolean, Enum
import enum
from app.db.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    SURVEYOR = "SURVEYOR"
    LANDOWNER = "LANDOWNER"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), default=UserRole.LANDOWNER)
    
    # KYC / Identity Verification
    full_name = Column(String, nullable=True)
    bvn = Column(String, nullable=True, unique=True)
    
    # Surveyor Specific
    surcon_number = Column(String, nullable=True, unique=True)
    
    # Approval Flag (Admin must toggle this after manual SURCON check)
    is_verified = Column(Boolean, default=False)
