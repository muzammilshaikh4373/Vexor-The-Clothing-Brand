from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone

class ProductVariant(BaseModel):
    size: str
    color: str
    stock: int
    sku: str

class ProductReview(BaseModel):
    user_id: str
    user_name: str
    rating: int
    comment: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    slug: str
    description: str
    category: str
    price: float
    discount_price: Optional[float] = None
    cost_price: Optional[float] = None
    images: List[str] = []
    variants: List[ProductVariant] = []
    stock: int = 0
    ratings: float = 0.0
    total_reviews: int = 0
    total_sold: int = 0
    is_featured: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    category: str
    price: float
    discount_price: Optional[float] = None
    cost_price: Optional[float] = None
    images: List[str] = []
    variants: List[ProductVariant] = []
    stock: int = 0
    is_featured: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    discount_price: Optional[float] = None
    cost_price: Optional[float] = None
    images: Optional[List[str]] = None
    variants: Optional[List[ProductVariant]] = None
    stock: Optional[int] = None
    is_featured: Optional[bool] = None