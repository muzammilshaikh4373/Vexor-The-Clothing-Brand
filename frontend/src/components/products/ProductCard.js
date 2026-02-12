import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart, openCart } from '../../store/slices/cartSlice';
import { toast } from 'sonner';

export const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    
    if (product.variants && product.variants.length > 0) {
      const defaultVariant = product.variants[0];
      dispatch(
        addToCart({
          product,
          variant: defaultVariant,
          quantity: 1,
        })
      );
      toast.success('Added to cart!');
      dispatch(openCart());
    } else {
      navigate(`/product/${product.slug}`);
    }
  };

  const discountPercentage = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  return (
    <motion.div
      data-testid="product-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/product/${product.slug}`)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <motion.img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-4 left-4 bg-accent text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">
            {discountPercentage}% OFF
          </div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute bottom-4 left-4 right-4 flex gap-2"
        >
          <button
            data-testid="quick-add-button"
            onClick={handleQuickAdd}
            className="flex-1 bg-primary text-white h-12 uppercase tracking-widest text-xs font-bold hover:bg-black transition-colors"
          >
            Quick Add
          </button>
          <button
            data-testid="wishlist-button"
            onClick={(e) => {
              e.stopPropagation();
              toast.success('Added to wishlist!');
            }}
            className="bg-white w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <Heart className="w-5 h-5" />
          </button>
        </motion.div>
      </div>

      {/* Product Info */}
      <div className="mt-4 space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
          {product.category}
        </p>
        <h3 className="font-bold text-sm uppercase tracking-wide">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          {product.discount_price ? (
            <>
              <span className="font-bold text-accent">₹{product.discount_price}</span>
              <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
            </>
          ) : (
            <span className="font-bold">₹{product.price}</span>
          )}
        </div>
        {product.ratings > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span>⭐ {product.ratings}</span>
            <span>({product.total_reviews})</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};