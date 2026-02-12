import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { clearCart } from '../store/slices/cartSlice';
import api from '../utils/api';
import { toast } from 'sonner';

export const Checkout = () => {
  const { items } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    label: 'Home',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    if (items.length === 0) {
      navigate('/shop');
      return;
    }
    fetchAddresses();
  }, [isAuthenticated, items, navigate]);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/auth/me');
      setAddresses(response.data.addresses || []);
      if (response.data.addresses?.length > 0) {
        setSelectedAddress(response.data.addresses[0].id);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.address_line1 || 
        !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const response = await api.post('/auth/addresses', newAddress);
      setAddresses([...addresses, response.data]);
      setSelectedAddress(response.data.id);
      setShowAddressForm(false);
      setNewAddress({
        name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        label: 'Home',
      });
      toast.success('Address added successfully');
    } catch (error) {
      toast.error('Failed to add address');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    
    try {
      const response = await api.post('/coupons/validate', {
        code: couponCode,
        cart_total: subtotal,
      });
      setDiscount(response.data.discount_amount);
      toast.success(`Coupon applied! You saved ₹${response.data.discount_amount}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid coupon code');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    setLoading(true);
    try {
      const selectedAddr = addresses.find((a) => a.id === selectedAddress);
      
      const orderData = {
        products: items.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          product_image: item.product.images[0],
          variant_size: item.variant.size,
          variant_color: item.variant.color,
          quantity: item.quantity,
          price: item.product.discount_price || item.product.price,
        })),
        total_amount: subtotal,
        discount_amount: discount,
        payment_method: paymentMethod,
        shipping_address: selectedAddr,
        coupon_code: couponCode || null,
      };

      const response = await api.post('/orders', orderData);
      dispatch(clearCart());
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product.discount_price || item.product.price) * item.quantity,
    0
  );
  const total = subtotal - discount;

  return (
    <div data-testid="checkout-page" className="py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h1 className="font-heading text-4xl tracking-tight uppercase mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Address */}
            <div>
              <h2 className="font-bold text-xl uppercase tracking-wide mb-4">
                Delivery Address
              </h2>
              
              {addresses.length > 0 && (
                <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="flex items-start gap-3 p-4 border rounded-sm hover:border-primary transition-colors"
                      >
                        <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                        <label htmlFor={addr.id} className="flex-1 cursor-pointer">
                          <div className="font-semibold">
                            {addr.name} - {addr.label}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {addr.address_line1}, {addr.address_line2 && `${addr.address_line2}, `}
                            {addr.city}, {addr.state} - {addr.pincode}
                          </div>
                          <div className="text-sm text-gray-600">Phone: {addr.phone}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              <Button
                data-testid="add-address-button"
                onClick={() => setShowAddressForm(!showAddressForm)}
                variant="outline"
                className="mt-4 w-full"
              >
                <Plus className="w-4 h-4 mr-2" /> Add New Address
              </Button>

              {showAddressForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 border rounded-sm space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Phone *</Label>
                      <Input
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Address Line 1 *</Label>
                    <Input
                      value={newAddress.address_line1}
                      onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Address Line 2</Label>
                    <Input
                      value={newAddress.address_line2}
                      onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>City *</Label>
                      <Input
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>State *</Label>
                      <Input
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Pincode *</Label>
                      <Input
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddAddress} className="w-full">
                    Save Address
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <h2 className="font-bold text-xl uppercase tracking-wide mb-4">
                Payment Method
              </h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 border rounded-sm">
                    <RadioGroupItem value="cod" id="cod" />
                    <label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="font-semibold">Cash on Delivery</div>
                      <div className="text-sm text-gray-600">Pay when you receive</div>
                    </label>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-sm">
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <label htmlFor="razorpay" className="flex-1 cursor-pointer">
                      <div className="font-semibold">Online Payment (MOCKED)</div>
                      <div className="text-sm text-gray-600">UPI, Cards, Net Banking</div>
                    </label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="border rounded-sm p-6 sticky top-24">
              <h2 className="font-bold text-xl uppercase tracking-wide mb-4">
                Order Summary
              </h2>
              
              <div className="space-y-3 mb-6">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{item.product.name}</div>
                      <div className="text-xs text-gray-600">
                        {item.variant.size} / {item.variant.color} × {item.quantity}
                      </div>
                      <div className="text-sm font-bold mt-1">
                        ₹{(item.product.discount_price || item.product.price) * item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mb-4">
                <Input
                  data-testid="coupon-input"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
                <Button onClick={handleApplyCoupon} variant="outline">
                  Apply
                </Button>
              </div>

              <div className="space-y-2 py-4 border-t border-b">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg mt-4 mb-6">
                <span>Total</span>
                <span data-testid="order-total">₹{total.toFixed(2)}</span>
              </div>

              <Button
                data-testid="place-order-button"
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddress}
                className="w-full h-12 rounded-none uppercase tracking-widest"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};