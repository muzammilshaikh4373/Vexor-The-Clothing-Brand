from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone

class Address(BaseModel):
    id: str
    label: str
    name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    pincode: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: bool = False

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    phone: str
    role: str = "user"
    is_verified: bool = False
    name: Optional[str] = None
    email: Optional[str] = None
    addresses: List[Address] = []
    wishlist: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    phone: str
    name: Optional[str] = None
    email: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

class LoginRequest(BaseModel):
    phone: str

class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str