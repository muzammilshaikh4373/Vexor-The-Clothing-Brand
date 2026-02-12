from fastapi import APIRouter, HTTPException, Depends
from models.user import User, UserCreate, UserUpdate, LoginRequest, VerifyOTPRequest, Address
from utils.auth import create_access_token, generate_otp, verify_otp
from middleware.auth import get_current_user
import uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/auth", tags=["Authentication"])

# DB will be injected by server.py
db = None

def set_db(database):
    global db
    db = database

@router.post("/login")
async def login(request: LoginRequest):
    """Send OTP to phone number (mock)"""
    otp = generate_otp()
    
    # Mock OTP sending
    print(f"[MOCK SMS] Sending OTP {otp} to {request.phone}")
    
    return {
        "message": "OTP sent successfully",
        "phone": request.phone,
        "mock_otp": otp
    }

@router.post("/verify-otp")
async def verify_otp_endpoint(request: VerifyOTPRequest):
    """Verify OTP and create/login user"""
    if not verify_otp(request.phone, request.otp):
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Check if user exists
    user_doc = await db.users.find_one({"phone": request.phone}, {"_id": 0})
    
    if not user_doc:
        # Create new user
        user_id = str(uuid.uuid4())
        new_user = User(
            id=user_id,
            phone=request.phone,
            is_verified=True,
            role="user"
        )
        
        doc = new_user.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.users.insert_one(doc)
        user_doc = doc
    else:
        # Update verification status
        await db.users.update_one(
            {"phone": request.phone},
            {"$set": {"is_verified": True}}
        )
        # Ensure datetime is properly formatted for JSON serialization
        if isinstance(user_doc['created_at'], str):
            # Keep it as string for JSON serialization
            pass
        else:
            user_doc['created_at'] = user_doc['created_at'].isoformat()
    
    # Create JWT token
    token = create_access_token({
        "user_id": user_doc['id'],
        "phone": user_doc['phone'],
        "role": user_doc['role']
    })
    
    return {
        "token": token,
        "user": user_doc
    }

@router.get("/me")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    user_doc = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return user_doc

@router.put("/me")
async def update_profile(update_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    """Update user profile"""
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No data to update")
    
    await db.users.update_one(
        {"id": current_user['user_id']},
        {"$set": update_dict}
    )
    
    user_doc = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    return user_doc

@router.post("/addresses")
async def add_address(address: Address, current_user: dict = Depends(get_current_user)):
    """Add new address"""
    address_dict = address.model_dump()
    address_dict['id'] = str(uuid.uuid4())
    
    await db.users.update_one(
        {"id": current_user['user_id']},
        {"$push": {"addresses": address_dict}}
    )
    
    return address_dict

@router.put("/addresses/{address_id}")
async def update_address(address_id: str, address: Address, current_user: dict = Depends(get_current_user)):
    """Update address"""
    user_doc = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    addresses = user_doc.get('addresses', [])
    updated = False
    
    for i, addr in enumerate(addresses):
        if addr['id'] == address_id:
            addresses[i] = address.model_dump()
            updated = True
            break
    
    if not updated:
        raise HTTPException(status_code=404, detail="Address not found")
    
    await db.users.update_one(
        {"id": current_user['user_id']},
        {"$set": {"addresses": addresses}}
    )
    
    return address

@router.delete("/addresses/{address_id}")
async def delete_address(address_id: str, current_user: dict = Depends(get_current_user)):
    """Delete address"""
    await db.users.update_one(
        {"id": current_user['user_id']},
        {"$pull": {"addresses": {"id": address_id}}}
    )
    
    return {"message": "Address deleted successfully"}

@router.post("/wishlist/{product_id}")
async def add_to_wishlist(product_id: str, current_user: dict = Depends(get_current_user)):
    """Add product to wishlist"""
    await db.users.update_one(
        {"id": current_user['user_id']},
        {"$addToSet": {"wishlist": product_id}}
    )
    
    return {"message": "Added to wishlist"}

@router.delete("/wishlist/{product_id}")
async def remove_from_wishlist(product_id: str, current_user: dict = Depends(get_current_user)):
    """Remove product from wishlist"""
    await db.users.update_one(
        {"id": current_user['user_id']},
        {"$pull": {"wishlist": product_id}}
    )
    
    return {"message": "Removed from wishlist"}