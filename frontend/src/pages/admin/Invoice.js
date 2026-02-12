import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import api from '../../utils/api';

export const Invoice = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    if (!isAuthenticated || !['admin', 'supervisor', 'super_admin'].includes(user?.role)) {
      navigate('/');
      return;
    }
    fetchInvoice();
  }, [isAuthenticated, user, navigate, orderId]);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/invoice/${orderId}`);
      setInvoiceData(response.data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!invoiceData) return null;

  const { order, user: customer, items_with_cost, total_cost, total_profit } = invoiceData;

  return (
    <div className="py-24">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Print Actions */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Button variant="outline" onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
          </Button>
          <div className="flex gap-2">
            <Button onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" /> Print Invoice
            </Button>
          </div>
        </div>

        {/* Invoice Content */}
        <div ref={printRef} className="bg-white border rounded-sm p-8 print:border-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 pb-8 border-b">
            <div>
              <img 
                src="https://customer-assets.emergentagent.com/job_vexor-shop/artifacts/h1mp10k8_WhatsApp%20Image%202026-02-12%20at%202.24.27%20PM.jpeg" 
                alt="VEXOR Logo" 
                className="h-20 mb-4"
              />
              <p className="text-sm text-gray-600">RAW STREET WEAR</p>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-heading font-bold mb-2">INVOICE</h1>
              <p className="text-sm text-gray-600">Invoice #: {order.id.slice(0, 12).toUpperCase()}</p>
              <p className="text-sm text-gray-600">
                Date: {new Date(order.created_at).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-sm uppercase mb-2">Bill To:</h3>
              <div className="text-sm">
                <p className="font-semibold">{order.shipping_address.name}</p>
                <p>{order.shipping_address.phone}</p>
                {customer?.email && <p>{customer.email}</p>}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase mb-2">Ship To:</h3>
              <div className="text-sm">
                <p>{order.shipping_address.address_line1}</p>
                {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                </p>
              </div>
            </div>
          </div>

          {/* Order Details Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-3 text-sm uppercase font-bold">Item</th>
                <th className="text-center py-3 text-sm uppercase font-bold">Qty</th>
                <th className="text-right py-3 text-sm uppercase font-bold">Price</th>
                <th className="text-right py-3 text-sm uppercase font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.products.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3">
                    <div className="font-semibold">{item.product_name}</div>
                    <div className="text-xs text-gray-600">
                      {item.variant_size} / {item.variant_color}
                    </div>
                  </td>
                  <td className="text-center py-3">{item.quantity}</td>
                  <td className="text-right py-3">₹{item.price.toFixed(2)}</td>
                  <td className="text-right py-3 font-semibold">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2 text-sm">
                <span>Subtotal:</span>
                <span>₹{order.total_amount.toFixed(2)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between py-2 text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-₹{order.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 text-sm">
                <span>Shipping:</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-black font-bold text-lg">
                <span>Total:</span>
                <span>₹{order.final_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment & Status Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-sm uppercase mb-2">Payment Method:</h3>
              <p className="text-sm capitalize">
                {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
              </p>
              <p className="text-sm text-gray-600">Status: {order.payment_status}</p>
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase mb-2">Order Status:</h3>
              <p className="text-sm capitalize font-semibold">{order.order_status}</p>
            </div>
          </div>

          {/* Admin Only - Profit Info */}
          <div className="bg-gray-50 p-4 rounded-sm print:hidden">
            <h3 className="font-bold text-sm uppercase mb-3">Admin Info (Not Printed)</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Cost:</span>
                <p className="font-bold">₹{total_cost.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-600">Total Profit:</span>
                <p className="font-bold text-green-600">₹{total_profit.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-600">Profit Margin:</span>
                <p className="font-bold text-green-600">
                  {((total_profit / order.final_amount) * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
            <p className="font-semibold mb-2">Thank you for your business!</p>
            <p>For any queries, please contact us at support@vexor.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};