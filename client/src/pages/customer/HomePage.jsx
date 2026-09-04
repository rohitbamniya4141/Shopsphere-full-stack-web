import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AlertMessage from '../../components/common/AlertMessage';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

export default function HomePage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  // Active Auth Tab: 'login' | 'register'
  const [activeTab, setActiveTab] = useState('login');

  // Form states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ fullname: '', email: '', password: '' });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/shop');
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!loginData.email.trim() || !loginData.password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(loginData.email.trim(), loginData.password);
      navigate('/shop');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!registerData.fullname.trim() || !registerData.email.trim() || !registerData.password) {
      setError('Please fill in all registration fields.');
      return;
    }

    setIsLoading(true);
    try {
      await register(registerData.fullname.trim(), registerData.email.trim(), registerData.password);
      navigate('/shop');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col bg-[#fafaf9]">
      <AlertMessage type="error" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {/* Content-led hero keeps the sign-in panel prominent without forcing excess viewport whitespace. */}
      <section className="relative w-full bg-gradient-to-br from-dark-950 via-dark-900 to-[#0b1121] text-white py-16 sm:py-20 lg:py-24 border-b border-dark-800">
        {/* Subtle ambient lighting */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 50% 50% at 20% 30%, rgba(217, 119, 6, 0.15), transparent), radial-gradient(ellipse 40% 40% at 80% 70%, rgba(217, 119, 6, 0.1), transparent)'
          }}
        ></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-center">
            
            {/* Left Column: Headline, Brand Mission & Statistics */}
            <div className="flex flex-col justify-center animate-fade-in-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-900/40 border border-brand-500/20 backdrop-blur-md mb-8 self-start shadow-xl shadow-brand-900/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-400"></span>
                </span>
                <span className="text-brand-300 text-[11px] font-bold uppercase tracking-[0.2em]">
                  Premium Collection 2026
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-serif font-bold text-white leading-[1.1] mb-6 tracking-tight">
                Discover Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-amber-200">
                  Perfect Bag
                </span>
              </h1>

              {/* Description */}
              <p className="text-dark-300 text-base sm:text-lg leading-relaxed mb-10 max-w-xl font-normal">
                Handcrafted luxury bags engineered for effortless elegance and lasting durability. From sleek everyday backpacks to executive travel essentials, find the bag that elevates your journey.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-14">
                <Button 
                  onClick={() => setActiveTab('register')} 
                  variant="primary" 
                  size="lg" 
                  icon="ri-arrow-right-line"
                >
                  Create Free Account
                </Button>
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="px-7 py-3.5 rounded-xl text-sm font-semibold tracking-widest text-dark-200 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-all cursor-pointer uppercase"
                >
                  Sign In
                </button>
              </div>

              {/* Stats Strip */}
              <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <h3 className="text-3xl font-serif font-bold text-white tracking-tight">500+</h3>
                  <p className="text-dark-400 text-xs mt-1.5 font-semibold uppercase tracking-wider">Curated Bags</p>
                </div>
                <div>
                  <h3 className="text-3xl font-serif font-bold text-white tracking-tight">50+</h3>
                  <p className="text-dark-400 text-xs mt-1.5 font-semibold uppercase tracking-wider">Artisan Brands</p>
                </div>
                <div>
                  <h3 className="text-3xl font-serif font-bold text-white tracking-tight">10K+</h3>
                  <p className="text-dark-400 text-xs mt-1.5 font-semibold uppercase tracking-wider">Happy Buyers</p>
                </div>
              </div>
            </div>

            {/* Right Column: Unified Authentication Card */}
            <div className="w-full max-w-xl lg:justify-self-end animate-fade-in-up">
              <Card className="p-6 sm:p-8 relative border-t-4 border-t-brand-500">
                {/* Tab Switcher */}
                <div className="flex bg-ivory-200 p-1.5 rounded-xl mb-8">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setError('');
                    }}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === 'login'
                        ? 'bg-white text-dark-900 shadow-sm'
                        : 'text-dark-500 hover:text-dark-900'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setError('');
                    }}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === 'register'
                        ? 'bg-white text-dark-900 shadow-sm'
                        : 'text-dark-500 hover:text-dark-900'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Title & Subtitle */}
                <div className="mb-6">
                  <h2 className="text-2xl font-serif font-bold text-dark-900 tracking-tight">
                    {activeTab === 'login' ? 'Welcome Back' : 'Create Your Account'}
                  </h2>
                  <p className="text-dark-400 text-sm mt-1.5">
                    {activeTab === 'login'
                      ? 'Sign in to access your orders, cart, and wishlist'
                      : 'Join ShopSphere to explore our exclusive luxury bag releases'}
                  </p>
                </div>

                {/* Active Form */}
                {activeTab === 'login' ? (
                  /* LOGIN FORM */
                  <form onSubmit={handleLogin} className="space-y-4">
                    <Input
                      label="Email Address"
                      type="email"
                      icon="ri-mail-line"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      placeholder="name@example.com"
                      required
                    />
                    <Input
                      label="Password"
                      type="password"
                      icon="ri-lock-2-line"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                    <div className="pt-2">
                      <Button type="submit" variant="secondary" fullWidth size="lg" isLoading={isLoading} icon="ri-arrow-right-line">
                        Sign In to Shop
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* REGISTER FORM */
                  <form onSubmit={handleRegister} className="space-y-4">
                    <Input
                      label="Full Name"
                      type="text"
                      icon="ri-user-3-line"
                      value={registerData.fullname}
                      onChange={(e) => setRegisterData({ ...registerData, fullname: e.target.value })}
                      placeholder="Your Name"
                      required
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      icon="ri-mail-line"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      placeholder="name@example.com"
                      required
                    />
                    <Input
                      label="Password"
                      type="password"
                      icon="ri-lock-2-line"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      placeholder="At least 6 characters"
                      required
                    />
                    <div className="pt-2">
                      <Button type="submit" variant="primary" fullWidth size="lg" isLoading={isLoading} icon="ri-arrow-right-line">
                        Create My Account
                      </Button>
                    </div>
                  </form>
                )}

                {/* Other Portals Navigation */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-xs">
                  <Link
                    to="/seller/login"
                    className="font-semibold text-brand-600 hover:text-brand-700 transition-colors uppercase tracking-wider inline-flex items-center gap-1"
                  >
                    <i className="ri-store-2-line text-sm"></i> Seller Portal
                  </Link>
                  <Link
                    to="/admin/login"
                    className="font-semibold text-dark-500 hover:text-dark-900 transition-colors uppercase tracking-wider inline-flex items-center gap-1"
                  >
                    <i className="ri-shield-user-line text-sm"></i> Admin Portal
                  </Link>
                </div>
              </Card>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Value Strip */}
      <section className="bg-white border-y border-gray-100 py-12 relative">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 shadow-xs">
                <i className="ri-truck-line text-xl"></i>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-dark-900">Free Shipping</h4>
                <p className="text-xs text-gray-400 mt-0.5">On orders above ₹999</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 shadow-xs">
                <i className="ri-shield-check-line text-xl"></i>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-dark-900">100% Authentic</h4>
                <p className="text-xs text-gray-400 mt-0.5">Direct from artisans</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 shadow-xs">
                <i className="ri-refresh-line text-xl"></i>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-dark-900">Easy Returns</h4>
                <p className="text-xs text-gray-400 mt-0.5">7-day hassle-free policy</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 shadow-xs">
                <i className="ri-secure-payment-line text-xl"></i>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-dark-900">Secure Payments</h4>
                <p className="text-xs text-gray-400 mt-0.5">256-bit encrypted</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
