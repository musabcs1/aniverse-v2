import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit as fbLimit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ForumThread } from '../types';

/**
 * Custom hook for real-time trending forum threads
 * @param limit - Number of threads to fetch (default: 3)
 * @returns Object containing threads data, loading state, and error
 */
export const useTrendingThreads = (limit = 3) => {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const threadsRef = collection(db, 'forumThreads');
    const threadsQuery = query(
      threadsRef,
      orderBy('upvotes', 'desc'),
      fbLimit(limit)
    );
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      threadsQuery,
      (snapshot) => {
        try {
          const threadsData = snapshot.docs.map(doc => {
            const data = doc.data();
            
            // Ensure upvotes and downvotes are arrays
            const upvotes = Array.isArray(data.upvotes) ? data.upvotes : [];
            const downvotes = Array.isArray(data.downvotes) ? data.downvotes : [];
            
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              comments: data.comments || [],
              upvotes: upvotes,
              downvotes: downvotes,
              // Ensure all fields are properly handled
              title: data.title || 'Untitled Thread',
              content: data.content || '',
              authorId: data.authorId || '',
              authorName: data.authorName || 'Anonymous',
              authorAvatar: data.authorAvatar || '',
              category: data.category || 'General',
              tags: Array.isArray(data.tags) ? data.tags : [],
              replies: data.replies || 0
            } as ForumThread;
          });
          
          setThreads(threadsData);
        } catch (err) {
          console.error("Error processing threads data:", err);
          setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error fetching trending threads:", err);
        setError(err);
        setLoading(false);
      }
    );
    
    // Clean up subscription on unmount
    return () => unsubscribe();
  }, [limit]);
  
  return { threads, loading, error };
};

export default useTrendingThreads; 