import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, Heart, LogOut, Edit } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { logout, updateUser } from '../store/slices/authSlice';
import api from '../utils/api';
import { toast } from 'sonner';

export const Profile = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    fetchProfile();
    fetchRecentOrders();
  }, [isAuthenticated, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      dispatch(updateUser(response.data));
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      setRecentOrders(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await api.put('/auth/me', formData);
      dispatch(updateUser(response.data));
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <div data-testid="profile-page" className="py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h1 className="font-heading text-4xl tracking-tight uppercase mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-4">
            <div className="border rounded-sm p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <div className="font-bold text-lg">{user?.name || 'Guest'}</div>
                  <div className="text-sm text-gray-600">{user?.phone}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/profile')}
                >
                  <User className="w-4 h-4 mr-2" /> Profile
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/orders')}
                >
                  <Package className="w-4 h-4 mr-2" /> Orders
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/wishlist')}
                >
                  <Heart className="w-4 h-4 mr-2" /> Wishlist
                </Button>
                <Button
                  data-testid="logout-button"
                  variant="ghost"
                  className="w-full justify-start text-accent hover:text-accent"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Info */}
            <div className="border rounded-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-xl uppercase tracking-wide">Profile Information</h2>
                {!editing && (
                  <Button
                    data-testid="edit-profile-button"
                    onClick={() => setEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                )}
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={user?.phone} disabled />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateProfile}>Save Changes</Button>
                    <Button onClick={() => setEditing(false)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-gray-600">Name</div>
                    <div className="font-semibold">{user?.name || 'Not provided'}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Email</div>
                    <div className="font-semibold">{user?.email || 'Not provided'}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Phone</div>
                    <div className="font-semibold">{user?.phone}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Role</div>
                    <div className="font-semibold capitalize">{user?.role}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="border rounded-sm p-6">
              <h2 className="font-bold text-xl uppercase tracking-wide mb-6">Recent Orders</h2>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No orders yet</p>
                  <Button onClick={() => navigate('/shop')} className="mt-4">
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-sm p-4 hover:border-primary transition-colors cursor-pointer"
                      onClick={() => navigate(`/order-confirmation/${order.id}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-xs text-gray-500">Order ID</div>
                          <div className="font-mono text-sm font-semibold">
                            {order.id.slice(0, 8)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Total</div>
                          <div className="font-bold">₹{order.final_amount.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`px-2 py-1 rounded-sm ${
                            order.order_status === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.order_status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {order.order_status.toUpperCase()}
                        </span>
                        <span className="text-gray-500">
                          {order.products.length} item{order.products.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                  <Button
                    onClick={() => navigate('/orders')}
                    variant="outline"
                    className="w-full"
                  >
                    View All Orders
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};