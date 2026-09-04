import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Layout & Components
import Navbar from './components/layout/Navbar';
import SellerNavbar from './components/layout/SellerNavbar';
import AdminNavbar from './components/layout/AdminNavbar';
import Footer from './components/layout/Footer';
import AiChatWidget from './components/common/AiChatWidget';

// Route Guards
import { ProtectedRoute, SellerRoute, AdminRoute } from './components/guards/RouteGuards';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import ShopPage from './pages/customer/ShopPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrdersPage from './pages/customer/OrdersPage';
import WishlistPage from './pages/customer/WishlistPage';
import ProfilePage from './pages/customer/ProfilePage';
import SellerStorePage from './pages/customer/SellerStorePage';

// Seller Pages
import SellerLoginPage from './pages/seller/SellerLoginPage';
import SellerRegisterPage from './pages/seller/SellerRegisterPage';
import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import SellerProductsPage from './pages/seller/SellerProductsPage';
import SellerProductFormPage from './pages/seller/SellerProductFormPage';
import SellerOrdersPage from './pages/seller/SellerOrdersPage';
import SellerAnalyticsPage from './pages/seller/SellerAnalyticsPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminSellersPage from './pages/admin/AdminSellersPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';

// 404
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const location = useLocation();
  const isSellerRoute = location.pathname.startsWith('/seller');
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Selector */}
      {isAdminRoute ? (
        <AdminNavbar />
      ) : isSellerRoute ? (
        <SellerNavbar />
      ) : (
        <Navbar />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<HomePage />} />
          <Route
            path="/shop"
            element={
              <ProtectedRoute>
                <ShopPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProtectedRoute>
                <ProductDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/:id"
            element={
              <ProtectedRoute>
                <SellerStorePage />
              </ProtectedRoute>
            }
          />

          {/* Seller Portal Routes */}
          <Route path="/seller/login" element={<SellerLoginPage />} />
          <Route path="/seller/register" element={<SellerRegisterPage />} />
          <Route
            path="/seller/dashboard"
            element={
              <SellerRoute>
                <SellerDashboardPage />
              </SellerRoute>
            }
          />
          <Route
            path="/seller/products"
            element={
              <SellerRoute>
                <SellerProductsPage />
              </SellerRoute>
            }
          />
          <Route
            path="/seller/products/create"
            element={
              <SellerRoute>
                <SellerProductFormPage />
              </SellerRoute>
            }
          />
          <Route
            path="/seller/products/edit/:id"
            element={
              <SellerRoute>
                <SellerProductFormPage />
              </SellerRoute>
            }
          />
          <Route
            path="/seller/orders"
            element={
              <SellerRoute>
                <SellerOrdersPage />
              </SellerRoute>
            }
          />
          <Route
            path="/seller/analytics"
            element={
              <SellerRoute>
                <SellerAnalyticsPage />
              </SellerRoute>
            }
          />

          {/* Admin Portal Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminProductsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products/create"
            element={
              <AdminRoute>
                <AdminProductFormPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products/edit/:id"
            element={
              <AdminRoute>
                <AdminProductFormPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrdersPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <AdminRoute>
                <AdminCustomersPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/sellers"
            element={
              <AdminRoute>
                <AdminSellersPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AdminRoute>
                <AdminAnalyticsPage />
              </AdminRoute>
            }
          />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Floating AI Chat for Shoppers */}
      {!isAdminRoute && !isSellerRoute && <AiChatWidget />}

      {/* Footer */}
      <Footer />
    </div>
  );
}
