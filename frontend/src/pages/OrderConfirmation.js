import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, MapPin, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';
import api from '../utils/api';

export const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div data-testid="order-confirmation-page" className="py-24">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
          <h1 className="font-heading text-4xl tracking-tight uppercase mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600">Thank you for shopping with VEXOR</p>
          <p className="text-sm text-gray-500 mt-2">
            Order ID: <span className="font-mono font-semibold">{order.id}</span>
          </p>
        </motion.div>

        <div className="bg-muted p-6 rounded-sm mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-5 h-5" />
            <h2 className="font-bold uppercase tracking-wide">Order Details</h2>
          </div>
          <div className="space-y-3">
            {order.products.map((item, index) => (
              <div key={index} className="flex gap-4 bg-white p-3 rounded-sm">
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="w-16 h-16 object-cover"
                />
                <div className="flex-1">
                  <div className="font-semibold text-sm">{item.product_name}</div>
                  <div className="text-xs text-gray-600">
                    {item.variant_size} / {item.variant_color} × {item.quantity}
                  </div>
                  <div className="text-sm font-bold mt-1">₹{item.price * item.quantity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border p-4 rounded-sm">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-wide text-sm">Shipping Address</h3>
            </div>
            <div className="text-sm text-gray-700">
              <div className="font-semibold">{order.shipping_address.name}</div>
              <div>{order.shipping_address.address_line1}</div>
              {order.shipping_address.address_line2 && (
                <div>{order.shipping_address.address_line2}</div>
              )}
              <div>
                {order.shipping_address.city}, {order.shipping_address.state} -{' '}
                {order.shipping_address.pincode}
              </div>
              <div>Phone: {order.shipping_address.phone}</div>
            </div>
          </div>

          <div className="border p-4 rounded-sm">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-wide text-sm">Payment Info</h3>
            </div>
            <div className="text-sm text-gray-700">
              <div className="mb-2">
                <span className="font-semibold">Method:</span>{' '}
                {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Status:</span>{' '}
                <span className="capitalize">{order.payment_status}</span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between mb-1">
                  <span>Subtotal:</span>
                  <span>₹{order.total_amount.toFixed(2)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between mb-1 text-green-600">
                    <span>Discount:</span>
                    <span>-₹{order.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>Total:</span>
                  <span>₹{order.final_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-sm mb-8">
          <p className="text-sm text-blue-800">
            <strong>WhatsApp Notification Sent!</strong> (MOCKED) - You'll receive updates about
            your order on your registered mobile number.
          </p>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/orders')}
            variant="outline"
            className="flex-1 h-12 rounded-none uppercase tracking-widest"
          >
            View Orders
          </Button>
          <Button
            onClick={() => navigate('/shop')}
            className="flex-1 h-12 rounded-none uppercase tracking-widest"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};