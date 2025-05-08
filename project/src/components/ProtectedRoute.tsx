import React, { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserBadges } from '../hooks/useUserBadges';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { currentUser, loading, isBanned } = useAuth();
  const { badges, loading: badgesLoading } = useUserBadges();

  useEffect(() => {
    if (adminOnly && currentUser) {
      console.log('ProtectedRoute: Admin check for user:', currentUser.email);
      console.log('ProtectedRoute: Badges:', badges.map(b => b.name));
      console.log('ProtectedRoute: User role:', currentUser.role);
      console.log('ProtectedRoute: Legacy admin:', localStorage.getItem('adminData') !== null);
      
      // Additional check in Firestore for admin collection
      const checkAdminInFirestore = async () => {
        try {
          // Access the correct uid property from Firebase User
          const userId = currentUser.email || '';
          const adminDoc = await getDoc(doc(db, 'admins', userId));
          console.log('ProtectedRoute: User in admins collection:', adminDoc.exists());
        } catch (error) {
          console.error('ProtectedRoute: Error checking admin status in Firestore:', error);
        }
      };
      
      checkAdminInFirestore();
    }
  }, [adminOnly, currentUser, badges]);

  if (loading || badgesLoading) {
    // Show loading indicator
    console.log('ProtectedRoute: Loading state...', { userLoading: loading, badgesLoading });
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Check if user is banned
  if (currentUser && isBanned) {
    console.log('ProtectedRoute: User is banned, redirecting');
    return <Navigate to="/banned" />;
  }

  // Not logged in
  if (!currentUser) {
    console.log('ProtectedRoute: User not logged in, redirecting to auth');
    return <Navigate to="/auth" />;
  }

  // Check if user has admin rights for admin-only routes
  if (adminOnly) {
    const hasAdminBadge = badges.some(badge => badge.name === 'admin');
    const isAdminRole = currentUser.role === 'admin';
    const hasLegacyAdminData = localStorage.getItem('adminData') !== null;
    
    console.log('ProtectedRoute: Admin access check result:', {
      hasAdminBadge,
      isAdminRole,
      hasLegacyAdminData,
      granted: hasAdminBadge || isAdminRole || hasLegacyAdminData
    });

    if (!hasAdminBadge && !isAdminRole && !hasLegacyAdminData) {
      console.log('ProtectedRoute: Admin access denied, redirecting to login');
      return <Navigate to="/admin-login" />;
    } else {
      console.log('ProtectedRoute: Admin access granted');
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 