import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import api from '../../utils/api';
import { toast } from 'sonner';

export const AdminOrders = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !['admin', 'supervisor', 'super_admin'].includes(user?.role)) {
      navigate('/');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, user, navigate, filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const response = await api.get('/orders', { params });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status?order_status=${newStatus}`);
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-4xl tracking-tight uppercase">Manage Orders</h1>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Orders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-sm p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(order.order_status)}
                      <div>
                        <div className="text-xs text-gray-500">Order ID</div>
                        <div className="font-mono font-semibold">{order.id.slice(0, 24)}...</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Placed on{' '}
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Customer: {order.shipping_address.name} ({order.shipping_address.phone})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                    <div className="font-bold text-2xl">₹{order.final_amount.toFixed(2)}</div>
                    <div className="mt-2">
                      <Select
                        value={order.order_status}
                        onValueChange={(value) => handleStatusUpdate(order.id, value)}
                      >
                        <SelectTrigger className={`w-[160px] ${getStatusColor(order.order_status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="font-semibold text-sm mb-2">Products ({order.products.length})</div>
                      <div className="space-y-2">
                        {order.products.map((item, index) => (
                          <div key={index} className="flex gap-3 text-sm">
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-12 h-12 object-cover rounded-sm"
                            />
                            <div>
                              <div className="font-semibold">{item.product_name}</div>
                              <div className="text-gray-600">
                                {item.variant_size} / {item.variant_color} × {item.quantity}
                              </div>
                              <div className="font-bold">₹{item.price}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-sm mb-2">Shipping Address</div>
                      <div className="text-sm text-gray-700">
                        <div>{order.shipping_address.name}</div>
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
                      <div className="mt-3">
                        <div className="font-semibold text-sm">Payment</div>
                        <div className="text-sm text-gray-700">
                          {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                          <span className="ml-2 capitalize">({order.payment_status})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate(`/order-confirmation/${order.id}`)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" /> View Full Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};