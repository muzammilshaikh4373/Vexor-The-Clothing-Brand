import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import api from '../../utils/api';
import { toast } from 'sonner';

export const AdminProducts = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    discount_price: '',
    cost_price: '',
    images: '',
    stock: '',
    is_featured: false,
    variants: '',
  });

  useEffect(() => {
    if (!isAuthenticated || !['admin', 'supervisor', 'super_admin'].includes(user?.role)) {
      navigate('/');
      return;
    }
    fetchProducts();
  }, [isAuthenticated, user, navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products', { params: { limit: 100 } });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        stock: parseInt(formData.stock),
        images: formData.images.split(',').map((url) => url.trim()),
        variants: formData.variants
          ? JSON.parse(formData.variants)
          : [{ size: 'M', color: 'Black', stock: parseInt(formData.stock), sku: 'DEFAULT' }],
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, productData);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', productData);
        toast.success('Product created successfully');
      }

      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price.toString(),
      discount_price: product.discount_price?.toString() || '',
      cost_price: product.cost_price?.toString() || '',
      images: product.images.join(', '),
      stock: product.stock.toString(),
      is_featured: product.is_featured,
      variants: JSON.stringify(product.variants, null, 2),
    });
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      discount_price: '',
      cost_price: '',
      images: '',
      stock: '',
      is_featured: false,
      variants: '',
    });
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
          <h1 className="font-heading text-4xl tracking-tight uppercase">Manage Products</h1>
          <Button
            onClick={() => {
              resetForm();
              setEditingProduct(null);
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>

        {showForm && (
          <div className="bg-white border rounded-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-xl uppercase tracking-wide">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                  resetForm();
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Product Name *</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Category *</Label>
                  <Input
                    required
                    placeholder="hoodies, tshirts, pants, etc."
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Price (₹) *</Label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Discount Price (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.discount_price}
                    onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Stock *</Label>
                  <Input
                    required
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Image URLs (comma-separated) *</Label>
                <Input
                  required
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                />
              </div>

              <div>
                <Label>Variants (JSON format)</Label>
                <Textarea
                  rows={4}
                  placeholder='[{"size": "S", "color": "Black", "stock": 10, "sku": "PROD-BLK-S"}]'
                  value={formData.variants}
                  onChange={(e) => setFormData({ ...formData, variants: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="featured">Featured Product</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" /> Save Product
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border rounded-sm p-4 hover:border-primary transition-colors">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-48 object-cover rounded-sm mb-3"
              />
              <h3 className="font-bold text-lg mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-bold text-lg">₹{product.price}</span>
                  {product.discount_price && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ₹{product.discount_price}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-600">Stock: {product.stock}</span>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleEdit(product)} variant="outline" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button
                  onClick={() => handleDelete(product.id)}
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};