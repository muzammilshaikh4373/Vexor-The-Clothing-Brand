import os
import uuid
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "vexor-super-secret-key-change-in-production-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24 * 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def generate_otp() -> str:
    """Mock OTP generation - returns fixed OTP for testing"""
    return "123456"

def verify_otp(phone: str, otp: str) -> bool:
    """Mock OTP verification - accepts 123456 for any phone"""
    return otp == "123456"

def send_whatsapp_message(phone: str, message: str) -> bool:
    """Mock WhatsApp message sending"""
    print(f"[MOCK WhatsApp] Sending to {phone}: {message}")
    return True

def initiate_razorpay_payment(amount: float, order_id: str) -> dict:
    """Mock Razorpay payment initiation"""
    return {
        "payment_id": f"pay_mock_{uuid.uuid4().hex[:16]}",
        "order_id": order_id,
        "amount": amount,
        "currency": "INR",
        "status": "created"
    }

def verify_razorpay_payment(payment_id: str, order_id: str, signature: str) -> bool:
    """Mock Razorpay payment verification"""
    print(f"[MOCK Razorpay] Verifying payment {payment_id} for order {order_id}")
    return True