import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import api from '../utils/api';

export const Orders = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-600" />;
      default:
        return <Package className="w-5 h-5 text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div data-testid="orders-page" className="py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h1 className="font-heading text-4xl tracking-tight uppercase mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
            <Button onClick={() => navigate('/shop')}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border rounded-sm p-6 hover:border-primary transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(order.order_status)}
                      <div>
                        <div className="text-xs text-gray-500">Order ID</div>
                        <div className="font-mono font-semibold">{order.id.slice(0, 16)}...</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                    <div className="font-bold text-2xl">₹{order.final_amount.toFixed(2)}</div>
                    <div
                      className={`inline-block px-3 py-1 rounded-sm text-xs font-semibold mt-2 ${
                        order.order_status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.order_status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : order.order_status === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.order_status.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.products.map((item, index) => (
                      <div key={index} className="flex gap-3">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded-sm"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-semibold line-clamp-1">
                            {item.product_name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {item.variant_size} / {item.variant_color}
                          </div>
                          <div className="text-xs text-gray-600">Qty: {item.quantity}</div>
                          <div className="text-sm font-bold">₹{item.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t">
                  <Button
                    onClick={() => navigate(`/order-confirmation/${order.id}`)}
                    variant="outline"
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  {order.order_status === 'pending' && (
                    <Button variant="outline" className="flex-1">
                      Track Order
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};