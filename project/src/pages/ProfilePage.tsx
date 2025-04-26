import React, { useState, useEffect } from 'react';
import { 
  User, Settings, Shield, Heart, BookOpen, MessageSquare, 
  Clock, Award, ChevronRight, Edit
} from 'lucide-react';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

interface UserStats {
  watching: number;
  completed: number;
  comments: number;
  reviews: number;
  threads: number;
  level: number;
  xp: number;
}

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("watchlist");
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarURL, setAvatarURL] = useState('');
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    watching: 0,
    completed: 0,
    comments: 0,
    reviews: 0,
    threads: 0,
    level: 0,
    xp: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDataAndStats = async (uid: string) => {
      try {
        const userDocRef = doc(db, 'users', uid);
        const userSnapshot = await getDoc(userDocRef);

        if (!userSnapshot.exists()) {
          console.error('User document not found');
          navigate('/auth');
          return;
        }

        const userData = userSnapshot.data();
        setUserData(userData);
        setAvatarURL(userData.avatar || '');

        const watchingCount = userData.watchlist?.length || 0;
        const completedCount = userData.completed?.length || 0;

        const commentsSnapshot = await getDocs(query(collection(db, 'comments'), where('userId', '==', uid)));
        const reviewsSnapshot = await getDocs(query(collection(db, 'reviews'), where('userId', '==', uid)));
        const threadsSnapshot = await getDocs(query(collection(db, 'forumThreads'), where('authorId', '==', uid)));

        setStats({
          watching: watchingCount,
          completed: completedCount,
          comments: commentsSnapshot.size,
          reviews: reviewsSnapshot.size,
          threads: threadsSnapshot.size,
          level: userData.level || 0,
          xp: userData.xp || 0,
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

  const handleAvatarUpdate = async () => {
    if (!avatarURL.trim()) {
      alert('Please provide a valid avatar URL.');
      return;
    }
    try {
      setUpdating(true);
      const userDocRef = doc(db, 'users', auth.currentUser?.uid || '');
      await updateDoc(userDocRef, { avatar: avatarURL });
      setUserData((prev: any) => ({ ...prev, avatar: avatarURL }));
      alert('Avatar updated successfully!');
    } catch (error) {
      console.error('Error updating avatar:', error);
      alert('Failed to update avatar. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

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
    return null;
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="bg-surface rounded-xl overflow-hidden mb-8">
          <div className="h-40 bg-gradient-to-r from-primary/30 to-accent/30 relative">
            <button className="absolute top-4 right-4 bg-surface/30 backdrop-blur-sm p-2 rounded-lg text-white hover:bg-surface/50 transition-colors">
              <Edit className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-5 flex flex-col md:flex-row items-start md:items-center relative">
            <div className="absolute -top-16 left-6 h-24 w-24 rounded-full border-4 border-surface overflow-hidden">
              <img src={userData.avatar} alt={userData.username} className="h-full w-full object-cover" />
            </div>

            <div className="mt-10 md:mt-0 md:ml-28">
              <h1 className="text-2xl font-bold text-white">{userData.username}</h1>
              <div className="flex items-center text-gray-400 text-sm mt-1">
                <Clock className="h-4 w-4 mr-1" />
                <span>Member since {new Date(userData.joinDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex mt-4 md:mt-0 md:ml-auto space-x-3">
              <button 
                className="btn-ghost py-2 px-4 flex items-center space-x-2"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
              <button className="btn-primary py-2 px-4">
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>

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
                <div className="bg-surface rounded-xl p-5">
                  <h3 className="text-xl font-semibold mb-4">Level & XP</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Level {stats.level}</span>
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
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs Navigation */}
            <div className="border-b border-gray-800 mb-6">
              <div className="flex space-x-8">
                <button 
                  className={`pb-3 relative ${
                    activeTab === 'watchlist' 
                      ? 'text-white font-medium' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('watchlist')}
                >
                  Watchlist
                  {activeTab === 'watchlist' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"></span>
                  )}
                </button>
                
                <button 
                  className={`pb-3 relative ${
                    activeTab === 'activity' 
                      ? 'text-white font-medium' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('activity')}
                >
                  Activity
                  {activeTab === 'activity' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"></span>
                  )}
                </button>
                
                <button 
                  className={`pb-3 relative ${
                    activeTab === 'reviews' 
                      ? 'text-white font-medium' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews
                  {activeTab === 'reviews' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"></span>
                  )}
                </button>
                
                <button 
                  className={`pb-3 relative ${
                    activeTab === 'settings' 
                      ? 'text-white font-medium' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('settings')}
                >
                  Settings
                  {activeTab === 'settings' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"></span>
                  )}
                </button>
              </div>
            </div>
            
            {/* Tab Content */}
            {activeTab === 'watchlist' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">My Watchlist</h2>
                  <button className="text-secondary text-sm flex items-center">
                    <span>View all</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/*watchlistAnime.map(anime => (
                    <AnimeCard key={anime.id} anime={anime} />
                  ))*/}
                </div>
                
                <div className="mt-10">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Recently Completed</h2>
                    <button className="text-secondary text-sm flex items-center">
                      <span>View all</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                  
                  <div className="bg-surface-light rounded-lg p-8 text-center">
                    <User className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">No completed anime yet</h3>
                    <p className="text-gray-400 mb-6">
                      Start marking shows as completed to track your anime journey.
                    </p>
                    <button className="btn-primary py-2 px-4">
                      Browse Anime
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'activity' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
                
                <div className="space-y-4">
                  {/*recentActivity.map(activity => (
                    <div key={activity.id} className="bg-surface p-4 rounded-lg">
                      <div className="flex items-start">
                        <img 
                          src={userData.avatar} 
                          alt={userData.username} 
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="text-white">
                            <span className="font-medium">{userData.username}</span> {activity.content}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))*/}
                </div>
                
                <button className="w-full mt-8 py-3 text-center text-secondary border border-secondary/30 rounded-lg hover:bg-secondary/10 transition-colors">
                  Load More Activity
                </button>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="bg-surface-light rounded-lg p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No reviews yet</h3>
                <p className="text-gray-400 mb-6">
                  Share your thoughts on anime by writing reviews.
                </p>
                <button className="btn-primary py-2 px-4">
                  Write a Review
                </button>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="bg-surface rounded-xl p-6">
                <h2 className="text-2xl font-semibold mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                        <input 
                          type="text" 
                          className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                          value={userData.username}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input 
                          type="email" 
                          className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                          value={userData.email}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Avatar</h3>
                    <div className="flex items-center">
                      <img 
                        src={userData.avatar} 
                        alt={userData.username} 
                        className="w-16 h-16 rounded-full mr-4"
                      />
                      <div className="flex flex-col">
                        <input 
                          type="text" 
                          className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary mb-2"
                          value={avatarURL}
                          onChange={(e) => setAvatarURL(e.target.value)}
                          placeholder="Enter avatar URL"
                        />
                        <button 
                          className="btn-primary py-2 px-4"
                          onClick={handleAvatarUpdate}
                          disabled={updating}
                        >
                          {updating ? 'Updating...' : 'Update Avatar'}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Password</h3>
                    <button className="btn-ghost py-2 px-4">
                      Change Password
                    </button>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-800">
                    <button className="btn-primary py-2 px-6">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;