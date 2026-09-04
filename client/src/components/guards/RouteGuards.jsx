import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

export function ProtectedRoute({ children }) {
  const { user, isUserLoading } = useAuth();
  const location = useLocation();

  if (isUserLoading) {
    return <LoadingSpinner fullScreen text="Verifying session..." />;
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

export function SellerRoute({ children }) {
  const { seller, isSellerLoading } = useAuth();
  const location = useLocation();

  if (isSellerLoading) {
    return <LoadingSpinner fullScreen text="Verifying seller access..." />;
  }

  if (!seller) {
    return <Navigate to="/seller/login" state={{ from: location }} replace />;
  }

  return children;
}

export function AdminRoute({ children }) {
  const { admin, isAdminLoading } = useAuth();
  const location = useLocation();

  if (isAdminLoading) {
    return <LoadingSpinner fullScreen text="Verifying admin access..." />;
  }

  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
