import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { collection, getDocs, deleteDoc, doc, updateDoc, increment, addDoc, serverTimestamp, arrayUnion, getDoc, query, where, setDoc } from 'firebase/firestore';
import { Trash, Shield, Check, Users, MessageSquare, Award, Search, ChevronUp, ChevronDown, Film, Edit, X, Info } from 'lucide-react';
import { ForumThread, UserRole, Anime, AnimeEpisodes } from '../types';
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
  
  // New state variables for anime management
  const [showAnimeManagement, setShowAnimeManagement] = useState(false);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loadingAnimes, setLoadingAnimes] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [animeSearchTerm, setAnimeSearchTerm] = useState('');
  const [editingAnime, setEditingAnime] = useState(false);
  
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

  // Add new state variables for episode management
  const [managingEpisodes, setManagingEpisodes] = useState(false);
  const [episodesData, setEpisodesData] = useState<AnimeEpisodes | null>(null);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [currentSeason, setCurrentSeason] = useState<string>('');
  const [currentEpisode, setCurrentEpisode] = useState<string>('');
  const [embedCode, setEmbedCode] = useState<string>('');
  const [episodeTitle, setEpisodeTitle] = useState<string>('');
  const [savingEpisode, setSavingEpisode] = useState(false);

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

  // Fetch all animes
  const fetchAnimes = async () => {
    try {
      setLoadingAnimes(true);
      const animesRef = collection(db, 'anime');
      const querySnapshot = await getDocs(animesRef);
      const animesData = querySnapshot.docs.map(doc => ({ 
        ...doc.data() 
      } as Anime));
      setAnimes(animesData);
    } catch (error) {
      console.error('Error fetching animes:', error);
    } finally {
      setLoadingAnimes(false);
    }
  };
  
  // Update anime
  const handleUpdateAnime = async (updatedAnime: Anime) => {
    try {
      if (!updatedAnime.id) {
        throw new Error('Anime ID is required');
      }
      
      const animeRef = doc(db, 'anime', updatedAnime.id);
      await updateDoc(animeRef, {
        ...updatedAnime,
        updatedAt: serverTimestamp(),
      });
      
      // Update the anime in the local state
      setAnimes(prevAnimes => prevAnimes.map(anime => 
        anime.id === updatedAnime.id ? updatedAnime : anime
      ));
      
      setSelectedAnime(null);
      setEditingAnime(false);
      alert('Anime updated successfully!');
    } catch (error) {
      console.error('Error updating anime:', error);
      alert('Failed to update anime');
    }
  };

  // Delete anime
  const handleDeleteAnime = async (animeId: string) => {
    if (window.confirm('Are you sure you want to delete this anime? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'anime', animeId));
        
        // Remove the anime from the local state
        setAnimes(prevAnimes => prevAnimes.filter(anime => anime.id !== animeId));
        
        if (selectedAnime?.id === animeId) {
          setSelectedAnime(null);
          setEditingAnime(false);
        }
        
        alert('Anime deleted successfully!');
      } catch (error) {
        console.error('Error deleting anime:', error);
        alert('Failed to delete anime');
      }
    }
  };
  
  // Load animes when showing anime management
  useEffect(() => {
    if (showAnimeManagement && animes.length === 0) {
      fetchAnimes();
    }
  }, [showAnimeManagement]);

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

  // Filtered animes based on search term
  const filteredAnimes = animes.filter(anime => 
    anime.title.toLowerCase().includes(animeSearchTerm.toLowerCase()) ||
    anime.studio.toLowerCase().includes(animeSearchTerm.toLowerCase()) ||
    (anime.genres && anime.genres.some(genre => 
      genre.toLowerCase().includes(animeSearchTerm.toLowerCase())
    ))
  );

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

  // Fetch episodes data for an anime
  const fetchEpisodesData = async (animeId: string) => {
    try {
      setLoadingEpisodes(true);
      const episodesRef = doc(db, 'anime_episodes', animeId);
      const episodesDoc = await getDoc(episodesRef);
      
      if (episodesDoc.exists()) {
        setEpisodesData(episodesDoc.data() as AnimeEpisodes);
      } else {
        // Initialize with empty structure if no data exists
        setEpisodesData({
          animeId,
          seasons: {}
        });
      }
    } catch (error) {
      console.error('Error fetching episodes data:', error);
      alert('Failed to load episodes data');
    } finally {
      setLoadingEpisodes(false);
    }
  };

  // Save episode data
  const saveEpisodeData = async () => {
    if (!selectedAnime || !episodesData || !currentSeason || !currentEpisode || !embedCode) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSavingEpisode(true);
      
      // Create a deep copy of the existing data
      const updatedData = JSON.parse(JSON.stringify(episodesData)) as AnimeEpisodes;
      
      // Initialize the season object if it doesn't exist
      if (!updatedData.seasons[currentSeason]) {
        updatedData.seasons[currentSeason] = {};
      }
      
      // Update the episode data
      updatedData.seasons[currentSeason][currentEpisode] = {
        embedCode,
        title: episodeTitle || `Episode ${currentEpisode}`
      };
      
      // Save to Firestore
      await setDoc(doc(db, 'anime_episodes', selectedAnime.id), updatedData);
      
      // Update the local state
      setEpisodesData(updatedData);
      
      // Update the anime to indicate it has episodes data
      if (!selectedAnime.hasEpisodesData) {
        const animeRef = doc(db, 'anime', selectedAnime.id);
        await updateDoc(animeRef, {
          hasEpisodesData: true
        });
        
        // Update local state
        setSelectedAnime({
          ...selectedAnime,
          hasEpisodesData: true
        });
      }
      
      alert('Episode data saved successfully');
      
      // Clear the form for a new entry
      setEmbedCode('');
      setEpisodeTitle('');
    } catch (error) {
      console.error('Error saving episode data:', error);
      alert('Failed to save episode data');
    } finally {
      setSavingEpisode(false);
    }
  };

  // Delete episode data
  const deleteEpisodeData = async (seasonName: string, episodeNumber: string) => {
    if (!selectedAnime || !episodesData) return;
    
    if (!window.confirm(`Are you sure you want to delete episode ${episodeNumber} from ${seasonName}?`)) {
      return;
    }
    
    try {
      // Create a deep copy of the existing data
      const updatedData = JSON.parse(JSON.stringify(episodesData)) as AnimeEpisodes;
      
      // Delete the episode
      if (updatedData.seasons[seasonName] && updatedData.seasons[seasonName][episodeNumber]) {
        delete updatedData.seasons[seasonName][episodeNumber];
        
        // Delete the season if it's empty
        if (Object.keys(updatedData.seasons[seasonName]).length === 0) {
          delete updatedData.seasons[seasonName];
        }
        
        // Update Firestore
        await setDoc(doc(db, 'anime_episodes', selectedAnime.id), updatedData);
        
        // Update local state
        setEpisodesData(updatedData);
        
        alert('Episode deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting episode:', error);
      alert('Failed to delete episode');
    }
  };

  // Load episodes data when managing episodes
  useEffect(() => {
    if (managingEpisodes && selectedAnime) {
      fetchEpisodesData(selectedAnime.id);
    }
  }, [managingEpisodes, selectedAnime]);

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

        {/* Navigation Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setShowAnimeUpload(!showAnimeUpload)}
            className={`btn ${showAnimeUpload ? 'btn-primary' : 'btn-secondary'} flex items-center space-x-2`}
          >
            <Film className="h-5 w-5" />
            <span>{showAnimeUpload ? 'Hide Upload Form' : 'Upload New Anime'}</span>
          </button>
          
          <button
            onClick={() => {
              setShowAnimeManagement(!showAnimeManagement);
              if (!showAnimeManagement && animes.length === 0) {
                fetchAnimes();
              }
            }}
            className={`btn ${showAnimeManagement ? 'btn-primary' : 'btn-secondary'} flex items-center space-x-2`}
          >
            <Film className="h-5 w-5" />
            <span>Animes</span>
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

        {/* Anime Management Section */}
        {showAnimeManagement && (
          <div className="bg-surface rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Anime Management</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search animes..."
                  className="bg-surface-dark py-2 pl-9 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={animeSearchTerm}
                  onChange={(e) => setAnimeSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            {loadingAnimes ? (
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredAnimes.length === 0 ? (
              <p className="text-gray-400">No animes found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAnimes.map(anime => (
                  <div key={anime.id} className="bg-surface-light rounded-lg overflow-hidden flex flex-col">
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={anime.coverImage || 'https://via.placeholder.com/300x200?text=No+Image'} 
                        alt={anime.title} 
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                        <div className="p-3 w-full">
                          <h3 className="text-lg font-bold line-clamp-1">{anime.title}</h3>
                          <div className="flex items-center text-sm text-gray-300">
                            <span>{anime.releaseYear}</span>
                            <span className="mx-2">•</span>
                            <span>{anime.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 flex-1">
                      <p className="text-sm text-gray-400 line-clamp-2 mb-2">{anime.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {anime.genres?.slice(0, 3).map((genre, index) => (
                          <span key={index} className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            {genre}
                          </span>
                        ))}
                        {anime.genres && anime.genres.length > 3 && (
                          <span className="text-xs bg-surface-dark px-2 py-0.5 rounded-full">
                            +{anime.genres.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-3 pt-0 flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setSelectedAnime(anime);
                          setEditingAnime(true);
                        }}
                        className="p-2 rounded-lg bg-secondary/20 text-secondary hover:bg-secondary/30 transition-colors"
                        title="Edit Anime"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setSelectedAnime(anime)}
                        className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                        title="View Details"
                      >
                        <Info className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAnime(anime.id)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                        title="Delete Anime"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Anime Details Modal */}
            {selectedAnime && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-auto">
                <div className="bg-surface rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                  <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-semibold">
                      {editingAnime ? 'Edit Anime' : managingEpisodes ? 'Manage Episodes' : selectedAnime.title}
                    </h2>
                    <button
                      onClick={() => {
                        if (managingEpisodes) {
                          setManagingEpisodes(false);
                        } else {
                          setSelectedAnime(null);
                          setEditingAnime(false);
                        }
                      }}
                      className="p-1 hover:bg-surface-dark rounded-full transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  {managingEpisodes ? (
                    <div className="p-6">
                      <div className="mb-6 flex justify-between">
                        <h3 className="text-xl font-semibold">{selectedAnime.title} - Episodes</h3>
                        <button
                          onClick={() => setManagingEpisodes(false)}
                          className="btn-secondary py-1 px-3 text-sm"
                        >
                          Back to Anime Details
                        </button>
                      </div>

                      <div className="bg-surface-dark p-4 rounded-lg mb-6">
                        <h4 className="text-lg font-medium mb-4">Add/Edit Episode</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Season</label>
                            <select
                              className="w-full bg-surface p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                              value={currentSeason}
                              onChange={(e) => setCurrentSeason(e.target.value)}
                            >
                              <option value="">Select Season</option>
                              {selectedAnime.seasons?.map((season, index) => (
                                <option key={index} value={season.name}>
                                  {season.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Episode Number</label>
                            <input
                              type="text"
                              className="w-full bg-surface p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                              placeholder="e.g. 1"
                              value={currentEpisode}
                              onChange={(e) => setCurrentEpisode(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-400 mb-1">Episode Title (Optional)</label>
                          <input
                            type="text"
                            className="w-full bg-surface p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                            placeholder="e.g. The Beginning"
                            value={episodeTitle}
                            onChange={(e) => setEpisodeTitle(e.target.value)}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-400 mb-1">Embed Code</label>
                          <textarea
                            className="w-full bg-surface p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary h-32 font-mono text-sm"
                            placeholder="Paste iframe or embed code here"
                            value={embedCode}
                            onChange={(e) => setEmbedCode(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={saveEpisodeData}
                            disabled={savingEpisode || !currentSeason || !currentEpisode || !embedCode}
                            className="btn-primary py-2 px-4 flex items-center gap-2"
                          >
                            <Check className="h-4 w-4" />
                            {savingEpisode ? 'Saving...' : 'Save Episode'}
                          </button>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h4 className="text-lg font-medium mb-4">Existing Episodes</h4>
                        {loadingEpisodes ? (
                          <div className="flex justify-center p-6">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : episodesData && Object.keys(episodesData.seasons).length > 0 ? (
                          <div className="space-y-6">
                            {Object.entries(episodesData.seasons).map(([seasonName, episodes]) => (
                              <div key={seasonName} className="bg-surface-light p-4 rounded-lg">
                                <h5 className="font-semibold mb-3">{seasonName}</h5>
                                <div className="space-y-2">
                                  {Object.entries(episodes).map(([episodeNum, episodeData]) => (
                                    <div key={episodeNum} className="flex items-center justify-between bg-surface-dark p-3 rounded-lg">
                                      <div>
                                        <span className="font-medium">Episode {episodeNum}</span>
                                        {episodeData.title && episodeData.title !== `Episode ${episodeNum}` && (
                                          <span className="ml-2 text-gray-400">- {episodeData.title}</span>
                                        )}
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => {
                                            setCurrentSeason(seasonName);
                                            setCurrentEpisode(episodeNum);
                                            setEpisodeTitle(episodeData.title || '');
                                            setEmbedCode(episodeData.embedCode);
                                          }}
                                          className="p-2 rounded-lg bg-secondary/20 text-secondary hover:bg-secondary/30 transition-colors"
                                          title="Edit Episode"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={() => deleteEpisodeData(seasonName, episodeNum)}
                                          className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                                          title="Delete Episode"
                                        >
                                          <Trash className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-surface-light p-6 rounded-lg text-center">
                            <p className="text-gray-400 mb-4">No episodes have been added yet.</p>
                            <p className="text-sm text-gray-500">Use the form above to add episodes.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : editingAnime ? (
                    <div className="p-6">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (selectedAnime) {
                            handleUpdateAnime(selectedAnime);
                          }
                        }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                            <input
                              type="text"
                              className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                              value={selectedAnime.title}
                              onChange={(e) => setSelectedAnime({...selectedAnime, title: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Cover Image URL</label>
                            <input
                              type="url"
                              className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                              value={selectedAnime.coverImage}
                              onChange={(e) => setSelectedAnime({...selectedAnime, coverImage: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Banner Image URL</label>
                            <input
                              type="url"
                              className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                              value={selectedAnime.bannerImage || ''}
                              onChange={(e) => setSelectedAnime({...selectedAnime, bannerImage: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Studio</label>
                            <input
                              type="text"
                              className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                              value={selectedAnime.studio}
                              onChange={(e) => setSelectedAnime({...selectedAnime, studio: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Release Year</label>
                            <input
                              type="number"
                              className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                              value={selectedAnime.releaseYear}
                              onChange={(e) => setSelectedAnime({...selectedAnime, releaseYear: parseInt(e.target.value)})}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                            <select
                              className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                              value={selectedAnime.status}
                              onChange={(e) => setSelectedAnime({...selectedAnime, status: e.target.value as 'Upcoming' | 'Ongoing' | 'Completed'})}
                              required
                            >
                              <option value="Upcoming">Upcoming</option>
                              <option value="Ongoing">Ongoing</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Rating</label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                              value={selectedAnime.rating}
                              onChange={(e) => setSelectedAnime({...selectedAnime, rating: parseFloat(e.target.value)})}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Episodes</label>
                            <input
                              type="number"
                              className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                              value={selectedAnime.episodes}
                              onChange={(e) => setSelectedAnime({...selectedAnime, episodes: parseInt(e.target.value)})}
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                            <textarea
                              className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary h-32"
                              value={selectedAnime.description}
                              onChange={(e) => setSelectedAnime({...selectedAnime, description: e.target.value})}
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Genres (comma-separated)</label>
                            <input
                              type="text"
                              className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                              value={selectedAnime.genres?.join(', ')}
                              onChange={(e) => setSelectedAnime({...selectedAnime, genres: e.target.value.split(',').map(g => g.trim())})}
                              placeholder="Action, Adventure, Comedy..."
                              required
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <div className="flex items-center justify-between mb-4">
                              <label className="text-sm font-medium text-gray-400">Seasons & Episodes</label>
                              <button
                                type="button"
                                onClick={() => {
                                  const seasonNumber = (selectedAnime.seasons?.length || 0) + 1;
                                  setSelectedAnime({
                                    ...selectedAnime,
                                    seasons: [...(selectedAnime.seasons || []), { name: `Season ${seasonNumber}`, episodes: 0 }]
                                  });
                                }}
                                className="text-secondary hover:text-secondary-light transition-colors"
                              >
                                + Add Season
                              </button>
                            </div>
                            
                            <div className="space-y-4">
                              {selectedAnime.seasons?.map((season, index) => (
                                <div key={index} className="flex gap-4 items-start bg-surface-dark p-4 rounded-lg">
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      className="w-full bg-surface p-3 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-secondary"
                                      value={season.name}
                                      onChange={(e) => {
                                        const updatedSeasons = [...(selectedAnime.seasons || [])];
                                        updatedSeasons[index] = {
                                          ...updatedSeasons[index],
                                          name: e.target.value
                                        };
                                        setSelectedAnime({ ...selectedAnime, seasons: updatedSeasons });
                                      }}
                                      placeholder="Season Name"
                                    />
                                    <input
                                      type="number"
                                      className="w-full bg-surface p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                                      value={season.episodes}
                                      onChange={(e) => {
                                        const updatedSeasons = [...(selectedAnime.seasons || [])];
                                        updatedSeasons[index] = {
                                          ...updatedSeasons[index],
                                          episodes: Number(e.target.value)
                                        };
                                        setSelectedAnime({ ...selectedAnime, seasons: updatedSeasons });
                                      }}
                                      placeholder="Number of Episodes"
                                      min="0"
                                    />
                                  </div>
                                  {(selectedAnime.seasons?.length || 0) > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedSeasons = (selectedAnime.seasons || []).filter((_, i) => i !== index);
                                        setSelectedAnime({ ...selectedAnime, seasons: updatedSeasons });
                                      }}
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
                        <div className="flex justify-end gap-4">
                          <button
                            type="button"
                            onClick={() => setEditingAnime(false)}
                            className="btn-secondary py-2 px-6"
                          >
                            Cancel
                          </button>
                          <button type="submit" className="btn-primary py-2 px-6">
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                        <img 
                          src={selectedAnime.bannerImage || selectedAnime.coverImage} 
                          alt={selectedAnime.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                          <div className="p-4">
                            <h3 className="text-2xl font-bold">{selectedAnime.title}</h3>
                            <div className="flex items-center text-gray-300 mt-2">
                              <span>{selectedAnime.releaseYear}</span>
                              <span className="mx-2">•</span>
                              <span>{selectedAnime.studio}</span>
                              <span className="mx-2">•</span>
                              <span>{selectedAnime.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          <h4 className="text-lg font-semibold mb-2">Description</h4>
                          <p className="text-gray-300">{selectedAnime.description}</p>
                          
                          <h4 className="text-lg font-semibold mt-6 mb-2">Genres</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedAnime.genres?.map((genre, index) => (
                              <span key={index} className="bg-primary/20 text-primary px-3 py-1 rounded-full">
                                {genre}
                              </span>
                            ))}
                          </div>
                          
                          <h4 className="text-lg font-semibold mt-6 mb-2">Seasons</h4>
                          <div className="space-y-3">
                            {selectedAnime.seasons?.map((season, index) => (
                              <div key={index} className="bg-surface-dark p-3 rounded-lg">
                                <div className="flex justify-between">
                                  <h5 className="font-medium">{season.name}</h5>
                                  <span className="text-sm text-gray-400">{season.episodes} Episodes</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div className="bg-surface-dark p-4 rounded-lg">
                            <h4 className="text-lg font-semibold mb-4">Details</h4>
                            <div className="space-y-3">
                              <div>
                                <div className="text-sm text-gray-400">Status</div>
                                <div>{selectedAnime.status}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-400">Release Year</div>
                                <div>{selectedAnime.releaseYear}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-400">Total Episodes</div>
                                <div>{selectedAnime.episodes}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-400">Rating</div>
                                <div className="flex items-center">
                                  <span className="text-yellow-500 mr-1">★</span>
                                  {selectedAnime.rating.toFixed(1)}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-400">Studio</div>
                                <div>{selectedAnime.studio}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-6 space-y-3">
                            <button
                              onClick={() => setEditingAnime(true)}
                              className="w-full btn-primary py-2 flex items-center justify-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Edit Anime
                            </button>
                            
                            <button
                              onClick={() => setManagingEpisodes(true)}
                              className="w-full btn-secondary py-2 flex items-center justify-center gap-2"
                            >
                              <Film className="h-4 w-4" />
                              Manage Episodes
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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