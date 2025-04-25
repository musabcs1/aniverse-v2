import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Mail, Lock } from 'lucide-react';
import { query, where } from 'firebase/firestore';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]); // State to store user data

  // Check if the user is an admin
  useEffect(() => {
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      setIsAdmin(true);
    } else {
      navigate('/admin-login'); // Redirect to admin login page if not authenticated
    }
  }, [navigate]);

  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const userDocs = await getDocs(usersCollection);
      const usersData = userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Fetched Users:", usersData); // Debugging
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch users when the component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // If the user is not an admin, show nothing
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>
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
      </div>
    </div>
  );
};

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
      setError(err.message || 'An error occurred. Please try again.');
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

export { AdminPage, AdminLoginPage };