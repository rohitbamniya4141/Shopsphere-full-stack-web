import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ProfilePage() {
  const { user, cartCount, wishlistCount, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/api/profile');
        setProfileData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading your profile..." />;
  }

  const currentUser = profileData?.user || user;
  const ordersCount = profileData?.ordersCount || 0;
  const recentOrders = profileData?.recentOrders || [];

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-brand-500 to-brand-700"></div>
        <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 tracking-tight">Customer Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: User Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm text-center relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-brand-500/10 via-amber-500/10 to-brand-500/10"></div>

            {/* Avatar */}
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/20">
              {currentUser?.fullname ? currentUser.fullname.charAt(0).toUpperCase() : 'U'}
            </div>

            <h2 className="text-xl font-bold text-dark-900">{currentUser?.fullname || 'Customer'}</h2>
            <p className="text-xs text-dark-400 mt-0.5 truncate">{currentUser?.email}</p>

            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-left text-xs text-dark-600">
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Account Type</span>
                <span className="font-semibold text-dark-900">Verified Customer</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Total Orders</span>
                <span className="font-semibold text-dark-900">{ordersCount}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Link
                to="/seller/register"
                className="w-full py-3 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <i className="ri-store-2-line"></i>
                Become a Seller
              </Link>
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-xl bg-gray-100 hover:bg-rose-50 text-dark-700 hover:text-rose-600 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <i className="ri-logout-box-r-line"></i>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Right: Quick Stats & Recent Orders */}
        <div className="lg:col-span-8 space-y-6">
          {/* 3 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/orders"
              className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">Orders</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <i className="ri-file-list-3-line"></i>
                </div>
              </div>
              <p className="text-2xl font-extrabold text-dark-900">{ordersCount}</p>
            </Link>

            <Link
              to="/cart"
              className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">Cart Items</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <i className="ri-shopping-bag-line"></i>
                </div>
              </div>
              <p className="text-2xl font-extrabold text-dark-900">{cartCount}</p>
            </Link>

            <Link
              to="/wishlist"
              className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">Wishlist</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <i className="ri-heart-line"></i>
                </div>
              </div>
              <p className="text-2xl font-extrabold text-dark-900">{wishlistCount}</p>
            </Link>
          </div>

          {/* Recent Orders Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-dark-900 tracking-tight">Recent Activity</h3>
              <Link to="/orders" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                View All Orders &rarr;
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-xs text-dark-400 py-6 text-center">No recent orders found.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <div key={order._id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="font-bold text-dark-900">Order #{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-dark-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-dark-900">
                        ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                      </p>
                      <span className="text-[10px] font-bold text-brand-600">{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
