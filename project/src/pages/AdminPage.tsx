import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { collection, getDocs, deleteDoc, doc, updateDoc, increment, addDoc, serverTimestamp, arrayUnion, getDoc } from 'firebase/firestore';
import { Mail, Lock } from 'lucide-react';
import { query, where } from 'firebase/firestore';
import { ForumThread, UserRole } from '../types';
import { useUserBadges } from '../hooks/useUserBadges';
import { DEFAULT_BADGES } from '../services/badges';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
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
  const { badges, loading: badgesLoading } = useUserBadges();

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
        // Get user document to check role
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const userData = userDoc.data();
        console.log('User data loaded:', { 
          uid: auth.currentUser.uid,
          role: userData?.role,
          hasBadges: !!userData?.badges
        });

        if (!isSubscribed) return;

        // Check for admin access through badges
        const hasAdminBadge = badges.some(badge => badge.name === 'admin');
        console.log('Checking badges:', {
          badgesCount: badges.length,
          badges: badges.map(b => b.name),
          hasAdminBadge
        });

        // Check for admin role in user data
        const isAdminRole = userData?.role === 'admin';
        console.log('Admin access check:', { hasAdminBadge, isAdminRole });

        if (hasAdminBadge || isAdminRole) {
          console.log('Admin access granted');
          setIsAdmin(true);
          setIsCheckingAdmin(false);
          return;
        }

        // Legacy admin check
        const adminData = localStorage.getItem('adminData');
        console.log('Checking legacy admin data:', { hasAdminData: !!adminData });
        
        if (adminData) {
          console.log('Admin access granted via legacy data');
          setIsAdmin(true);
          setIsCheckingAdmin(false);
          return;
        }

        // No admin access found
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

  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const userDocs = await getDocs(usersCollection);
      const usersData = userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch reported threads from Firestore
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

  // Fetch users and reported threads when the component mounts
  useEffect(() => {
    fetchUsers();
    fetchReportedThreads();
  }, []);

  const handleAssignBadge = async () => {
    if (!selectedUserId || !badgeType) {
      alert('Please select a user and a badge type.');
      return;
    }

    try {
      setAssigning(true);
      const userDocRef = doc(db, 'users', selectedUserId);
      
      // Get default permissions for the badge type from DEFAULT_BADGES
      const defaultBadgeData = DEFAULT_BADGES[badgeType as UserRole];
      
      await updateDoc(userDocRef, {
        badges: arrayUnion({
          id: `${badgeType}-${Date.now()}`,
          name: badgeType, // Using name instead of type for consistency
          color: defaultBadgeData?.color || '#000000',
          permissions: defaultBadgeData?.permissions || []
        })
      });
      alert('Badge assigned successfully!');
    } catch (error) {
      console.error('Error assigning badge:', error);
      alert('Failed to assign badge. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  // Show loading state while checking admin access
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

  // If the user is not an admin, show nothing
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>

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

        <h2 className="text-2xl font-semibold mb-4">Users</h2>
        {loadingUsers ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="space-y-4">
            {users.map(user => (
              <div
                key={user.id}
                className="flex items-center bg-surface p-4 rounded-lg shadow-lg"
              >
                <img
                  src={user.avatar || 'https://via.placeholder.com/150'}
                  alt={user.username}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{user.username}</h2>
                  <p className="text-gray-400">{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-4">Reported Threads</h2>
        {loadingThreads ? (
          <p>Loading reported threads...</p>
        ) : reportedThreads.length === 0 ? (
          <p>No reported threads found.</p>
        ) : (
          <div className="space-y-4">
            {reportedThreads.map(thread => (
              <div key={thread.id} className="p-4 bg-surface rounded-lg">
                <h3 className="text-lg font-bold">{thread.title}</h3>
                <p className="text-gray-400">{thread.content}</p>
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this thread?')) {
                      try {
                        await deleteDoc(doc(db, 'forumThreads', thread.id));
                        setReportedThreads(prev => prev.filter(t => t.id !== thread.id));

                        // Deduct 10 XP from the thread owner
                        const userDocRef = doc(db, 'users', thread.authorId);
                        await updateDoc(userDocRef, {
                          xp: increment(-10), // Deduct 10 XP
                        });

                        // Send notification to the thread owner
                        const notificationsRef = collection(db, 'notifications');
                        await addDoc(notificationsRef, {
                          userId: thread.authorId,
                          message: `Your thread titled "${thread.title}" has been deleted by an admin.`,
                          createdAt: serverTimestamp(),
                          read: false,
                        });

                        alert('Thread deleted successfully. 10 XP has been deducted from the owner.');
                      } catch (error) {
                        console.error('Error deleting thread:', error);
                        alert('Failed to delete thread. Please try again.');
                      }
                    }
                  }}
                  className="text-red-500 hover:text-red-700 text-sm mt-2"
                >
                  Delete Thread
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Query the `admins` collection for the entered email
      const adminsRef = collection(db, 'admins');
      const q = query(adminsRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Invalid email or password.');
        return;
      }

      const adminData = querySnapshot.docs[0].data();

      // Password validation
      if (adminData.password !== password) {
        setError('Invalid email or password.');
        return;
      }

      // Save admin data to localStorage and navigate to the admin panel
      localStorage.setItem('adminData', JSON.stringify(adminData));
      navigate('/admin');
    } catch (err) {
      console.error('Error during admin login:', err);
      setError((err instanceof Error ? err.message : 'An error occurred. Please try again.'));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-white">
      <div className="w-full max-w-md bg-surface p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Admin Login</h2>
          <p className="text-gray-400 mt-2">Sign in to access the admin panel</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="relative mb-4">
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-surface-light py-3 pl-10 pr-4 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative mb-4">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full bg-surface-light py-3 pl-10 pr-4 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-primary py-3 rounded-lg text-white font-medium hover:bg-primary-dark transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export { AdminLoginPage };