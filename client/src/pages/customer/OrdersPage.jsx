import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import AlertMessage from '../../components/common/AlertMessage';

export default function OrdersPage() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [flashMessage, setFlashMessage] = useState({
    type: location.state?.successMessage ? 'success' : '',
    text: location.state?.successMessage || ''
  });

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/orders');
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

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancellingId(orderId);
    try {
      const res = await api.post(`/api/orders/${orderId}/cancel`);
      setFlashMessage({ type: 'success', text: res.data.message || 'Order cancelled successfully' });
      await fetchOrders();
    } catch (err) {
      setFlashMessage({ type: 'error', text: err.message || 'Failed to cancel order' });
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading your orders..." />;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <EmptyState
          icon="ri-file-list-3-line"
          title="No Orders Yet"
          description="You haven't placed any orders with ShopSphere yet. Start exploring our exclusive collection!"
          actionText="Browse Collection"
          actionLink="/shop"
        />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Shipped':
      case 'Out For Delivery':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Packed':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Payment Confirmed':
      case 'Pending':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getImageSrc = (product) => {
    if (!product?.image) return '/images/1bag.png';
    if (product.image.startsWith('data:') || product.image.startsWith('http')) return product.image;
    if (product.image.startsWith('/images/')) return product.image;
    return `/images/${product.image}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14 animate-fade-in-up">
      <AlertMessage
        type={flashMessage.type}
        message={flashMessage.text}
        onClose={() => setFlashMessage({ type: '', text: '' })}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-brand-500 to-brand-700"></div>
        <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 tracking-tight">My Orders</h1>
        <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold ml-2">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </span>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => {
          const isCancelable = order.status === 'Pending' || order.status === 'Payment Confirmed';
          const items =
            order.purchasedItems && order.purchasedItems.length > 0
              ? order.purchasedItems
              : (order.products || []).map((p) => ({ product: p, price: p.price, discount: p.discount, qty: 1 }));

          return (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition-all overflow-hidden"
            >
              {/* Order Card Header */}
              <div className="p-5 sm:p-6 bg-gray-50/70 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div>
                    <span className="text-dark-400 font-medium block">Order Placed</span>
                    <span className="font-bold text-dark-900 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="w-px h-6 bg-gray-200"></div>

                  <div>
                    <span className="text-dark-400 font-medium block">Total Amount</span>
                    <span className="font-extrabold text-dark-900 mt-0.5">
                      ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="w-px h-6 bg-gray-200"></div>

                  <div>
                    <span className="text-dark-400 font-medium block">Order ID</span>
                    <span className="font-mono text-dark-600">#{order._id.slice(-8).toUpperCase()}</span>
                  </div>
                </div>

                {/* Status Badge & Actions */}
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>

                  {order.status !== 'Cancelled' && (
                    <a
                      href={`/orders/${order._id}/invoice`}
                      download
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-brand-500 text-dark-700 hover:text-brand-600 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                      title="Download Tax Invoice"
                    >
                      <i className="ri-file-download-line text-sm"></i>
                      Invoice
                    </a>
                  )}
                </div>
              </div>

              {/* Items in Order */}
              <div className="p-5 sm:p-6 divide-y divide-gray-100">
                {items.map((item, idx) => {
                  const prod = item.product || {};
                  return (
                    <div key={`${prod._id || idx}-${idx}`} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                      <Link
                        to={prod._id ? `/product/${prod._id}` : '#'}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-50 p-2 flex items-center justify-center flex-shrink-0 overflow-hidden"
                      >
                        <img
                          src={getImageSrc(prod)}
                          alt={prod.name || 'Product'}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/1bag.png';
                          }}
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                          {prod.category || 'Bag'}
                        </span>
                        <Link to={prod._id ? `/product/${prod._id}` : '#'}>
                          <h4 className="text-sm font-bold text-dark-900 truncate hover:text-brand-600 transition-colors">
                            {prod.name || 'Product'}
                          </h4>
                        </Link>
                        <p className="text-xs text-dark-400 mt-0.5">
                          Qty: {item.qty || 1} &bull; Price: ₹
                          {(Number(item.price || prod.price || 0) - Number(item.discount || 0)).toLocaleString('en-IN')}
                        </p>
                      </div>

                      {prod._id && (
                        <Link
                          to={`/product/${prod._id}`}
                          className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl bg-gray-50 hover:bg-brand-50 text-dark-600 hover:text-brand-600 text-xs font-semibold transition-colors"
                        >
                          View Item
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Order Footer Actions (e.g. Cancel) */}
              {isCancelable && (
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    disabled={cancellingId === order._id}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {cancellingId === order._id ? (
                      <div className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <i className="ri-close-circle-line text-sm"></i>
                    )}
                    Cancel Order
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
