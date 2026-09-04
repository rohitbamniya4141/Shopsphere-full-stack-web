import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark-950 text-white mt-auto relative overflow-hidden">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Main Footer */}
        <div className="py-16 lg:py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <i className="ri-shopping-bag-3-fill text-white text-lg"></i>
              </div>
              <span className="text-xl font-bold tracking-tight">
                Shop<span className="text-brand-400">Sphere</span>
              </span>
            </div>
            <p className="text-dark-400 text-sm leading-relaxed mb-8 max-w-xs">
              Discover handpicked premium bags for every occasion. Quality craftsmanship meets modern design.
            </p>
            <div className="flex gap-3">
              <a
                href="#instagram"
                className="w-10 h-10 rounded-xl bg-dark-800/80 flex items-center justify-center hover:bg-brand-600 hover:scale-110 hover:shadow-lg hover:shadow-brand-600/25 transition-all duration-300"
              >
                <i className="ri-instagram-line text-lg"></i>
              </a>
              <a
                href="#twitter"
                className="w-10 h-10 rounded-xl bg-dark-800/80 flex items-center justify-center hover:bg-brand-600 hover:scale-110 hover:shadow-lg hover:shadow-brand-600/25 transition-all duration-300"
              >
                <i className="ri-twitter-x-line text-lg"></i>
              </a>
              <a
                href="#facebook"
                className="w-10 h-10 rounded-xl bg-dark-800/80 flex items-center justify-center hover:bg-brand-600 hover:scale-110 hover:shadow-lg hover:shadow-brand-600/25 transition-all duration-300"
              >
                <i className="ri-facebook-fill text-lg"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60 mb-6">Quick Links</h4>
            <ul className="space-y-3.5">
              <li>
                <Link to="/shop" className="text-dark-400 hover:text-brand-400 hover:pl-1 transition-all duration-200 text-sm inline-flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-dark-700"></span>All Products
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=newest" className="text-dark-400 hover:text-brand-400 hover:pl-1 transition-all duration-200 text-sm inline-flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-dark-700"></span>New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=popular" className="text-dark-400 hover:text-brand-400 hover:pl-1 transition-all duration-200 text-sm inline-flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-dark-700"></span>Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-dark-400 hover:text-brand-400 hover:pl-1 transition-all duration-200 text-sm inline-flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-dark-700"></span>My Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60 mb-6">Categories</h4>
            <ul className="space-y-3.5">
              <li>
                <Link to="/shop?category=Backpacks" className="text-dark-400 hover:text-brand-400 hover:pl-1 transition-all duration-200 text-sm inline-flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-dark-700"></span>Backpacks
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Laptop%20Bags" className="text-dark-400 hover:text-brand-400 hover:pl-1 transition-all duration-200 text-sm inline-flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-dark-700"></span>Laptop Bags
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Office%20Bags" className="text-dark-400 hover:text-brand-400 hover:pl-1 transition-all duration-200 text-sm inline-flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-dark-700"></span>Office Bags
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Travel%20Bags" className="text-dark-400 hover:text-brand-400 hover:pl-1 transition-all duration-200 text-sm inline-flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-dark-700"></span>Travel Bags
                </Link>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60 mb-6">For Sellers</h4>
            <ul className="space-y-3.5">
              <li>
                <Link to="/seller/register" className="text-dark-400 hover:text-brand-400 hover:pl-1 transition-all duration-200 text-sm inline-flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-dark-700"></span>Become a Seller
                </Link>
              </li>
              <li>
                <Link to="/seller/login" className="text-dark-400 hover:text-brand-400 hover:pl-1 transition-all duration-200 text-sm inline-flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-dark-700"></span>Seller Login
                </Link>
              </li>
              <li>
                <Link to="/seller/dashboard" className="text-dark-400 hover:text-brand-400 hover:pl-1 transition-all duration-200 text-sm inline-flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-dark-700"></span>Seller Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60 mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-dark-400 text-sm group">
                <div className="w-8 h-8 rounded-lg bg-dark-800/80 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-600/20 transition-colors">
                  <i className="ri-mail-line text-brand-500 text-sm"></i>
                </div>
                <span className="pt-1.5">support@shopsphere.com</span>
              </li>
              <li className="flex items-start gap-3 text-dark-400 text-sm group">
                <div className="w-8 h-8 rounded-lg bg-dark-800/80 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-600/20 transition-colors">
                  <i className="ri-phone-line text-brand-500 text-sm"></i>
                </div>
                <span className="pt-1.5">+91 78690 12986</span>
              </li>
              <li className="flex items-start gap-3 text-dark-400 text-sm group">
                <div className="w-8 h-8 rounded-lg bg-dark-800/80 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-600/20 transition-colors">
                  <i className="ri-map-pin-line text-brand-500 text-sm"></i>
                </div>
                <span className="pt-1.5">Dewas, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-dark-800/60 py-7 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-dark-500 text-xs tracking-wide">&copy; 2026 ShopSphere. All rights reserved.</p>
          <div className="flex gap-8">
            <span className="text-dark-500 text-xs tracking-wide">Privacy Policy</span>
            <span className="text-dark-500 text-xs tracking-wide">Terms of Service</span>
            <span className="text-dark-500 text-xs tracking-wide">Shipping Policy</span>
          </div>
        </div>
      </div>

      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
    </footer>
  );
}
