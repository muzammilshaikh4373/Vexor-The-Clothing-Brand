from fastapi import APIRouter, HTTPException, Depends
from models.order import Order, OrderCreate, OrderProduct, ShippingAddress
from middleware.auth import get_current_user
from utils.auth import initiate_razorpay_payment, verify_razorpay_payment, send_whatsapp_message
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid
from datetime import datetime, timezone
from typing import Optional

router = APIRouter(prefix="/orders", tags=["Orders"])

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@router.post("")
async def create_order(order_data: OrderCreate, current_user: dict = Depends(get_current_user)):
    """Create new order"""
    order_id = str(uuid.uuid4())
    
    # Calculate final amount
    final_amount = order_data.total_amount - order_data.discount_amount
    
    # Validate coupon if provided
    if order_data.coupon_code:
        coupon = await db.coupons.find_one(
            {"code": order_data.coupon_code, "is_active": True},
            {"_id": 0}
        )
        
        if not coupon:
            raise HTTPException(status_code=400, detail="Invalid coupon code")
        
        if isinstance(coupon.get('expiry_date'), str):
            coupon['expiry_date'] = datetime.fromisoformat(coupon['expiry_date'])
        
        if coupon['expiry_date'] < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Coupon expired")
        
        if coupon['used_count'] >= coupon['usage_limit']:
            raise HTTPException(status_code=400, detail="Coupon usage limit reached")
        
        # Update coupon usage
        await db.coupons.update_one(
            {"code": order_data.coupon_code},
            {"$inc": {"used_count": 1}}
        )
    
    # Handle payment
    payment_status = "pending"
    razorpay_payment_id = None
    
    if order_data.payment_method == "razorpay":
        payment_response = initiate_razorpay_payment(final_amount, order_id)
        razorpay_payment_id = payment_response['payment_id']
        payment_status = "completed"
    elif order_data.payment_method == "cod":
        payment_status = "pending"
    
    # Create order
    new_order = Order(
        id=order_id,
        user_id=current_user['user_id'],
        products=order_data.products,
        total_amount=order_data.total_amount,
        discount_amount=order_data.discount_amount,
        final_amount=final_amount,
        payment_method=order_data.payment_method,
        payment_status=payment_status,
        order_status="pending",
        razorpay_payment_id=razorpay_payment_id,
        shipping_address=order_data.shipping_address
    )
    
    doc = new_order.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.orders.insert_one(doc)
    
    # Update product stock
    for product in order_data.products:
        await db.products.update_one(
            {"id": product.product_id},
            {
                "$inc": {
                    "stock": -product.quantity,
                    "total_sold": product.quantity
                }
            }
        )
    
    # Send WhatsApp notification (mock)
    user_doc = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    customer_name = user_doc.get('name', 'Customer')
    customer_phone = user_doc.get('phone', '')
    
    whatsapp_message = f"""Hello {customer_name},
Your VEXOR order has been confirmed.

Order ID: {order_id}
Total: ₹{final_amount:.2f}

Thank you for shopping with VEXOR.
Built for Those Who Move Different."""
    
    send_whatsapp_message(customer_phone, whatsapp_message)
    
    return new_order

@router.get("/my-orders")
async def get_my_orders(current_user: dict = Depends(get_current_user)):
    """Get current user's orders"""
    orders = await db.orders.find(
        {"user_id": current_user['user_id']},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
        if isinstance(order.get('updated_at'), str):
            order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    
    return orders

@router.get("/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    """Get single order"""
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if order belongs to current user or user is admin
    if order['user_id'] != current_user['user_id'] and current_user.get('role') not in ['admin', 'supervisor', 'super_admin']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if isinstance(order.get('created_at'), str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    if isinstance(order.get('updated_at'), str):
        order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    
    return order

@router.get("")
async def get_all_orders(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all orders (Admin only)"""
    if current_user.get('role') not in ['admin', 'supervisor', 'super_admin']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = {}
    if status:
        query['order_status'] = status
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
        if isinstance(order.get('updated_at'), str):
            order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    
    return orders

@router.put("/{order_id}/status")
async def update_order_status(
    order_id: str,
    order_status: str,
    current_user: dict = Depends(get_current_user)
):
    """Update order status (Admin only)"""
    if current_user.get('role') not in ['admin', 'supervisor', 'super_admin']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = await db.orders.update_one(
        {"id": order_id},
        {
            "$set": {
                "order_status": order_status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated successfully"}