import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { collection, getDocs, deleteDoc, doc, updateDoc, increment, addDoc, serverTimestamp, arrayUnion, getDoc, query, where, setDoc } from 'firebase/firestore';
import { Trash, Shield, Check, Users, MessageSquare, Award, Search, ChevronUp, ChevronDown, Film } from 'lucide-react';
import { ForumThread, UserRole, Anime } from '../types';
import { useUserBadges } from '../hooks/useUserBadges';
import { DEFAULT_BADGES } from '../services/badges';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role?: string;
  banned?: boolean;
  xp?: number;
  level?: number;
  stats?: {
    threads?: number;
    comments?: number;
    reviews?: number;
  };
  lastActive?: string;
}

interface AdminStats {
  totalUsers: number;
  totalThreads: number;
  totalComments: number;
  totalReviews: number;
  activeUsers: number;
  reportedContent: number;
}

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [reportedThreads, setReportedThreads] = useState<ForumThread[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [badgeType, setBadgeType] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { badges, loading: badgesLoading } = useUserBadges();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalThreads: 0,
    totalComments: 0,
    totalReviews: 0,
    activeUsers: 0,
    reportedContent: 0
  });
  const [reportedContentSearch, setReportedContentSearch] = useState('');
  const [reportedContentFilter, setReportedContentFilter] = useState<'all' | 'pending' | 'resolved'>('pending');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'username' | 'level' | 'xp' | 'threads'>('username');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAnimeUpload, setShowAnimeUpload] = useState(false);
  const [newAnime, setNewAnime] = useState<Partial<Anime>>({
    title: '',
    description: '',
    coverImage: '',
    bannerImage: '',
    episodes: 0,
    releaseYear: new Date().getFullYear(),
    rating: 0,
    status: 'Upcoming' as const,
    studio: '',
    genres: [],
    seasons: [{ name: 'Season 1', episodes: 0 }],
  });

  const [selectedSeason, setSelectedSeason] = useState(0);

  const handleSeasonChange = (index: number, field: 'name' | 'episodes', value: string | number) => {
    const updatedSeasons = [...(newAnime.seasons || [])];
    updatedSeasons[index] = {
      ...updatedSeasons[index],
      [field]: field === 'episodes' ? Number(value) : value
    };
    setNewAnime({ ...newAnime, seasons: updatedSeasons });
  };

  const addSeason = () => {
    const seasonNumber = (newAnime.seasons?.length || 0) + 1;
    setNewAnime({
      ...newAnime,
      seasons: [...(newAnime.seasons || []), { name: `Season ${seasonNumber}`, episodes: 0 }]
    });
  };

  const removeSeason = (index: number) => {
    const updatedSeasons = (newAnime.seasons || []).filter((_, i) => i !== index);
    setNewAnime({ ...newAnime, seasons: updatedSeasons });
  };

  // Check if the user has admin access
  useEffect(() => {
    let isSubscribed = true;

    const checkAdminAccess = async () => {
      console.log('Checking admin access...');
      
      if (!auth.currentUser || badgesLoading) {
        console.log('Waiting for auth or badges to load:', { 
          hasUser: !!auth.currentUser, 
          badgesLoading 
        });
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const userData = userDoc.data();
        console.log('User data loaded:', { 
          uid: auth.currentUser.uid,
          role: userData?.role,
          hasBadges: !!userData?.badges
        });

        if (!isSubscribed) return;

        const hasAdminBadge = badges.some(badge => badge.name === 'admin');
        console.log('Checking badges:', {
          badgesCount: badges.length,
          badges: badges.map(b => b.name),
          hasAdminBadge
        });

        const isAdminRole = userData?.role === 'admin';
        console.log('Admin access check:', { hasAdminBadge, isAdminRole });

        if (hasAdminBadge || isAdminRole) {
          console.log('Admin access granted');
          setIsAdmin(true);
          setIsCheckingAdmin(false);
          return;
        }

        const adminData = localStorage.getItem('adminData');
        console.log('Checking legacy admin data:', { hasAdminData: !!adminData });
        
        if (adminData) {
          console.log('Admin access granted via legacy data');
          setIsAdmin(true);
          setIsCheckingAdmin(false);
          return;
        }

        console.log('No admin access found, redirecting to login');
        setIsCheckingAdmin(false);
        navigate('/admin-login');
      } catch (error) {
        console.error('Error checking admin access:', error);
        if (isSubscribed) {
          setIsCheckingAdmin(false);
          navigate('/admin-login');
        }
      }
    };

    checkAdminAccess();

    return () => {
      isSubscribed = false;
    };
  }, [navigate, badges, badgesLoading]);

  // Fetch platform statistics
  const fetchStats = async () => {
    try {
      const usersCount = users.length;
      
      const threadsRef = collection(db, 'forumThreads');
      const threadsSnapshot = await getDocs(threadsRef);
      const totalThreads = threadsSnapshot.size;
      
      const reportedQuery = query(threadsRef, where('reported', '==', true));
      const reportedSnapshot = await getDocs(reportedQuery);
      const reportedCount = reportedSnapshot.size;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const activeUsers = users.filter(user => {
        const lastActive = user.lastActive ? new Date(user.lastActive) : null;
        return lastActive && lastActive > sevenDaysAgo;
      }).length;

      let totalComments = 0;
      let totalReviews = 0;
      
      users.forEach(user => {
        totalComments += user.stats?.comments || 0;
        totalReviews += user.stats?.reviews || 0;
      });

      setStats({
        totalUsers: usersCount,
        totalThreads,
        totalComments,
        totalReviews,
        activeUsers,
        reportedContent: reportedCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const userDocs = await getDocs(usersCollection);
      const usersData = userDocs.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as User));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch reported threads
  const fetchReportedThreads = async () => {
    try {
      const threadsRef = collection(db, 'forumThreads');
      const q = query(threadsRef, where('reported', '==', true));
      const querySnapshot = await getDocs(q);
      const threads = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumThread));
      setReportedThreads(threads);
    } catch (error) {
      console.error('Error fetching reported threads:', error);
    } finally {
      setLoadingThreads(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchReportedThreads();
    }
  }, [isAdmin]);

  // Update stats when users array changes
  useEffect(() => {
    if (users.length > 0) {
      fetchStats();
    }
  }, [users]);

  // Handle user management actions
  const handleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        banned: !isBanned
      });

      // Send notification to user
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        userId,
        message: !isBanned 
          ? 'Your account has been suspended by an administrator.' 
          : 'Your account suspension has been lifted.',
        createdAt: serverTimestamp(),
        read: false,
        type: 'system'
      });

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, banned: !isBanned } : user
      ));

      alert(isBanned ? 'User unbanned successfully.' : 'User banned successfully.');
    } catch (error) {
      console.error('Error updating user ban status:', error);
      alert('Failed to update user ban status.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // Check admin access
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
      const userData = userDoc.data();
      const hasAdminBadge = badges.some(badge => badge.name === 'admin');
      const isAdminRole = userData?.role === 'admin';

      console.log('Current user role:', userData?.role);
      console.log('Current user badges:', badges.map(badge => badge.name));

      if (!hasAdminBadge && !isAdminRole) {
        alert('You do not have the necessary permissions to delete this user.');
        return;
      }

      // Delete user's content
      const threadsRef = collection(db, 'forumThreads');
      const threadsQuery = query(threadsRef, where('authorId', '==', userId));
      const threadsSnapshot = await getDocs(threadsQuery);
      
      const deletePromises = threadsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete user document
      await deleteDoc(doc(db, 'users', userId));
      
      setUsers(prev => prev.filter(user => user.id !== userId));
      alert('User deleted successfully.');
    } catch (error) {
      console.error('Error deleting user:', error);

      // Log detailed error information
      if (error instanceof Error) {
        console.error('Error code:', error.name);
        console.error('Error message:', error.message);
      }

      // Check for Firebase permission error
      if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        alert('You do not have the necessary permissions to delete this user.');
      } else {
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleAssignBadge = async () => {
    if (!selectedUserId || !badgeType) {
      alert('Please select a user and a badge type.');
      return;
    }

    try {
      setAssigning(true);
      const userRef = doc(db, 'users', selectedUserId);
      
      const defaultBadgeData = DEFAULT_BADGES[badgeType as UserRole];
      
      await updateDoc(userRef, {
        badges: arrayUnion({
          id: `${badgeType}-${Date.now()}`,
          name: badgeType,
          color: defaultBadgeData?.color || '#000000',
          permissions: defaultBadgeData?.permissions || []
        })
      });

      // Send notification to user
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        userId: selectedUserId,
        message: `You have been awarded the ${badgeType} badge!`,
        createdAt: serverTimestamp(),
        read: false,
        type: 'badge'
      });

      alert('Badge assigned successfully!');
      setSelectedUserId('');
      setBadgeType('');
    } catch (error) {
      console.error('Error assigning badge:', error);
      alert('Failed to assign badge. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  // Handle reported content
  const handleResolveReport = async (threadId: string) => {
    try {
      const threadRef = doc(db, 'forumThreads', threadId);
      await updateDoc(threadRef, {
        reported: false
      });

      setReportedThreads(prev => prev.filter(t => t.id !== threadId));
      alert('Report resolved successfully.');
    } catch (error) {
      console.error('Error resolving report:', error);
      alert('Failed to resolve report.');
    }
  };

  const handleDeleteThread = async (thread: ForumThread) => {
    if (!window.confirm('Are you sure you want to delete this thread?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'forumThreads', thread.id));
      setReportedThreads(prev => prev.filter(t => t.id !== thread.id));

      // Deduct XP and update user stats
      const userRef = doc(db, 'users', thread.authorId);
      await updateDoc(userRef, {
        xp: increment(-10),
        'stats.threads': increment(-1)
      });

      // Send notification
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        userId: thread.authorId,
        message: `Your thread "${thread.title}" has been removed by an administrator.`,
        createdAt: serverTimestamp(),
        read: false,
        type: 'warning'
      });

      alert('Thread deleted successfully.');
    } catch (error) {
      console.error('Error deleting thread:', error);
      alert('Failed to delete thread.');
    }
  };

  // Add sort function
  const sortUsers = (users: User[]) => {
    return [...users].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortField) {
        case 'level':
          valueA = a.level || 0;
          valueB = b.level || 0;
          break;
        case 'xp':
          valueA = a.xp || 0;
          valueB = b.xp || 0;
          break;
        case 'threads':
          valueA = a.stats?.threads || 0;
          valueB = b.stats?.threads || 0;
          break;
        default:
          valueA = a.username.toLowerCase();
          valueB = b.username.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  };

  // Add bulk actions
  const handleBulkAction = async (action: 'ban' | 'unban' | 'delete') => {
    if (selectedUsers.length === 0) {
      alert('Please select users first');
      return;
    }

    if (!window.confirm(`Are you sure you want to ${action} ${selectedUsers.length} users?`)) {
      return;
    }

    try {
      const promises = selectedUsers.map(userId => {
        const userRef = doc(db, 'users', userId);
        
        switch (action) {
          case 'ban':
          case 'unban':
            return updateDoc(userRef, { banned: action === 'ban' });
          case 'delete':
            return deleteDoc(userRef);
        }
      });

      await Promise.all(promises);

      // Update UI state
      switch (action) {
        case 'ban':
        case 'unban':
          setUsers(prev => prev.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, banned: action === 'ban' } 
              : user
          ));
          break;
        case 'delete':
          setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
          break;
      }

      setSelectedUsers([]);
      alert(`Successfully ${action}ed ${selectedUsers.length} users`);
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      alert(`Failed to ${action} users. Please try again.`);
    }
  };

  // Update filtered users to include sorting
  const filteredUsers = sortUsers(users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ));

  // Filter reported content
  const filteredReportedThreads = reportedThreads.filter(thread => {
    const matchesSearch = thread.title.toLowerCase().includes(reportedContentSearch.toLowerCase()) ||
                         thread.content.toLowerCase().includes(reportedContentSearch.toLowerCase());
    const matchesFilter = reportedContentFilter === 'all' || 
                         (reportedContentFilter === 'pending' && thread.reported) ||
                         (reportedContentFilter === 'resolved' && !thread.reported);
    return matchesSearch && matchesFilter;
  });

  const handleAnimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnime.title) {
      alert('Title is required');
      return;
    }
    try {
      const animeRef = collection(db, 'anime');
      const docId = newAnime.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await setDoc(doc(animeRef, docId), {
        ...newAnime,
        id: docId,
        createdAt: serverTimestamp(),
      });
      
      alert('Anime added successfully!');
      setNewAnime({
        title: '',
        description: '',
        coverImage: '',
        bannerImage: '',
        episodes: 0,
        releaseYear: new Date().getFullYear(),
        rating: 0,
        status: 'Upcoming',
        studio: '',
        genres: [],
        seasons: [{ name: 'Season 1', episodes: 0 }],
      });
    } catch (error) {
      console.error('Error adding anime:', error);
      alert('Failed to add anime');
    }
  };

  if (isCheckingAdmin) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <h1 className="text-2xl font-bold text-gray-400 ml-4">Checking access...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>

        {/* Add Anime Upload Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowAnimeUpload(!showAnimeUpload)}
            className="btn-primary flex items-center space-x-2"
          >
            <Film className="h-5 w-5" />
            <span>{showAnimeUpload ? 'Hide Upload Form' : 'Upload New Anime'}</span>
          </button>
        </div>

        {/* Anime Upload Form */}
        {showAnimeUpload && (
          <div className="bg-surface rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Upload New Anime</h2>
            <form onSubmit={handleAnimeSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                  <input
                    type="text"
                    className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    value={newAnime.title}
                    onChange={(e) => setNewAnime({ ...newAnime, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    value={newAnime.coverImage}
                    onChange={(e) => setNewAnime({ ...newAnime, coverImage: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Banner Image URL</label>
                  <input
                    type="url"
                    className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    value={newAnime.bannerImage}
                    onChange={(e) => setNewAnime({ ...newAnime, bannerImage: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Studio</label>
                  <input
                    type="text"
                    className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    value={newAnime.studio}
                    onChange={(e) => setNewAnime({ ...newAnime, studio: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Release Year</label>
                  <input
                    type="number"
                    className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    value={newAnime.releaseYear}
                    onChange={(e) => setNewAnime({ ...newAnime, releaseYear: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                  <select
                    className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    value={newAnime.status}
                    onChange={(e) => setNewAnime({ ...newAnime, status: e.target.value as 'Upcoming' | 'Ongoing' | 'Completed' })}
                    required
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <textarea
                    className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary h-32"
                    value={newAnime.description}
                    onChange={(e) => setNewAnime({ ...newAnime, description: e.target.value })}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Genres (comma-separated)</label>
                  <input
                    type="text"
                    className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    value={newAnime.genres?.join(', ')}
                    onChange={(e) => setNewAnime({ ...newAnime, genres: e.target.value.split(',').map(g => g.trim()) })}
                    placeholder="Action, Adventure, Comedy..."
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-400">Seasons & Episodes</label>
                    <button
                      type="button"
                      onClick={addSeason}
                      className="text-secondary hover:text-secondary-light transition-colors"
                    >
                      + Add Season
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {newAnime.seasons?.map((season, index) => (
                      <div key={index} className="flex gap-4 items-start bg-surface-dark p-4 rounded-lg">
                        <div className="flex-1">
                          <input
                            type="text"
                            className="w-full bg-surface p-3 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-secondary"
                            value={season.name}
                            onChange={(e) => handleSeasonChange(index, 'name', e.target.value)}
                            placeholder="Season Name"
                          />
                          <input
                            type="number"
                            className="w-full bg-surface p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                            value={season.episodes}
                            onChange={(e) => handleSeasonChange(index, 'episodes', e.target.value)}
                            placeholder="Number of Episodes"
                            min="0"
                          />
                        </div>
                        {newAnime.seasons!.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSeason(index)}
                            className="text-red-500 hover:text-red-400 transition-colors p-2"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary py-2 px-6">
                  Upload Anime
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Statistics Dashboard */}
        <div className="bg-surface rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Platform Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-surface-light p-4 rounded-lg">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <div className="text-sm text-gray-400">Total Users</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-400">
                {stats.activeUsers} active in last 7 days
              </div>
            </div>

            <div className="bg-surface-light p-4 rounded-lg">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center mr-4">
                  <MessageSquare className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalThreads}</div>
                  <div className="text-sm text-gray-400">Total Threads</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-400">
                {stats.totalComments} comments
              </div>
            </div>

            <div className="bg-surface-light p-4 rounded-lg">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center mr-4">
                  <Award className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalReviews}</div>
                  <div className="text-sm text-gray-400">Total Reviews</div>
                </div>
              </div>
            </div>

            <div className="bg-surface-light p-4 rounded-lg">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center mr-4">
                  <Shield className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.reportedContent}</div>
                  <div className="text-sm text-gray-400">Reported Content</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badge Assignment Section */}
        <div className="bg-surface rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Assign Badge</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">User ID</label>
              <input
                type="text"
                className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                placeholder="Enter user ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Badge Type</label>
              <select
                className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                value={badgeType}
                onChange={(e) => setBadgeType(e.target.value)}
              >
                <option value="">Select a badge</option>
                <option value="reviewer">Reviewer</option>
                <option value="writer">Writer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              className="btn-primary py-2 px-4"
              onClick={handleAssignBadge}
              disabled={assigning}
            >
              {assigning ? 'Assigning...' : 'Assign Badge'}
            </button>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-surface rounded-xl p-6 mb-8">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">User Management</h2>
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="bg-surface-dark py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary pr-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="bg-surface-dark py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as 'username' | 'level' | 'xp' | 'threads')}
                >
                  <option value="username">Sort by Name</option>
                  <option value="level">Sort by Level</option>
                  <option value="xp">Sort by XP</option>
                  <option value="threads">Sort by Threads</option>
                </select>
                <button
                  onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-2 rounded-lg bg-surface-dark hover:bg-surface-light transition-colors"
                >
                  {sortDirection === 'asc' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-4 p-4 bg-surface-dark rounded-lg">
                <span className="text-sm text-gray-400">{selectedUsers.length} users selected</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction('ban')}
                    className="btn-danger py-1 px-3 text-sm"
                  >
                    Ban Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction('unban')}
                    className="btn-secondary py-1 px-3 text-sm"
                  >
                    Unban Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="btn-danger py-1 px-3 text-sm"
                  >
                    Delete Selected
                  </button>
                  <button
                    onClick={() => setSelectedUsers([])}
                    className="btn-secondary py-1 px-3 text-sm"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}
          </div>

          {loadingUsers ? (
            <div className="flex justify-center mt-6">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-gray-400 mt-6">No users found.</p>
          ) : (
            <div className="grid gap-4 mt-6">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={`flex items-center bg-surface-light p-4 rounded-lg ${
                    user.banned ? 'opacity-75 border-l-4 border-red-500' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(prev => [...prev, user.id]);
                      } else {
                        setSelectedUsers(prev => prev.filter(id => id !== user.id));
                      }
                    }}
                    className="mr-4 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <img
                    src={user.avatar || 'https://via.placeholder.com/150'}
                    alt={user.username}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{user.username}</h3>
                      {user.role === 'admin' && (
                        <Shield className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-gray-400">{user.email}</p>
                    <div className="flex gap-4 text-sm text-gray-400 mt-1">
                      <span>Level {user.level || 1}</span>
                      <span>{user.xp || 0} XP</span>
                      <span>{user.stats?.threads || 0} Threads</span>
                      <span>{user.stats?.comments || 0} Comments</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBanUser(user.id, user.banned || false)}
                      className={`p-2 rounded-lg transition-colors ${
                        user.banned
                          ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                          : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                      }`}
                      title={user.banned ? 'Unban User' : 'Ban User'}
                    >
                      {user.banned ? <Check className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                      title="Delete User"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reported Content Section */}
        <div className="bg-surface rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Reported Content</h2>
            <div className="flex gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search reported content..."
                  className="bg-surface-dark py-2 pl-9 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={reportedContentSearch}
                  onChange={(e) => setReportedContentSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <select
                className="bg-surface-dark py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                value={reportedContentFilter}
                onChange={(e) => setReportedContentFilter(e.target.value as 'all' | 'pending' | 'resolved')}
              >
                <option value="all">All Reports</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {loadingThreads ? (
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredReportedThreads.length === 0 ? (
            <p className="text-gray-400">No reported content found.</p>
          ) : (
            <div className="space-y-4">
              {filteredReportedThreads.map(thread => (
                <div key={thread.id} className="bg-surface-light p-4 rounded-lg">
                  <h3 className="text-lg font-bold mb-2">{thread.title}</h3>
                  <p className="text-gray-400 mb-4">{thread.content}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolveReport(thread.id)}
                      className="btn-secondary py-1 px-3 text-sm"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleDeleteThread(thread)}
                      className="btn-danger py-1 px-3 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;