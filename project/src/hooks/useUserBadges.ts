import { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { Badge, UserRole } from '../types';
import { getUserBadges, hasPermission } from '../services/badges';

export const useUserBadges = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserBadges = async () => {
      if (!auth.currentUser) {
        setBadges([]);
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userRole = userData.role as UserRole;
          const userBadges = await getUserBadges(userRole);
          setBadges(userBadges);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user badges');
      } finally {
        setLoading(false);
      }
    };

    fetchUserBadges();
  }, []);

  const checkPermission = (permission: string): boolean => {
    return hasPermission(badges, permission);
  };

  return { badges, loading, error, checkPermission };
};