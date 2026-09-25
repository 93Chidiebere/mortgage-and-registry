from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

@router.post("/login")
def login(request: Dict[str, Any]):
    """
    Standard Web2 Login. Returns a JWT token.
    For MVP purposes, this is a mockup representing the authentication flow.
    """
    email = request.get("email")
    password = request.get("password")
    
    # In production: Verify hash against db, check User.is_verified if surveyor, etc.
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required.")
        
    return {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token", 
        "token_type": "bearer",
        "message": "Login successful."
    }

@router.post("/register")
def register(request: Dict[str, Any]):
    """
    Registration endpoint. Requires BVN and optionally SURCON number.
    """
    role = request.get("role", "LANDOWNER")
    surcon_number = request.get("surcon_number")
    
    # In production: Check BVN/NIN API, flag surveyor accounts for admin approval.
    status_msg = "Account created."
    if role == "SURVEYOR":
        status_msg += " Please wait for admin verification of your SURCON number."
        
    return {"message": status_msg}
