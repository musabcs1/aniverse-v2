import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, Settings, Heart, BookOpen, MessageSquare, 
  Clock, Award, ChevronRight, Edit, Shield, UserRound
} from 'lucide-react';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { updateProfile } from 'firebase/auth';
import { useParams } from 'react-router-dom';
import AnimeCard from '../components/ui/AnimeCard';
import Badge from '../components/ui/Badge';
import { UserRole, User, Anime } from '../types';

interface UserStats {
  watching: number;
  completed: number;
  comments: number;
  reviews: number;
  threads: number;
  level: number;
  xp: number;
}

const getBadgeIcon = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return <Shield className="h-5 w-5 text-primary" />;
    case 'reviewer':
      return <Award className="h-5 w-5 text-yellow-400" />;
    case 'user':
      return <UserRound className="h-5 w-5 text-secondary" />;
    default:
      return null;
  }
};

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("watchlist");
  const [userData, setUserData] = useState<User | null>(null);
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
  const [error, setError] = useState<string | null>(null);
  const { username } = useParams<{ username: string }>();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const fetchUserData = async () => {
          setLoading(true);
          setError(null);
          try {
            let targetUsername = username;

            // If no username is provided in the URL, use the logged-in user's UID
            if (!targetUsername) {
              const userDocRef = doc(db, 'users', user.uid);
              const userSnapshot = await getDoc(userDocRef);

              if (userSnapshot.exists()) {
                const userData = userSnapshot.data() as User;
                setUserData(userData);
                setAvatarURL(userData.avatar || '');
                setStats({
                  watching: userData.watchlist?.length || 0,
                  completed: userData.completed?.length || 0,
                  comments: 0,
                  reviews: 0,
                  threads: 0,
                  level: userData.level || 0,
                  xp: userData.xp || 0,
                });
                setLoading(false);
                return;
              } else {
                setError('User not found');
                setLoading(false);
                return;
              }
            }

            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('username', '==', targetUsername));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0];
              const userData = { id: userDoc.id, ...userDoc.data() } as User;
              setUserData(userData);
              setAvatarURL(userData.avatar || '');
              setStats({
                watching: userData.watchlist?.length || 0,
                completed: userData.completed?.length || 0,
                comments: 0,
                reviews: 0,
                threads: 0,
                level: userData.level || 0,
                xp: userData.xp || 0,
              });
            } else {
              setError('User not found');
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            setError('Failed to load profile data. Please try again later.');
          } finally {
            setLoading(false);
          }
        };

        fetchUserData();
      } else {
        setError('No user is logged in');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [username]);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!auth.currentUser) return;

      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data() as User;
          setUserData(userData);
        }
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      }
    };

    fetchWatchlist();
  }, []);

  useEffect(() => {
    const fetchWatchlistDetails = async () => {
      if (!auth.currentUser || !userData?.watchlist) return;

      try {
        const animeDetails = await Promise.all(
          userData.watchlist.map(async (animeId: string) => {
            const animeDocRef = doc(db, 'anime', animeId);
            const animeSnapshot = await getDoc(animeDocRef);
            return animeSnapshot.exists() ? { id: animeId, ...animeSnapshot.data() } as Anime : null;
          })
        );

        setUserData((prev) => ({
          ...prev!,
          watchlistDetails: animeDetails.filter((anime) => anime !== null),
        }));
      } catch (error) {
        console.error('Error fetching watchlist details:', error);
      }
    };

    fetchWatchlistDetails();
  }, [userData?.watchlist]);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!auth.currentUser) return;

      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userSnapshot = await getDoc(userDocRef);

        let userStats = userSnapshot.exists() ? userSnapshot.data().stats : null;

        // Fetch thread count
        const threadsQuery = query(
          collection(db, 'forumThreads'),
          where('authorId', '==', auth.currentUser.uid)
        );
        const threadsSnapshot = await getDocs(threadsQuery);
        const threadsCount = threadsSnapshot.size;

        // Update stats with thread count
        setStats({
          watching: userStats?.watching || 0,
          completed: userStats?.completed || 0,
          comments: userStats?.comments || 0,
          reviews: userStats?.reviews || 0,
          threads: threadsCount,
          level: userStats?.level || 0,
          xp: userStats?.xp || 0,
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setStats({
          watching: 0,
          completed: 0,
          comments: 0,
          reviews: 0,
          threads: 0,
          level: 0,
          xp: 0,
        });
      }
    };

    fetchUserStats();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;

    const userDocRef = doc(db, 'users', auth.currentUser.uid);

    const unsubscribeUser = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        
        // Update user data
        setUserData(prev => ({
          ...prev!,
          ...data,
          id: docSnapshot.id,
          watchlist: data.watchlist || [],
          completed: data.completed || [],
          level: data.level || 0,
          xp: data.xp || 0
        }));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          watching: data.watchlist?.length || 0,
          completed: data.completed?.length || 0,
          level: data.level || 0,
          xp: data.xp || 0
        }));
      }
    });

    const threadsQuery = query(
      collection(db, 'forumThreads'),
      where('authorId', '==', auth.currentUser.uid)
    );

    const unsubscribeThreads = onSnapshot(threadsQuery, (querySnapshot) => {
      const threadsCount = querySnapshot.size;
      let commentsCount = 0;

      querySnapshot.forEach((doc) => {
        const threadData = doc.data();
        commentsCount += threadData.comments?.length || 0;
      });

      setStats((prevStats) => ({
        ...prevStats,
        threads: threadsCount,
        comments: commentsCount,
      }));
    });

    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('authorId', '==', auth.currentUser.uid)
    );

    const unsubscribeReviews = onSnapshot(reviewsQuery, (querySnapshot) => {
      const reviewsCount = querySnapshot.size;

      setStats((prevStats) => ({
        ...prevStats,
        reviews: reviewsCount,
      }));
    });

    return () => {
      unsubscribeUser();
      unsubscribeThreads();
      unsubscribeReviews();
    };
  }, []);

  const handleAvatarUpdate = async () => {
    if (!avatarURL.trim()) {
      alert('Please provide a valid avatar URL.');
      return;
    }
    try {
      setUpdating(true);
      const userDocRef = doc(db, 'users', auth.currentUser?.uid || '');
      await updateDoc(userDocRef, { avatar: avatarURL });
      setUserData((prev) => ({ ...prev!, avatar: avatarURL }));
      alert('Avatar updated successfully!');
    } catch (error) {
      console.error('Error updating avatar:', error);
      alert('Failed to update avatar. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!userData?.username.trim()) {
      alert('Please provide a valid username.');
      return;
    }
    try {
      setUpdating(true);

      // Update username in Firestore
      const userDocRef = doc(db, 'users', auth.currentUser?.uid || '');
      await updateDoc(userDocRef, { username: userData.username });

      // Update display name in Firebase Authentication
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: userData.username });
      }

      // Update localStorage
      const updatedUserData = { ...userData, username: userData.username };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);

      alert('Username updated successfully!');
    } catch (error) {
      console.error('Error updating username:', error);
      alert('Failed to update username. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <h1 className="text-2xl font-bold text-gray-400 mt-4">Loading profile...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-400">No profile data available</h1>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = auth.currentUser?.uid === userData?.id;

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
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{userData.username}</h1>
                {userData.badges && userData.badges.map((badgeData) => (
                  <Badge 
                    key={badgeData.id} 
                    badge={{
                      ...badgeData,
                      name: badgeData.name as UserRole,
                      permissions: badgeData.permissions || []
                    }} 
                    size="sm"
                  >
                    {getBadgeIcon(badgeData.name as UserRole)}
                  </Badge>
                ))}
              </div>
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
                
                {userData.watchlistDetails && userData.watchlistDetails.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {userData.watchlistDetails.map((anime) => (
                      <AnimeCard key={anime.id} anime={anime} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No items in your watchlist yet.</p>
                )}
                
                <div className="mt-10">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Recently Completed</h2>
                    <button className="text-secondary text-sm flex items-center">
                      <span>View all</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                  
                  <div className="bg-surface-light rounded-lg p-8 text-center">
                    <UserIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
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
                  <p className="text-gray-400">No recent activity to display.</p>
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
                {userData?.badges?.some((badge) => badge.name === 'reviewer' || userData.role === 'admin') ? (
                  <button className="btn-primary py-2 px-4">
                    Write a Review
                  </button>
                ) : (
                  <p className="text-sm text-gray-400">Earn the Reviewer badge to write reviews</p>
                )}
              </div>
            )}
            
            {activeTab === 'settings' && isOwnProfile && (
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
                          onChange={(e) => setUserData((prev) => ({ ...prev!, username: e.target.value }))}
                        />
                        <button 
                          className="btn-primary py-2 px-4 mt-2"
                          onClick={handleUsernameUpdate}
                          disabled={updating}
                        >
                          {updating ? 'Applying...' : 'Apply Changes'}
                        </button>
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