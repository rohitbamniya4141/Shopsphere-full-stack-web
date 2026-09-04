import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import AlertMessage from '../../components/common/AlertMessage';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [flashMessage, setFlashMessage] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/admin/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.post(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      setFlashMessage(`Order status updated to ${newStatus}`);
      await fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading platform orders..." />;
  }

  const allStatuses = ['Pending', 'Payment Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'];

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14 animate-fade-in-up">
      <AlertMessage
        type="success"
        message={flashMessage}
        onClose={() => setFlashMessage('')}
      />

      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-brand-500 to-brand-700"></div>
        <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 tracking-tight">Platform Orders</h1>
        <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold ml-2">
          {orders.length} orders
        </span>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon="ri-file-list-3-line"
          title="No Platform Orders"
          description="There are currently no orders in the system database."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-dark-400 uppercase text-[11px] font-semibold">
                  <th className="py-4 px-6">Order ID & Date</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Items Purchased</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => {
                  const items =
                    order.purchasedItems && order.purchasedItems.length > 0
                      ? order.purchasedItems
                      : (order.products || []).map((p) => ({ product: p }));

                  return (
                    <tr key={order._id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-dark-900 block">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-xs text-dark-400 mt-0.5 block">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <p className="font-bold text-dark-900">{order.user?.fullname || 'Customer'}</p>
                        <p className="text-xs text-dark-400">{order.user?.email || '—'}</p>
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-1 max-w-xs">
                          {items.map((item, idx) => (
                            <div key={idx} className="text-xs text-dark-700 truncate font-medium">
                              &bull; {item.product?.name || 'Product'} {item.qty ? `(x${item.qty})` : ''}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-6 font-extrabold text-dark-900">
                        ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-6">
                        <select
                          value={order.status}
                          disabled={updatingId === order._id}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="text-xs font-semibold py-1.5 px-3 rounded-xl bg-gray-50 border border-gray-200 text-dark-800 focus:outline-none focus:border-brand-500 cursor-pointer disabled:opacity-50"
                        >
                          {allStatuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <a
                          href={`/owners/orders/${order._id}/invoice`}
                          download
                          className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-brand-50 text-dark-600 hover:text-brand-600 inline-flex items-center justify-center transition-colors shadow-2xs"
                          title="Download Invoice"
                        >
                          <i className="ri-file-download-line text-sm"></i>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
