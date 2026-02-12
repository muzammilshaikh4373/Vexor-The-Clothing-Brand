from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone

class Coupon(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    code: str
    discount_percentage: float
    expiry_date: datetime
    usage_limit: int
    used_count: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CouponCreate(BaseModel):
    code: str
    discount_percentage: float
    expiry_date: datetime
    usage_limit: int

class CouponValidate(BaseModel):
    code: str
    cart_total: float