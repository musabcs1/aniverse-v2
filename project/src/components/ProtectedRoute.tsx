import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserBadges } from '../hooks/useUserBadges';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { currentUser, loading, isBanned } = useAuth();
  const { badges, loading: badgesLoading } = useUserBadges();

  if (loading || badgesLoading) {
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
  if (adminOnly) {
    const hasAdminBadge = badges.some(badge => badge.name === 'admin');
    const isAdminRole = currentUser.role === 'admin';
    const hasLegacyAdminData = localStorage.getItem('adminData') !== null;

    if (!hasAdminBadge && !isAdminRole && !hasLegacyAdminData) {
      return <Navigate to="/admin-login" />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 