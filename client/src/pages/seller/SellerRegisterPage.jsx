import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AlertMessage from '../../components/common/AlertMessage';

export default function SellerRegisterPage() {
  const { sellerRegister } = useAuth();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    phone: '',
    shopName: '',
    shopDescription: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.fullname || !formData.email || !formData.password || !formData.shopName) {
      setError('Name, email, password, and shop name are required.');
      return;
    }

    setIsLoading(true);
    try {
      await sellerRegister(formData);
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-5 sm:px-8">
      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      <div className="max-w-xl w-full">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-50 to-transparent rounded-bl-[4rem]"></div>

          <div className="relative">
            {/* Header */}
            <div className="flex items-center gap-3.5 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-md">
                <i className="ri-store-3-fill text-xl"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-dark-900 tracking-tight">Become a ShopSphere Seller</h1>
                <p className="text-dark-400 text-xs mt-0.5">Reach thousands of luxury bag customers</p>
              </div>
            </div>

            {isSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
                  <i className="ri-checkbox-circle-fill"></i>
                </div>
                <h3 className="text-xl font-bold text-dark-900">Application Submitted!</h3>
                <p className="text-dark-500 text-sm max-w-sm mx-auto leading-relaxed">
                  Your seller account has been registered. An admin will review and approve your store shortly.
                </p>
                <Link
                  to="/seller/login"
                  className="inline-block px-6 py-3 rounded-full text-xs font-semibold text-white btn-primary uppercase tracking-wider mt-4"
                >
                  Proceed to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.fullname}
                      onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                      placeholder="Rohit Bamniya"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-dark-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-dark-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seller@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-dark-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-dark-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                    Shop / Brand Name *
                  </label>
                  <input
                    type="text"
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    placeholder="Sohan Bag Collections"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-dark-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                    Shop Description
                  </label>
                  <textarea
                    rows="2"
                    value={formData.shopDescription}
                    onChange={(e) => setFormData({ ...formData, shopDescription: e.target.value })}
                    placeholder="Tell customers about your craftsmanship and specialty..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-dark-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white btn-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 shadow-md hover:shadow-xl transition-all"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Submit Application
                      <i className="ri-arrow-right-line text-base"></i>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-2">
              <p className="text-xs text-dark-400">
                Already registered?{' '}
                <Link to="/seller/login" className="font-bold text-brand-600 hover:text-brand-700">
                  Seller Login &rarr;
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
