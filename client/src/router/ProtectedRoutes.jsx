import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const ProtectedRoute = () => {
  const { user } = useSelector((state) => state.auth);

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render matching child routes
  return <Outlet />;
};

export const AdminRoute = () => {
  const { user } = useSelector((state) => state.auth);

  // User must be logged in AND have the 'admin' role
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
