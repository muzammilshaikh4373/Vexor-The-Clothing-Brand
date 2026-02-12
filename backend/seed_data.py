"""Seed database with sample data for testing"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timedelta, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def seed_products():
    """Seed products"""
    products = [
        {
            "id": str(uuid.uuid4()),
            "name": "APEX PERFORMANCE HOODIE",
            "slug": "apex-performance-hoodie",
            "description": "Premium heavyweight hoodie with moisture-wicking technology. Perfect for workouts and street wear.",
            "category": "hoodies",
            "price": 3999,
            "discount_price": 2999,
            "images": [
                "https://images.unsplash.com/photo-1647768617268-06697e8a91d4?crop=entropy&cs=srgb&fm=jpg&q=85",
                "https://images.unsplash.com/photo-1556821840-3a63f95609a7?crop=entropy&cs=srgb&fm=jpg&q=85"
            ],
            "variants": [
                {"size": "S", "color": "Black", "stock": 10, "sku": "APH-BLK-S"},
                {"size": "M", "color": "Black", "stock": 15, "sku": "APH-BLK-M"},
                {"size": "L", "color": "Black", "stock": 12, "sku": "APH-BLK-L"},
                {"size": "XL", "color": "Black", "stock": 8, "sku": "APH-BLK-XL"},
            ],
            "stock": 45,
            "ratings": 4.8,
            "total_reviews": 124,
            "total_sold": 456,
            "is_featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "VELOCITY TRAINING TEE",
            "slug": "velocity-training-tee",
            "description": "Breathable performance tee with anti-odor technology. Designed for high-intensity training.",
            "category": "tshirts",
            "price": 1499,
            "discount_price": 999,
            "images": [
                "https://images.unsplash.com/photo-1544104030-d4ed20e87a86?crop=entropy&cs=srgb&fm=jpg&q=85",
                "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?crop=entropy&cs=srgb&fm=jpg&q=85"
            ],
            "variants": [
                {"size": "S", "color": "Red", "stock": 20, "sku": "VTT-RED-S"},
                {"size": "M", "color": "Red", "stock": 25, "sku": "VTT-RED-M"},
                {"size": "L", "color": "Red", "stock": 18, "sku": "VTT-RED-L"},
                {"size": "XL", "color": "Red", "stock": 12, "sku": "VTT-RED-XL"},
            ],
            "stock": 75,
            "ratings": 4.6,
            "total_reviews": 89,
            "total_sold": 678,
            "is_featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "STREET RUNNER JOGGERS",
            "slug": "street-runner-joggers",
            "description": "Tapered fit joggers with zippered pockets. Versatile enough for gym and street.",
            "category": "pants",
            "price": 2999,
            "discount_price": 2499,
            "images": [
                "https://images.unsplash.com/photo-1624378515195-6bbdb73dff1a?crop=entropy&cs=srgb&fm=jpg&q=85",
                "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?crop=entropy&cs=srgb&fm=jpg&q=85"
            ],
            "variants": [
                {"size": "S", "color": "Black", "stock": 8, "sku": "SRJ-BLK-S"},
                {"size": "M", "color": "Black", "stock": 15, "sku": "SRJ-BLK-M"},
                {"size": "L", "color": "Black", "stock": 10, "sku": "SRJ-BLK-L"},
                {"size": "XL", "color": "Black", "stock": 5, "sku": "SRJ-BLK-XL"},
            ],
            "stock": 38,
            "ratings": 4.7,
            "total_reviews": 156,
            "total_sold": 234,
            "is_featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "ELITE COMPRESSION TANK",
            "slug": "elite-compression-tank",
            "description": "Form-fitting compression tank for maximum performance. Sweat-wicking fabric.",
            "category": "tshirts",
            "price": 1299,
            "discount_price": None,
            "images": [
                "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?crop=entropy&cs=srgb&fm=jpg&q=85",
                "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?crop=entropy&cs=srgb&fm=jpg&q=85"
            ],
            "variants": [
                {"size": "S", "color": "White", "stock": 12, "sku": "ECT-WHT-S"},
                {"size": "M", "color": "White", "stock": 18, "sku": "ECT-WHT-M"},
                {"size": "L", "color": "White", "stock": 15, "sku": "ECT-WHT-L"},
            ],
            "stock": 45,
            "ratings": 4.5,
            "total_reviews": 67,
            "total_sold": 189,
            "is_featured": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "PHANTOM TRACK JACKET",
            "slug": "phantom-track-jacket",
            "description": "Lightweight track jacket with reflective details. Wind-resistant and water-repellent.",
            "category": "jackets",
            "price": 4999,
            "discount_price": 3999,
            "images": [
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?crop=entropy&cs=srgb&fm=jpg&q=85",
                "https://images.unsplash.com/photo-1516257984-b1b4d707412e?crop=entropy&cs=srgb&fm=jpg&q=85"
            ],
            "variants": [
                {"size": "M", "color": "Black", "stock": 10, "sku": "PTJ-BLK-M"},
                {"size": "L", "color": "Black", "stock": 8, "sku": "PTJ-BLK-L"},
                {"size": "XL", "color": "Black", "stock": 6, "sku": "PTJ-BLK-XL"},
            ],
            "stock": 24,
            "ratings": 4.9,
            "total_reviews": 201,
            "total_sold": 345,
            "is_featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "GRIND CARGO SHORTS",
            "slug": "grind-cargo-shorts",
            "description": "Functional cargo shorts with multiple pockets. Durable and comfortable.",
            "category": "shorts",
            "price": 2199,
            "discount_price": 1799,
            "images": [
                "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?crop=entropy&cs=srgb&fm=jpg&q=85",
                "https://images.unsplash.com/photo-1591195851280-0d04faa1c0ad?crop=entropy&cs=srgb&fm=jpg&q=85"
            ],
            "variants": [
                {"size": "S", "color": "Black", "stock": 15, "sku": "GCS-BLK-S"},
                {"size": "M", "color": "Black", "stock": 20, "sku": "GCS-BLK-M"},
                {"size": "L", "color": "Black", "stock": 12, "sku": "GCS-BLK-L"},
            ],
            "stock": 47,
            "ratings": 4.4,
            "total_reviews": 78,
            "total_sold": 267,
            "is_featured": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
    ]
    
    await db.products.delete_many({})
    await db.products.insert_many(products)
    print(f"✅ Seeded {len(products)} products")

async def seed_coupons():
    """Seed coupons"""
    coupons = [
        {
            "id": str(uuid.uuid4()),
            "code": "WELCOME10",
            "discount_percentage": 10,
            "expiry_date": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
            "usage_limit": 100,
            "used_count": 0,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "code": "FLASH25",
            "discount_percentage": 25,
            "expiry_date": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "usage_limit": 50,
            "used_count": 12,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.coupons.delete_many({})
    await db.coupons.insert_many(coupons)
    print(f"✅ Seeded {len(coupons)} coupons")

async def seed_admin_user():
    """Seed admin user"""
    admin_user = {
        "id": str(uuid.uuid4()),
        "phone": "9999999999",
        "role": "super_admin",
        "is_verified": True,
        "name": "Admin User",
        "email": "admin@vexor.com",
        "addresses": [],
        "wishlist": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    existing = await db.users.find_one({"phone": "9999999999"})
    if not existing:
        await db.users.insert_one(admin_user)
        print(f"✅ Seeded admin user (phone: 9999999999, OTP: 123456)")
    else:
        print(f"ℹ️  Admin user already exists")

async def main():
    print("🌱 Seeding database...")
    await seed_products()
    await seed_coupons()
    await seed_admin_user()
    print("✅ Database seeding complete!")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
