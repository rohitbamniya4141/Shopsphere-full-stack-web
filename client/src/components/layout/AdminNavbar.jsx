import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminNavbar() {
  const { admin, adminLogout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await adminLogout();
      navigate('/admin/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <nav className="glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-[72px]">
            {/* Logo */}
            <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                <i className="ri-shield-user-fill text-white text-lg"></i>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-dark-900">
                  Shop<span className="text-brand-500">Sphere</span>
                </span>
                <p className="text-[10px] tracking-[3px] uppercase text-brand-500 font-semibold leading-none mt-0.5">
                  ADMIN PANEL
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            {admin ? (
              <div className="hidden md:flex items-center gap-1">
                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) =>
                    `nav-link text-[13px] font-medium tracking-widest uppercase px-3 py-2 ${
                      isActive ? 'text-brand-500 font-semibold active' : 'text-dark-500'
                    }`
                  }
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/admin/products"
                  className={({ isActive }) =>
                    `nav-link text-[13px] font-medium tracking-widest uppercase px-3 py-2 ${
                      isActive ? 'text-brand-500 font-semibold active' : 'text-dark-500'
                    }`
                  }
                >
                  Products
                </NavLink>

                <NavLink
                  to="/admin/orders"
                  className={({ isActive }) =>
                    `nav-link text-[13px] font-medium tracking-widest uppercase px-3 py-2 ${
                      isActive ? 'text-brand-500 font-semibold active' : 'text-dark-500'
                    }`
                  }
                >
                  Orders
                </NavLink>

                <NavLink
                  to="/admin/customers"
                  className={({ isActive }) =>
                    `nav-link text-[13px] font-medium tracking-widest uppercase px-3 py-2 ${
                      isActive ? 'text-brand-500 font-semibold active' : 'text-dark-500'
                    }`
                  }
                >
                  Customers
                </NavLink>

                <NavLink
                  to="/admin/sellers"
                  className={({ isActive }) =>
                    `nav-link text-[13px] font-medium tracking-widest uppercase px-3 py-2 ${
                      isActive ? 'text-brand-500 font-semibold active' : 'text-dark-500'
                    }`
                  }
                >
                  Sellers
                </NavLink>

                <NavLink
                  to="/admin/analytics"
                  className={({ isActive }) =>
                    `nav-link text-[13px] font-medium tracking-widest uppercase px-3 py-2 ${
                      isActive ? 'text-brand-500 font-semibold active' : 'text-dark-500'
                    }`
                  }
                >
                  Analytics
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="ml-3 px-5 py-2 rounded-full text-xs font-semibold text-white btn-dark tracking-wider uppercase cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/" className="text-xs font-semibold uppercase tracking-wider text-dark-600 hover:text-brand-500">
                  Back to Store
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            {admin && (
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
        {admin && mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-dark-100 shadow-xl animate-slide-down">
            <div className="max-w-7xl mx-auto px-5 py-4 flex flex-col gap-1">
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-dark-600 text-sm font-medium py-3 px-4 rounded-xl hover:bg-brand-50"
              >
                <i className="ri-dashboard-line text-lg text-brand-500"></i>
                Dashboard
              </Link>
              <Link
                to="/admin/products"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-dark-600 text-sm font-medium py-3 px-4 rounded-xl hover:bg-brand-50"
              >
                <i className="ri-shopping-bag-line text-lg text-brand-500"></i>
                Products
              </Link>
              <Link
                to="/admin/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-dark-600 text-sm font-medium py-3 px-4 rounded-xl hover:bg-brand-50"
              >
                <i className="ri-file-list-3-line text-lg text-brand-500"></i>
                Orders
              </Link>
              <Link
                to="/admin/customers"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-dark-600 text-sm font-medium py-3 px-4 rounded-xl hover:bg-brand-50"
              >
                <i className="ri-group-line text-lg text-brand-500"></i>
                Customers
              </Link>
              <Link
                to="/admin/sellers"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-dark-600 text-sm font-medium py-3 px-4 rounded-xl hover:bg-brand-50"
              >
                <i className="ri-store-2-line text-lg text-brand-500"></i>
                Sellers
              </Link>
              <Link
                to="/admin/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-dark-600 text-sm font-medium py-3 px-4 rounded-xl hover:bg-brand-50"
              >
                <i className="ri-bar-chart-box-line text-lg text-brand-500"></i>
                Analytics
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
      <div className="h-[72px]"></div>
    </>
  );
}
