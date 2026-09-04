import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Customer State
  const [user, setUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Seller State
  const [seller, setSeller] = useState(null);
  const [isSellerLoading, setIsSellerLoading] = useState(true);

  // Admin State
  const [admin, setAdmin] = useState(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  // Load customer session
  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/api/auth/me');
      if (res.data.loggedin && res.data.user) {
        setUser(res.data.user);
        setCartCount(res.data.user.cart ? res.data.user.cart.length : 0);
        setWishlistCount(res.data.user.wishlist ? res.data.user.wishlist.length : 0);
      } else {
        setUser(null);
        setCartCount(0);
        setWishlistCount(0);
      }
    } catch {
      setUser(null);
      setCartCount(0);
      setWishlistCount(0);
    } finally {
      setIsUserLoading(false);
    }
  }, []);

  // Load seller session
  const refreshSeller = useCallback(async () => {
    try {
      const res = await api.get('/api/seller/me');
      if (res.data.loggedin && res.data.seller) {
        setSeller(res.data.seller);
      } else {
        setSeller(null);
      }
    } catch {
      setSeller(null);
    } finally {
      setIsSellerLoading(false);
    }
  }, []);

  // Load admin session
  const refreshAdmin = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/me');
      if (res.data.loggedin && res.data.admin) {
        setAdmin(res.data.admin);
      } else {
        setAdmin(null);
      }
    } catch {
      setAdmin(null);
    } finally {
      setIsAdminLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    refreshSeller();
    refreshAdmin();
  }, [refreshUser, refreshSeller, refreshAdmin]);

  // Customer Auth Actions
  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    await refreshUser();
    return res.data;
  };

  const register = async (fullname, email, password) => {
    const res = await api.post('/api/auth/register', { fullname, email, password });
    await refreshUser();
    return res.data;
  };

  const logout = async () => {
    await api.post('/api/auth/logout');
    setUser(null);
    setCartCount(0);
    setWishlistCount(0);
  };

  // Seller Auth Actions
  const sellerLogin = async (email, password) => {
    const res = await api.post('/api/seller/login', { email, password });
    await refreshSeller();
    return res.data;
  };

  const sellerRegister = async (formData) => {
    const res = await api.post('/api/seller/register', formData);
    return res.data;
  };

  const sellerLogout = async () => {
    await api.post('/api/seller/logout');
    setSeller(null);
  };

  // Admin Auth Actions
  const adminLogin = async (email, password) => {
    const res = await api.post('/api/admin/login', { email, password });
    await refreshAdmin();
    return res.data;
  };

  const adminLogout = async () => {
    await api.post('/api/admin/logout');
    setAdmin(null);
  };

  const value = {
    // Customer
    user,
    isUserLoading,
    cartCount,
    wishlistCount,
    setCartCount,
    setWishlistCount,
    login,
    register,
    logout,
    refreshUser,

    // Seller
    seller,
    isSellerLoading,
    sellerLogin,
    sellerRegister,
    sellerLogout,
    refreshSeller,

    // Admin
    admin,
    isAdminLoading,
    adminLogin,
    adminLogout,
    refreshAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
