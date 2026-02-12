from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone

class OrderProduct(BaseModel):
    product_id: str
    product_name: str
    product_image: str
    variant_size: str
    variant_color: str
    quantity: int
    price: float

class ShippingAddress(BaseModel):
    name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    pincode: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    user_id: str
    products: List[OrderProduct]
    total_amount: float
    discount_amount: float = 0.0
    final_amount: float
    payment_method: str
    payment_status: str = "pending"
    order_status: str = "pending"
    razorpay_payment_id: Optional[str] = None
    shipping_address: ShippingAddress
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    products: List[OrderProduct]
    total_amount: float
    discount_amount: float = 0.0
    payment_method: str
    shipping_address: ShippingAddress
    coupon_code: Optional[str] = None