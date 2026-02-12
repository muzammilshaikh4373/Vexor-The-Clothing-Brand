from fastapi import APIRouter, HTTPException, Depends
from models.coupon import Coupon, CouponCreate, CouponValidate
from middleware.auth import get_current_user
import uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/coupons", tags=["Coupons"])

db = None

def set_db(database):
    global db
    db = database

@router.post("", dependencies=[Depends(get_current_user)])
async def create_coupon(coupon: CouponCreate):
    """Create new coupon (Admin only)"""
    existing = await db.coupons.find_one({"code": coupon.code})
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")
    
    coupon_id = str(uuid.uuid4())
    new_coupon = Coupon(
        id=coupon_id,
        **coupon.model_dump()
    )
    
    doc = new_coupon.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['expiry_date'] = doc['expiry_date'].isoformat()
    
    await db.coupons.insert_one(doc)
    
    return new_coupon

@router.post("/validate")
async def validate_coupon(request: CouponValidate):
    """Validate coupon code"""
    coupon = await db.coupons.find_one(
        {"code": request.code, "is_active": True},
        {"_id": 0}
    )
    
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code")
    
    if isinstance(coupon.get('expiry_date'), str):
        coupon['expiry_date'] = datetime.fromisoformat(coupon['expiry_date'])
    if isinstance(coupon.get('created_at'), str):
        coupon['created_at'] = datetime.fromisoformat(coupon['created_at'])
    
    if coupon['expiry_date'] < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Coupon has expired")
    
    if coupon['used_count'] >= coupon['usage_limit']:
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")
    
    discount_amount = (request.cart_total * coupon['discount_percentage']) / 100
    final_amount = request.cart_total - discount_amount
    
    return {
        "valid": True,
        "coupon": coupon,
        "discount_amount": discount_amount,
        "final_amount": final_amount
    }

@router.get("")
async def get_coupons(current_user: dict = Depends(get_current_user)):
    """Get all coupons (Admin only)"""
    if current_user.get('role') not in ['admin', 'supervisor', 'super_admin']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    coupons = await db.coupons.find({}, {"_id": 0}).to_list(100)
    
    for coupon in coupons:
        if isinstance(coupon.get('expiry_date'), str):
            coupon['expiry_date'] = datetime.fromisoformat(coupon['expiry_date'])
        if isinstance(coupon.get('created_at'), str):
            coupon['created_at'] = datetime.fromisoformat(coupon['created_at'])
    
    return coupons

@router.delete("/{coupon_id}")
async def delete_coupon(coupon_id: str, current_user: dict = Depends(get_current_user)):
    """Delete coupon (Admin only)"""
    if current_user.get('role') not in ['admin', 'supervisor', 'super_admin']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = await db.coupons.delete_one({"id": coupon_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    
    return {"message": "Coupon deleted successfully"}