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
      setUserId(user?.uid || null);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to real-time badge updates
  useEffect(() => {
    if (!userId) {
      setBadges([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const userDocRef = doc(db, 'users', userId);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        if (userData.badges && Array.isArray(userData.badges)) {
          const userBadges = userData.badges.map((badge: any) => ({
            id: badge.id || '',
            name: badge.type || badge.name || '',
            color: badge.color || '#000000',
            permissions: badge.permissions || []
          }));
          setBadges(userBadges);
        } else {
          setBadges([]);
        }
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