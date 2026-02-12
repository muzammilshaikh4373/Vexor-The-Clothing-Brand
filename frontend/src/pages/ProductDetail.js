import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star, Check, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { addToCart, openCart } from '../store/slices/cartSlice';
import api from '../utils/api';
import { toast } from 'sonner';

export const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/products/${slug}`);
        setProduct(response.data);
        
        // Set default selections
        if (response.data.variants.length > 0) {
          setSelectedSize(response.data.variants[0].size);
          setSelectedColor(response.data.variants[0].color);
        }

        // Fetch reviews
        const reviewsResponse = await api.get(`/reviews/product/${response.data.id}`);
        setReviews(reviewsResponse.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Product not found');
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, navigate]);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color');
      return;
    }

    const variant = product.variants.find(
      (v) => v.size === selectedSize && v.color === selectedColor
    );

    if (!variant || variant.stock < quantity) {
      toast.error('Selected variant is out of stock');
      return;
    }

    dispatch(
      addToCart({
        product,
        variant,
        quantity,
      })
    );
    toast.success('Added to cart!');
    dispatch(openCart());
  };

  if (loading) {
    return (
      <div data-testid="loading-spinner" className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const discountPercentage = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const availableSizes = [...new Set(product.variants.map((v) => v.size))];
  const availableColors = [...new Set(product.variants.map((v) => v.color))];

  return (
    <div data-testid="product-detail-page" className="py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
              <img
                src={product.images[mainImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setMainImage(index)}
                  className={`aspect-square overflow-hidden bg-gray-100 border-2 ${
                    mainImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">
                {product.category}
              </p>
              <h1 className="font-heading text-4xl md:text-5xl tracking-tight uppercase mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                {product.discount_price ? (
                  <>
                    <span className="text-3xl font-bold text-accent">
                      ₹{product.discount_price}
                    </span>
                    <span className="text-xl text-gray-400 line-through">
                      ₹{product.price}
                    </span>
                    <span className="bg-accent text-white px-3 py-1 text-sm font-bold">
                      {discountPercentage}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold">₹{product.price}</span>
                )}
              </div>
              {product.ratings > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{product.ratings}</span>
                  </div>
                  <span className="text-gray-500">({product.total_reviews} reviews)</span>
                </div>
              )}
            </div>

            <p className="text-gray-700 mb-8 leading-relaxed">{product.description}</p>

            {/* Size Selection */}
            <div className="mb-6">
              <label className="block text-sm font-bold uppercase tracking-widest mb-3">
                Size
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    data-testid={`size-${size}`}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 border-2 font-semibold transition-all ${
                      selectedSize === size
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-8">
              <label className="block text-sm font-bold uppercase tracking-widest mb-3">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    data-testid={`color-${color}`}
                    onClick={() => setSelectedColor(color)}
                    className={`px-6 py-3 border-2 font-semibold transition-all ${
                      selectedColor === color
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <label className="block text-sm font-bold uppercase tracking-widest mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button
                  data-testid="decrease-quantity"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border border-gray-300 hover:border-black transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  data-testid="increase-quantity"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 border border-gray-300 hover:border-black transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                data-testid="add-to-cart-button"
                onClick={handleAddToCart}
                className="flex-1 h-14 rounded-none uppercase tracking-widest"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                data-testid="wishlist-button"
                variant="secondary"
                className="h-14 w-14 p-0 rounded-none"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="mt-8 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Free shipping on orders over ₹2999</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Easy returns within 30 days</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Secure payment options</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t pt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-3xl tracking-tight uppercase">
              Customer Reviews ({reviews.length})
            </h2>
            {isAuthenticated && (
              <Button onClick={() => setShowReviewForm(!showReviewForm)}>
                Write a Review
              </Button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="bg-muted p-6 rounded-sm mb-8">
              <h3 className="font-bold text-lg mb-4">Write Your Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="text-2xl"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= newReview.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Your Review</label>
                  <Textarea
                    rows={4}
                    placeholder="Share your experience with this product..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      try {
                        await api.post('/reviews', {
                          product_id: product.id,
                          rating: newReview.rating,
                          comment: newReview.comment,
                        });
                        toast.success('Review submitted successfully!');
                        setShowReviewForm(false);
                        setNewReview({ rating: 5, comment: '' });
                        const reviewsResponse = await api.get(`/reviews/product/${product.id}`);
                        setReviews(reviewsResponse.data);
                        const productResponse = await api.get(`/products/${slug}`);
                        setProduct(productResponse.data);
                      } catch (error) {
                        toast.error(error.response?.data?.detail || 'Failed to submit review');
                      }
                    }}
                  >
                    Submit Review
                  </Button>
                  <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold">{review.user_name}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};