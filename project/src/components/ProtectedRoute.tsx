import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { currentUser, loading, isBanned } = useAuth();

  if (loading) {
    // Show loading indicator
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Check if user is banned
  if (currentUser && isBanned) {
    return <Navigate to="/banned" />;
  }

  // Not logged in
  if (!currentUser) {
    return <Navigate to="/auth" />;
  }

  // Check if user has admin rights for admin-only routes
  if (adminOnly && currentUser.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 