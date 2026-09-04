import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, cartCount, wishlistCount, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <nav className="glass fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-[72px]">
            {/* Logo */}
            <Link to={user ? "/shop" : "/"} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                <i className="ri-shopping-bag-3-fill text-white text-lg"></i>
              </div>
              <span className="text-xl font-bold tracking-tight text-dark-900">
                Shop<span className="text-brand-500">Sphere</span>
              </span>
            </Link>

            {/* Nav Links */}
            {user ? (
              <div className="hidden md:flex items-center gap-1">
                <NavLink
                  to="/shop"
                  className={({ isActive }) =>
                    `nav-link text-[13px] font-medium tracking-widest uppercase px-3.5 py-2 ${
                      isActive ? 'text-brand-500 font-semibold active' : 'text-dark-500'
                    }`
                  }
                >
                  Shop
                </NavLink>

                <NavLink
                  to="/cart"
                  className={({ isActive }) =>
                    `nav-link text-[13px] font-medium tracking-widest uppercase px-3.5 py-2 relative flex items-center gap-1 ${
                      isActive ? 'text-brand-500 font-semibold active' : 'text-dark-500'
                    }`
                  }
                >
                  <i className="ri-shopping-bag-line text-base"></i>
                  Cart
                  {cartCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-brand-500 text-white rounded-full">
                      {cartCount}
                    </span>
                  )}
                </NavLink>

                <NavLink
                  to="/wishlist"
                  className={({ isActive }) =>
                    `nav-link text-[13px] font-medium tracking-widest uppercase px-3.5 py-2 relative flex items-center gap-1 ${
                      isActive ? 'text-brand-500 font-semibold active' : 'text-dark-500'
                    }`
                  }
                >
                  <i className="ri-heart-line text-base"></i>
                  Wishlist
                  {wishlistCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </NavLink>

                <NavLink
                  to="/orders"
                  className={({ isActive }) =>
                    `nav-link text-[13px] font-medium tracking-widest uppercase px-3.5 py-2 ${
                      isActive ? 'text-brand-500 font-semibold active' : 'text-dark-500'
                    }`
                  }
                >
                  Orders
                </NavLink>

                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `nav-link text-[13px] font-medium tracking-widest uppercase px-3.5 py-2 ${
                      isActive ? 'text-brand-500 font-semibold active' : 'text-dark-500'
                    }`
                  }
                >
                  Profile
                </NavLink>

                <Link
                  to="/seller/register"
                  className="nav-link text-[13px] font-medium text-dark-500 tracking-widest uppercase px-3.5 py-2 flex items-center gap-1"
                >
                  <i className="ri-store-2-line text-sm text-brand-500"></i>
                  Sell
                </Link>

                <button
                  onClick={handleLogout}
                  className="ml-3 px-5 py-2 rounded-full text-xs font-semibold text-white btn-dark tracking-wider uppercase cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span className="hidden sm:block text-sm text-dark-400 font-light tracking-wide italic font-serif">
                  Premium Bag Collection
                </span>
                <Link
                  to="/seller/login"
                  className="text-xs font-semibold uppercase tracking-wider text-dark-600 hover:text-brand-500 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-brand-500 transition-colors"
                >
                  Seller Portal
                </Link>
                <Link
                  to="/admin/login"
                  className="text-xs font-semibold uppercase tracking-wider text-white bg-dark-900 hover:bg-dark-800 px-3.5 py-1.5 rounded-lg transition-colors"
                >
                  Admin
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            {user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-xl hover:bg-dark-50 transition-colors"
                aria-label="Toggle menu"
              >
                <span className={`w-5 h-[2px] bg-dark-700 rounded-full transition-transform duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}></span>
                <span className={`w-5 h-[2px] bg-dark-700 rounded-full transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`w-5 h-[2px] bg-dark-700 rounded-full transition-transform duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}></span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {user && mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-dark-100 shadow-xl animate-slide-down">
            <div className="max-w-7xl mx-auto px-5 py-4 flex flex-col gap-1">
              <Link
                to="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-dark-600 text-sm font-medium py-3 px-4 rounded-xl hover:bg-brand-50"
              >
                <i className="ri-store-2-line text-lg text-brand-500"></i>
                Shop
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-dark-600 text-sm font-medium py-3 px-4 rounded-xl hover:bg-brand-50"
              >
                <span className="flex items-center gap-3">
                  <i className="ri-shopping-bag-line text-lg text-brand-500"></i>
                  Cart
                </span>
                {cartCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-brand-500 text-white rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-dark-600 text-sm font-medium py-3 px-4 rounded-xl hover:bg-brand-50"
              >
                <span className="flex items-center gap-3">
                  <i className="ri-heart-line text-lg text-rose-500"></i>
                  Wishlist
                </span>
                {wishlistCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-dark-600 text-sm font-medium py-3 px-4 rounded-xl hover:bg-brand-50"
              >
                <i className="ri-file-list-3-line text-lg text-brand-500"></i>
                Orders
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-dark-600 text-sm font-medium py-3 px-4 rounded-xl hover:bg-brand-50"
              >
                <i className="ri-user-3-line text-lg text-brand-500"></i>
                Profile
              </Link>
              <Link
                to="/seller/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-dark-600 text-sm font-medium py-3 px-4 rounded-xl hover:bg-brand-50"
              >
                <i className="ri-store-2-line text-lg text-brand-500"></i>
                Become a Seller
              </Link>
              <div className="mt-2 pt-3 border-t border-dark-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white btn-dark cursor-pointer"
                >
                  <i className="ri-logout-box-r-line"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-[72px]"></div>
    </>
  );
}
