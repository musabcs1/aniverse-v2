import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit as fbLimit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export interface Contributor {
  id: string;
  avatar: string;
  name: string;
  level: number;
  posts: number;
  badges?: string[];
}

/**
 * Custom hook for real-time top contributors data
 * @param limit - Number of contributors to fetch (default: 5)
 * @returns Object containing contributors data, loading state, and error
 */
export const useTopContributors = (limit = 5) => {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const contributorsQuery = query(
      usersRef,
      orderBy('xp', 'desc'),
      fbLimit(limit)
    );
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      contributorsQuery,
      (snapshot) => {
        try {
          const contributorsData = snapshot.docs.map(doc => {
            const data = doc.data();
            
            // Process badges to ensure they're strings
            let badges: string[] = [];
            if (data.badges) {
              if (Array.isArray(data.badges)) {
                badges = data.badges.map((badge: any) => {
                  // If badge is an object with a name property, use that
                  if (badge && typeof badge === 'object' && badge.name) {
                    return String(badge.name);
                  }
                  // If badge is a primitive value, convert to string
                  return String(badge);
                }).filter(Boolean); // Remove any empty/null values
              }
            }
            
            return {
              id: doc.id,
              avatar: data.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
              name: data.displayName || data.username || 'Anonymous User',
              level: Math.floor((data.xp || 0) / 100) + 1,
              posts: data.stats?.posts || 0,
              badges: badges
            };
          });
          
          setContributors(contributorsData);
        } catch (err) {
          console.error("Error processing contributors data:", err);
          setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error fetching top contributors:", err);
        setError(err);
        setLoading(false);
      }
    );
    
    // Clean up subscription on unmount
    return () => unsubscribe();
  }, [limit]);
  
  return { contributors, loading, error };
};

export default useTopContributors; 