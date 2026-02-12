import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { closeCart, removeFromCart, updateQuantity } from '../../store/slices/cartSlice';
import { Button } from '../ui/button';

export const CartDrawer = () => {
  const { isOpen, items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product.discount_price || item.product.price) * item.quantity,
    0
  );

  const handleCheckout = () => {
    dispatch(closeCart());
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            data-testid="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeCart())}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            data-testid="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[450px] bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-heading text-2xl uppercase tracking-tight">
                Cart ({items.length})
              </h2>
              <button
                data-testid="close-cart-button"
                onClick={() => dispatch(closeCart())}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div data-testid="empty-cart" className="text-center py-12">
                  <p className="text-gray-500 mb-4">Your cart is empty</p>
                  <Button
                    onClick={() => {
                      dispatch(closeCart());
                      navigate('/shop');
                    }}
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item, index) => (
                    <div key={index} data-testid={`cart-item-${index}`} className="flex gap-4">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-none"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm uppercase tracking-wide">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.variant.size} / {item.variant.color}
                        </p>
                        <p className="font-bold mt-2">
                          ₹{item.product.discount_price || item.product.price}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            data-testid={`decrease-quantity-${index}`}
                            onClick={() => {
                              if (item.quantity > 1) {
                                dispatch(
                                  updateQuantity({
                                    productId: item.product.id,
                                    variantSize: item.variant.size,
                                    variantColor: item.variant.color,
                                    quantity: item.quantity - 1,
                                  })
                                );
                              }
                            }}
                            className="p-1 border border-gray-300 hover:border-black transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            data-testid={`increase-quantity-${index}`}
                            onClick={() =>
                              dispatch(
                                updateQuantity({
                                  productId: item.product.id,
                                  variantSize: item.variant.size,
                                  variantColor: item.variant.color,
                                  quantity: item.quantity + 1,
                                })
                              )
                            }
                            className="p-1 border border-gray-300 hover:border-black transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            data-testid={`remove-item-${index}`}
                            onClick={() =>
                              dispatch(
                                removeFromCart({
                                  productId: item.product.id,
                                  variantSize: item.variant.size,
                                  variantColor: item.variant.color,
                                })
                              )
                            }
                            className="ml-auto p-2 hover:text-accent transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-6 space-y-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Subtotal:</span>
                  <span data-testid="cart-subtotal">₹{subtotal.toFixed(2)}</span>
                </div>
                <Button
                  data-testid="checkout-button"
                  onClick={handleCheckout}
                  className="w-full h-12 rounded-none uppercase tracking-widest"
                >
                  Checkout
                </Button>
                <button
                  onClick={() => dispatch(closeCart())}
                  className="w-full text-sm uppercase tracking-widest hover:text-accent transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};