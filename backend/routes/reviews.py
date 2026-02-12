from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from middleware.auth import get_current_user
import uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/reviews", tags=["Reviews"])

db = None

def set_db(database):
    global db
    db = database

class ReviewCreate(BaseModel):
    product_id: str
    rating: int
    comment: str

@router.post("")
async def create_review(review: ReviewCreate, current_user: dict = Depends(get_current_user)):
    """Create a new product review"""
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    # Check if product exists
    product = await db.products.find_one({"id": review.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if user already reviewed this product
    existing_review = await db.reviews.find_one({
        "product_id": review.product_id,
        "user_id": current_user['user_id']
    })
    
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")
    
    # Get user info
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    
    review_doc = {
        "id": str(uuid.uuid4()),
        "product_id": review.product_id,
        "user_id": current_user['user_id'],
        "user_name": user.get('name', 'Anonymous'),
        "rating": review.rating,
        "comment": review.comment,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.reviews.insert_one(review_doc)
    
    # Update product ratings
    all_reviews = await db.reviews.find({"product_id": review.product_id}).to_list(1000)
    avg_rating = sum(r['rating'] for r in all_reviews) / len(all_reviews)
    
    await db.products.update_one(
        {"id": review.product_id},
        {
            "$set": {
                "ratings": round(avg_rating, 1),
                "total_reviews": len(all_reviews)
            }
        }
    )
    
    return review_doc

@router.get("/product/{product_id}")
async def get_product_reviews(product_id: str):
    """Get all reviews for a product"""
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for review in reviews:
        if isinstance(review.get('created_at'), str):
            review['created_at'] = datetime.fromisoformat(review['created_at'])
    
    return reviews

@router.delete("/{review_id}")
async def delete_review(review_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a review"""
    review = await db.reviews.find_one({"id": review_id})
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    if review['user_id'] != current_user['user_id'] and current_user.get('role') not in ['admin', 'supervisor', 'super_admin']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.reviews.delete_one({"id": review_id})
    
    # Update product ratings
    all_reviews = await db.reviews.find({"product_id": review['product_id']}).to_list(1000)
    if all_reviews:
        avg_rating = sum(r['rating'] for r in all_reviews) / len(all_reviews)
        await db.products.update_one(
            {"id": review['product_id']},
            {
                "$set": {
                    "ratings": round(avg_rating, 1),
                    "total_reviews": len(all_reviews)
                }
            }
        )
    else:
        await db.products.update_one(
            {"id": review['product_id']},
            {"$set": {"ratings": 0, "total_reviews": 0}}
        )
    
    return {"message": "Review deleted successfully"}