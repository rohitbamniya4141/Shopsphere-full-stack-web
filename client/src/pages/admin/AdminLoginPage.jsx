import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AlertMessage from '../../components/common/AlertMessage';

export default function AdminLoginPage() {
  const { admin, adminLogin } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (admin) {
      navigate('/admin/dashboard');
    }
  }, [admin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password) {
      setError('Please enter your admin credentials');
      return;
    }

    setIsLoading(true);
    try {
      await adminLogin(formData.email, formData.password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Admin authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-5 sm:px-8">
      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-50 to-transparent rounded-bl-[4rem]"></div>

          <div className="relative">
            {/* Header */}
            <div className="flex items-center gap-3.5 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-md">
                <i className="ri-shield-user-fill text-xl"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-dark-900 tracking-tight">Admin Portal</h1>
                <p className="text-dark-400 text-xs mt-0.5">ShopSphere platform management</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="ri-mail-line text-base"></i>
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@shopsphere.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-dark-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Security Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="ri-lock-2-line text-base"></i>
                  </div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-dark-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                  />
                </div>
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
                    Authenticate as Owner
                    <i className="ri-arrow-right-line text-base"></i>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <Link to="/" className="text-xs text-dark-400 hover:text-dark-900">
                &larr; Back to ShopSphere Store
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
