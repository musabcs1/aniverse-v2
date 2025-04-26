import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Heart, MessageSquare, Award, Shield 
} from 'lucide-react';
import { doc, getDoc, collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

interface UserStats {
  watching: number;
  completed: number;
  comments: number;
  reviews: number;
  threads: number; // New field for thread count
  level: number;
  xp: number;
}

const ProfilePage: React.FC = () => {
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    watching: 0,
    completed: 0,
    comments: 0,
    reviews: 0,
    threads: 0, // Initialize thread count
    level: 0,
    xp: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDataAndStats = async (uid: string) => {
      try {
        // Fetch user data
        const userDocRef = doc(db, 'users', uid);
        const userSnapshot = await getDoc(userDocRef);

        if (!userSnapshot.exists()) {
          console.error('User document not found');
          setLoading(false);
          return;
        }

        const userData = userSnapshot.data();
        setUserData(userData);

        // Calculate stats
        const watchingCount = userData.watchlist?.length || 0;
        const completedCount = userData.completed?.length || 0;

        // Count comments
        const commentsRef = collection(db, 'comments');
        const commentsQuery = query(commentsRef, where('userId', '==', uid));
        const commentsSnapshot = await getDocs(commentsQuery);
        const commentsCount = commentsSnapshot.size;

        // Count reviews
        const reviewsRef = collection(db, 'reviews');
        const reviewsQuery = query(reviewsRef, where('userId', '==', uid));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsCount = reviewsSnapshot.size;

        // Count threads
        const threadsRef = collection(db, 'forumThreads');
        const threadsQuery = query(threadsRef, where('authorId', '==', uid));
        const threadsSnapshot = await getDocs(threadsQuery);
        const threadsCount = threadsSnapshot.size;

        // Update stats
        setStats({
          watching: watchingCount,
          completed: completedCount,
          comments: commentsCount,
          reviews: reviewsCount,
          threads: threadsCount, // Update thread count
          level: userData.level || 0,
          xp: userData.xp || 0
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserDataAndStats(user.uid);
      } else {
        navigate('/auth');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-400">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-400">Please sign in to view your profile</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface rounded-xl p-5">
              <h3 className="text-xl font-semibold mb-4">Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-300">
                    <BookOpen className="h-5 w-5 mr-2 text-primary" />
                    <span>Watching</span>
                  </div>
                  <span className="text-white font-semibold">{stats.watching}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-300">
                    <Heart className="h-5 w-5 mr-2 text-accent" />
                    <span>Completed</span>
                  </div>
                  <span className="text-white font-semibold">{stats.completed}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-300">
                    <MessageSquare className="h-5 w-5 mr-2 text-secondary" />
                    <span>Comments</span>
                  </div>
                  <span className="text-white font-semibold">{stats.comments}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-300">
                    <Award className="h-5 w-5 mr-2 text-yellow-400" />
                    <span>Reviews</span>
                  </div>
                  <span className="text-white font-semibold">{stats.reviews}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-300">
                    <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                    <span>Threads</span>
                  </div>
                  <span className="text-white font-semibold">{stats.threads}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-5 border-t border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-primary" />
                    <span className="text-gray-300">Level {stats.level}</span>
                  </div>
                  <span className="text-xs text-gray-400">{stats.xp} XP</span>
                </div>
                <div className="h-2 bg-surface-light rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent" 
                    style={{ width: `${(stats.xp % 1000) / 10}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {1000 - (stats.xp % 1000)} XP until next level
                </p>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Add your main content here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;