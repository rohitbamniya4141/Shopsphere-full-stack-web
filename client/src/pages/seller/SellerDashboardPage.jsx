import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function SellerDashboardPage() {
  const { seller } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/api/seller/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading seller dashboard..." />;
  }

  const { totalProducts, totalOrders, revenue, pendingOrders, deliveredOrders, recentOrders } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-brand-500 to-brand-700"></div>
            <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 tracking-tight">
              Seller Dashboard
            </h1>
          </div>
          <p className="text-dark-400 text-sm ml-5 sm:ml-6">
            Welcome back, <span className="font-semibold text-dark-900">{seller?.shopName}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/seller/products/create"
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs hover:shadow-md transition-all"
          >
            <i className="ri-add-line text-base"></i>
            Add Product
          </Link>
          <Link
            to={`/seller/${seller?._id}`}
            className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-dark-700 hover:text-brand-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <i className="ri-external-link-line"></i>
            View Storefront
          </Link>
        </div>
      </div>

      {/* 5 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <i className="ri-money-rupee-circle-line text-xl"></i>
            </div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-dark-400">Total Revenue</span>
          </div>
          <p className="text-2xl font-extrabold text-dark-900">₹{Number(revenue || 0).toLocaleString('en-IN')}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <i className="ri-shopping-bag-3-line text-xl"></i>
            </div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-dark-400">Total Orders</span>
          </div>
          <p className="text-2xl font-extrabold text-dark-900">{totalOrders || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <i className="ri-box-3-line text-xl"></i>
            </div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-dark-400">Products</span>
          </div>
          <p className="text-2xl font-extrabold text-dark-900">{totalProducts || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <i className="ri-time-line text-xl"></i>
            </div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-dark-400">Pending Orders</span>
          </div>
          <p className="text-2xl font-extrabold text-amber-600">{pendingOrders || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <i className="ri-checkbox-circle-line text-xl"></i>
            </div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-dark-400">Delivered</span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">{deliveredOrders || 0}</p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-dark-900 tracking-tight">Recent Orders</h2>
            <p className="text-xs text-dark-400 mt-0.5">Latest customer orders for your products</p>
          </div>
          <Link to="/seller/orders" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            View All Orders &rarr;
          </Link>
        </div>

        {!recentOrders || recentOrders.length === 0 ? (
          <div className="text-center py-10 text-dark-400 text-xs">No orders received yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-dark-400 uppercase font-semibold">
                  <th className="pb-3 pr-4">Order ID</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 pr-4 font-mono font-bold text-dark-900">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 pr-4 font-medium text-dark-700">
                      {order.user?.fullname || 'Customer'}
                    </td>
                    <td className="py-3.5 pr-4 text-dark-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-extrabold text-dark-900">
                      ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
