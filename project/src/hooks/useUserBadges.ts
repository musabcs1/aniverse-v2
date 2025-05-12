import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../types';

export const useUserBadges = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchBadges = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userDocRef = doc(db, 'users', currentUser.id);
        const userDocSnapshot = await getDoc(userDocRef);
        
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          if (userData.badges && Array.isArray(userData.badges)) {
            // Validate badges before setting them
            const validBadges = userData.badges.filter(badge => {
              const isValid = badge && 
                typeof badge === 'object' && 
                badge.name && 
                ['admin', 'writer', 'user', 'reviewer'].includes(badge.name);
              
              if (!isValid) {
                console.warn('Invalid badge found in user data:', badge);
              }
              
              return isValid;
            });
            
            setBadges(validBadges);
          } else {
            setBadges([]);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching user badges:', err);
        setError('Failed to load badges');
        setBadges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [currentUser]);

  return { badges, loading, error };
};