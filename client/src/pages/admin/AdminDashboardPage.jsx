import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/api/admin/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading || !data) {
    return <LoadingSpinner fullScreen text="Loading platform dashboard..." />;
  }

  const {
    totalProducts = 0,
    totalOrders = 0,
    totalCustomers = 0,
    totalSellers = 0,
    revenue = 0,
    lowStockProducts = [],
    latestOrders = [],
    latestCustomers = []
  } = data;

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-brand-500 to-brand-700"></div>
            <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 tracking-tight">Platform Control Center</h1>
          </div>
          <p className="text-dark-400 text-sm ml-5 sm:ml-6">
            Comprehensive system overview, live revenue, orders, and active vendors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs hover:shadow-md transition-all"
          >
            <i className="ri-box-3-line"></i>
            Manage Products
          </Link>
          <Link
            to="/admin/sellers"
            className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-dark-700 hover:text-brand-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <i className="ri-store-2-line"></i>
            Vendors
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
            <span className="text-[11px] uppercase tracking-wider font-semibold text-dark-400">Platform Revenue</span>
          </div>
          <p className="text-2xl font-extrabold text-dark-900">₹{Number(revenue).toLocaleString('en-IN')}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <i className="ri-shopping-bag-line text-xl"></i>
            </div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-dark-400">Total Orders</span>
          </div>
          <p className="text-2xl font-extrabold text-dark-900">{totalOrders.toLocaleString('en-IN')}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <i className="ri-box-3-line text-xl"></i>
            </div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-dark-400">Products</span>
          </div>
          <p className="text-2xl font-extrabold text-dark-900">{totalProducts}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <i className="ri-user-line text-xl"></i>
            </div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-dark-400">Customers</span>
          </div>
          <p className="text-2xl font-extrabold text-dark-900">{totalCustomers}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <i className="ri-store-2-line text-xl"></i>
            </div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-dark-400">Sellers</span>
          </div>
          <p className="text-2xl font-extrabold text-dark-900">{totalSellers}</p>
        </div>
      </div>

      {/* Grid: Low Stock Alert & Latest Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Low Stock Alerts */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-dark-900 tracking-tight flex items-center gap-2">
                <i className="ri-alarm-warning-line text-rose-500"></i>
                Low Stock Alert
              </h2>
              <p className="text-xs text-dark-400 mt-0.5">Products with inventory below 5 units</p>
            </div>
            <Link to="/admin/products" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Manage &rarr;
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-emerald-600 font-medium py-6 text-center">
              ✓ All products have healthy stock levels.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {lowStockProducts.map((p) => (
                <div key={p._id} className="py-3 flex items-center justify-between text-xs">
                  <span className="font-semibold text-dark-900 truncate max-w-xs">{p.name}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600">
                    {p.stock} remaining
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest Platform Orders */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-dark-900 tracking-tight">Recent Orders</h2>
              <p className="text-xs text-dark-400 mt-0.5">Latest transactions across the store</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              All Orders &rarr;
            </Link>
          </div>

          {latestOrders.length === 0 ? (
            <p className="text-xs text-dark-400 py-6 text-center">No orders recorded yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {latestOrders.map((o) => (
                <div key={o._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-dark-900">#{o._id.slice(-6).toUpperCase()}</span>
                    <span className="text-dark-400 ml-2">{o.user?.fullname || 'Customer'}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-dark-900">₹{Number(o.totalAmount || 0).toLocaleString('en-IN')}</span>
                    <span className="text-[10px] font-bold text-brand-600 ml-2">{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
