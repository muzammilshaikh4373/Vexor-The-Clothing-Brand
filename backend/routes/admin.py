from fastapi import APIRouter, HTTPException, Depends
from middleware.auth import get_current_user
from datetime import datetime, timedelta, timezone
from typing import Optional

router = APIRouter(prefix="/admin", tags=["Admin"])

db = None

def set_db(database):
    global db
    db = database

async def require_admin(current_user: dict = Depends(get_current_user)):
    """Middleware to check admin access"""
    if current_user.get('role') not in ['admin', 'supervisor', 'super_admin']:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/dashboard")
async def get_dashboard_stats(current_user: dict = Depends(require_admin)):
    """Get dashboard statistics with profit margin"""
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
    
    # Calculate profit
    completed_orders = await db.orders.find({"payment_status": "completed"}, {"_id": 0}).to_list(10000)
    total_profit = 0
    total_cost = 0
    
    for order in completed_orders:
        for item in order.get('products', []):
            product = await db.products.find_one({"id": item['product_id']}, {"_id": 0})
            if product and product.get('cost_price'):
                item_cost = product['cost_price'] * item['quantity']
                item_revenue = item['price'] * item['quantity']
                total_cost += item_cost
                total_profit += (item_revenue - item_cost)
    
    profit_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0
    
    total_users = await db.users.count_documents({})
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"order_status": "pending"})
    
    top_products = await db.products.find(
        {},
        {"_id": 0, "id": 1, "name": 1, "total_sold": 1, "price": 1, "cost_price": 1, "images": 1}
    ).sort("total_sold", -1).limit(5).to_list(5)
    
    return {
        "total_revenue": total_revenue,
        "monthly_sales": monthly_sales,
        "total_profit": total_profit,
        "profit_margin": round(profit_margin, 2),
        "total_cost": total_cost,
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

@router.get("/invoice/{order_id}")
async def get_invoice_data(order_id: str, current_user: dict = Depends(require_admin)):
    """Get invoice data for an order"""
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Get user details
    user = await db.users.find_one({"id": order['user_id']}, {"_id": 0})
    
    # Calculate totals with cost for profit calculation
    items_with_cost = []
    total_cost = 0
    
    for item in order['products']:
        product = await db.products.find_one({"id": item['product_id']}, {"_id": 0})
        cost_price = product.get('cost_price', 0) if product else 0
        item_cost = cost_price * item['quantity']
        total_cost += item_cost
        
        items_with_cost.append({
            **item,
            "cost_price": cost_price,
            "item_cost": item_cost,
            "item_profit": (item['price'] * item['quantity']) - item_cost
        })
    
    if isinstance(order.get('created_at'), str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return {
        "order": order,
        "user": user,
        "items_with_cost": items_with_cost,
        "total_cost": total_cost,
        "total_profit": order['final_amount'] - total_cost
    }