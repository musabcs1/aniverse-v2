import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Default values for community stats
export const DEFAULT_STATS = {
  activeMembers: 1250,
  discussions: 845,
  postsThisMonth: 2340,
  memberGrowth: "+5%",
  discussionGrowth: "+12%",
  postGrowth: "+8%"
};

export interface CommunityStats {
  activeMembers: number;
  discussions: number;
  postsThisMonth: number;
  memberGrowth: string;
  discussionGrowth: string;
  postGrowth: string;
}

/**
 * Custom hook for real-time community stats
 * @param statsId - ID of the stats document (default: 'general')
 * @returns Object containing stats data, loading state, and error
 */
export const useCommunityStats = (statsId = 'general') => {
  const [stats, setStats] = useState<CommunityStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const statsRef = doc(db, 'communityStats', statsId);
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      statsRef,
      async (docSnapshot) => {
        try {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            
            // Process and validate the data
            const processedStats: CommunityStats = {
              activeMembers: typeof data.activeMembers === 'number' ? data.activeMembers : DEFAULT_STATS.activeMembers,
              discussions: typeof data.discussions === 'number' ? data.discussions : DEFAULT_STATS.discussions,
              postsThisMonth: typeof data.postsThisMonth === 'number' ? data.postsThisMonth : DEFAULT_STATS.postsThisMonth,
              memberGrowth: typeof data.memberGrowth === 'string' ? data.memberGrowth : DEFAULT_STATS.memberGrowth,
              discussionGrowth: typeof data.discussionGrowth === 'string' ? data.discussionGrowth : DEFAULT_STATS.discussionGrowth,
              postGrowth: typeof data.postGrowth === 'string' ? data.postGrowth : DEFAULT_STATS.postGrowth
            };
            
            setStats(processedStats);
          } else {
            // If document doesn't exist, create it with default values
            console.log("Creating default community stats document");
            await setDoc(statsRef, DEFAULT_STATS);
            setStats(DEFAULT_STATS);
          }
        } catch (err) {
          console.error("Error processing community stats:", err);
          setError(err instanceof Error ? err : new Error('Unknown error occurred'));
          setStats(DEFAULT_STATS);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error fetching community stats:", err);
        setError(err);
        setStats(DEFAULT_STATS);
        setLoading(false);
      }
    );
    
    // Clean up subscription on unmount
    return () => unsubscribe();
  }, [statsId]);
  
  return { stats, loading, error };
};

export default useCommunityStats; 