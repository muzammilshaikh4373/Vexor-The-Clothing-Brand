from fastapi import APIRouter, HTTPException, Depends
from middleware.auth import get_current_user
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

router = APIRouter(prefix="/admin", tags=["Admin"])

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def require_admin(current_user: dict = Depends(get_current_user)):
    """Middleware to check admin access"""
    if current_user.get('role') not in ['admin', 'supervisor', 'super_admin']:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/dashboard")
async def get_dashboard_stats(current_user: dict = Depends(require_admin)):
    """Get dashboard statistics"""
    # Total revenue
    pipeline_revenue = [
        {"$match": {"payment_status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$final_amount"}}}
    ]
    revenue_result = await db.orders.aggregate(pipeline_revenue).to_list(1)
    total_revenue = revenue_result[0]['total'] if revenue_result else 0
    
    # Monthly sales
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    pipeline_monthly = [
        {
            "$match": {
                "payment_status": "completed",
                "created_at": {"$gte": thirty_days_ago.isoformat()}
            }
        },
        {"$group": {"_id": None, "total": {"$sum": "$final_amount"}}}
    ]
    monthly_result = await db.orders.aggregate(pipeline_monthly).to_list(1)
    monthly_sales = monthly_result[0]['total'] if monthly_result else 0
    
    # Total users
    total_users = await db.users.count_documents({})
    
    # Total orders
    total_orders = await db.orders.count_documents({})
    
    # Pending orders
    pending_orders = await db.orders.count_documents({"order_status": "pending"})
    
    # Top selling products
    top_products = await db.products.find(
        {},
        {"_id": 0, "id": 1, "name": 1, "total_sold": 1, "price": 1, "images": 1}
    ).sort("total_sold", -1).limit(5).to_list(5)
    
    return {
        "total_revenue": total_revenue,
        "monthly_sales": monthly_sales,
        "total_users": total_users,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "top_products": top_products
    }

@router.get("/users")
async def get_all_users(current_user: dict = Depends(require_admin)):
    """Get all users"""
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    
    for user in users:
        if isinstance(user.get('created_at'), str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return users

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    current_user: dict = Depends(require_admin)
):
    """Update user role (Super Admin only)"""
    if current_user.get('role') != 'super_admin':
        raise HTTPException(status_code=403, detail="Super Admin access required")
    
    if role not in ['user', 'admin', 'supervisor', 'super_admin']:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"role": role}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User role updated successfully"}