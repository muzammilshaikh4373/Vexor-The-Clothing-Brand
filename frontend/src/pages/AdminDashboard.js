import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import api from '../utils/api';

export const AdminDashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    if (!['admin', 'supervisor', 'super_admin'].includes(user?.role)) {
      navigate('/');
      return;
    }
    fetchDashboardStats();
  }, [isAuthenticated, user, navigate]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
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
    <div data-testid="admin-dashboard" className="py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-4xl tracking-tight uppercase">Admin Dashboard</h1>
          <div className="text-sm text-gray-600">
            Role: <span className="font-semibold capitalize">{user?.role}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border rounded-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm uppercase tracking-wider text-gray-600">Total Revenue</div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold">₹{stats?.total_revenue?.toFixed(2) || 0}</div>
          </div>

          <div className="bg-white border rounded-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm uppercase tracking-wider text-gray-600">Monthly Sales</div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold">₹{stats?.monthly_sales?.toFixed(2) || 0}</div>
          </div>

          <div className="bg-white border rounded-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm uppercase tracking-wider text-gray-600">Total Orders</div>
              <ShoppingBag className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-3xl font-bold">{stats?.total_orders || 0}</div>
            <div className="text-sm text-yellow-600 mt-2">
              {stats?.pending_orders || 0} pending
            </div>
          </div>

          <div className="bg-white border rounded-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm uppercase tracking-wider text-gray-600">Total Users</div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-3xl font-bold">{stats?.total_users || 0}</div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white border rounded-sm p-6 mb-8">
          <h2 className="font-bold text-xl uppercase tracking-wide mb-6">Top Selling Products</h2>
          <div className="space-y-4">
            {stats?.top_products?.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 border rounded-sm hover:border-primary transition-colors"
              >
                <div className="text-2xl font-bold text-gray-400 w-8">#{index + 1}</div>
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-sm"
                />
                <div className="flex-1">
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-sm text-gray-600">₹{product.price}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Sold</div>
                  <div className="font-bold text-lg">{product.total_sold}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-sm p-6 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="font-bold uppercase tracking-wide mb-2">Manage Products</h3>
            <p className="text-sm text-gray-600 mb-4">Add, edit, or remove products</p>
            <Button onClick={() => navigate('/admin/products')} className="w-full">
              Manage Products
            </Button>
          </div>

          <div className="border rounded-sm p-6 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="font-bold uppercase tracking-wide mb-2">Manage Orders</h3>
            <p className="text-sm text-gray-600 mb-4">View and update order status</p>
            <Button onClick={() => navigate('/admin/orders')} className="w-full">
              Manage Orders
            </Button>
          </div>

          <div className="border rounded-sm p-6 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="font-bold uppercase tracking-wide mb-2">Manage Users</h3>
            <p className="text-sm text-gray-600 mb-4">View users and manage roles</p>
            <Button className="w-full" disabled>
              Coming Soon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};