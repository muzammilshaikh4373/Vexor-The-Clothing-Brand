from fastapi import APIRouter, HTTPException, Query, Depends
from models.product import Product, ProductCreate, ProductUpdate, ProductVariant
from middleware.auth import get_current_user
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid
from typing import Optional, List
from datetime import datetime, timezone

router = APIRouter(prefix="/products", tags=["Products"])

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@router.get("")
async def get_products(
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = "newest",
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100)
):
    """Get products with filtering and pagination"""
    query = {}
    
    if category:
        query['category'] = category
    
    if min_price is not None or max_price is not None:
        query['price'] = {}
        if min_price is not None:
            query['price']['$gte'] = min_price
        if max_price is not None:
            query['price']['$lte'] = max_price
    
    # Sorting
    sort_options = {
        "newest": [("created_at", -1)],
        "price_low": [("price", 1)],
        "price_high": [("price", -1)],
        "popular": [("total_sold", -1)],
        "rating": [("ratings", -1)]
    }
    sort = sort_options.get(sort_by, [("created_at", -1)])
    
    # Count total
    total = await db.products.count_documents(query)
    
    # Get products
    skip = (page - 1) * limit
    products = await db.products.find(query, {"_id": 0}).sort(sort).skip(skip).limit(limit).to_list(limit)
    
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
    
    return {
        "products": products,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }

@router.get("/featured")
async def get_featured_products():
    """Get featured products"""
    products = await db.products.find({"is_featured": True}, {"_id": 0}).limit(8).to_list(8)
    
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
    
    return products

@router.get("/categories")
async def get_categories():
    """Get all unique categories"""
    categories = await db.products.distinct("category")
    return categories

@router.get("/{product_id}")
async def get_product(product_id: str):
    """Get single product by ID or slug"""
    product = await db.products.find_one(
        {"$or": [{"id": product_id}, {"slug": product_id}]},
        {"_id": 0}
    )
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    
    return product

@router.post("", dependencies=[Depends(get_current_user)])
async def create_product(product: ProductCreate):
    """Create new product (Admin only - will add role check)"""
    product_id = str(uuid.uuid4())
    slug = product.name.lower().replace(" ", "-") + "-" + product_id[:8]
    
    new_product = Product(
        id=product_id,
        slug=slug,
        **product.model_dump()
    )
    
    doc = new_product.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.products.insert_one(doc)
    
    return new_product

@router.put("/{product_id}", dependencies=[Depends(get_current_user)])
async def update_product(product_id: str, update_data: ProductUpdate):
    """Update product (Admin only - will add role check)"""
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return product

@router.delete("/{product_id}", dependencies=[Depends(get_current_user)])
async def delete_product(product_id: str):
    """Delete product (Admin only - will add role check)"""
    result = await db.products.delete_one({"id": product_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}