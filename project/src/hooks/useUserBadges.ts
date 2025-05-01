import { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Badge } from '../types';
import { hasPermission } from '../services/badges';

export const useUserBadges = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user?.uid) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setBadges([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to real-time badge updates
  useEffect(() => {
    if (!userId) {
      return;
    }

    setLoading(true);
    const userDocRef = doc(db, 'users', userId);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        const userBadges: Badge[] = [];

        // Handle badges array if it exists
        if (userData.badges && Array.isArray(userData.badges)) {
          userData.badges.forEach((badge: any) => {
            const badgeName = badge.type || badge.name;
            if (badgeName) {
              userBadges.push({
                id: badge.id || `${badgeName}-${Date.now()}`,
                name: badgeName,
                color: badge.color || '#000000',
                permissions: badge.permissions || []
              });
            }
          });
        }

        // Always add the user's role as a badge if it exists
        if (userData.role) {
          const existingRoleBadge = userBadges.find(b => b.name === userData.role);
          if (!existingRoleBadge) {
            userBadges.push({
              id: `role-${userData.role}-${Date.now()}`,
              name: userData.role,
              color: '#000000',
              permissions: []
            });
          }
        }

        setBadges(userBadges);
      } else {
        setBadges([]);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error in badge subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to subscribe to badge updates');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const checkPermission = (permission: string): boolean => {
    return hasPermission(badges, permission);
  };

  return { badges, loading, error, checkPermission };
};