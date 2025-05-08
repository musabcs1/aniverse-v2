import { useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First check if this email is in the admins collection
      const adminsRef = collection(db, 'admins');
      const q = query(adminsRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('No admin found with this email');
        setError('Invalid email or password.');
        setLoading(false);
        return;
      }

      // Now authenticate with Firebase Auth
      console.log('Authenticating with Firebase Auth');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify user has admin role or admin badge
      console.log('Checking admin status for user:', user.uid);
      
      // Get user document from Firestore
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        console.log('User document does not exist');
        setError('User account not found.');
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      const isAdminRole = userData.role === 'admin';
      const hasAdminBadge = userData.badges && 
                          userData.badges.some((badge: any) => badge.name === 'admin');
      
      console.log('Admin status check:', { isAdminRole, hasAdminBadge });

      if (!isAdminRole && !hasAdminBadge) {
        // Store admin status in localStorage for legacy support
        console.log('No admin role or badge found, using admin collection as fallback');
        const adminData = querySnapshot.docs[0].data();
        localStorage.setItem('adminData', JSON.stringify(adminData));
        
        // Add admin badge directly to the user
        console.log('Adding admin badge to user...');
        try {
          await updateDoc(userRef, {
            badges: arrayUnion({
              id: `admin-${Date.now()}`,
              name: 'admin',
              color: '#FF0000',
              permissions: ['admin_access']
            }),
            role: 'admin'
          });
          console.log('Admin badge added successfully');
        } catch (err) {
          console.error('Error adding admin badge:', err);
          // Continue anyway as we have localStorage fallback
        }
      }

      // Force token refresh
      await user.getIdToken(true);
      
      setLoading(false);
      navigate('/admin');
    } catch (err) {
      console.error("Error during admin login:", err);
      setError((err as Error).message || 'An error occurred. Please try again.');
      setLoading(false);
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-primary py-3 rounded-lg text-white font-medium hover:bg-primary-dark transition-colors"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;