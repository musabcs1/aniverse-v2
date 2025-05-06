import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import Logo from '../components/ui/Logo';
import { initializeBadges, getUserBadges } from '../services/badges';

interface UserData {
  id: string;
  username?: string;
  email?: string;
  banned?: boolean;
  watchlist?: any[];
  watchlistDetails?: any[];
  completed?: any[];
  level?: number;
  xp?: number;
  role?: string;
  badges?: any[];
  avatar?: string;
  joinDate?: string;
  [key: string]: any; // For other possible fields
}

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Redirect to home page if the user is already logged in
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const userData = JSON.parse(storedUserData) as UserData;
      // Check if user is banned
      if (userData.banned) {
        navigate('/banned');
      } else {
        navigate('/');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          setError('User data not found.');
          return;
        }

        const userData: UserData = {
          id: userDoc.id,
          ...userDoc.data(),
          watchlist: userDoc.data().watchlist || [],
          level: userDoc.data().level || 0,
          xp: userDoc.data().xp || 0
        };
        
        // Check if user is banned
        if (userData.banned) {
          localStorage.setItem('userData', JSON.stringify(userData));
          navigate('/banned');
          return;
        }
        
        localStorage.setItem('userData', JSON.stringify(userData));
        navigate('/profile');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Initialize badges if needed
        await initializeBadges();
        
        // Get default user badge
        const defaultBadges = await getUserBadges('user');
        
        const userData: UserData = {
          id: userCredential.user.uid,
          username,
          email,
          joinDate: new Date().toISOString(),
          avatar: 'https://secure.gravatar.com/avatar/f0431f05c802c06f06a3e5997b3053df/?default=https%3A%2F%2Fus.v-cdn.net%2F5020483%2Fuploads%2Fdefaultavatar%2FK2266OAKOLNC.jpg&rating=g&size=200',
          role: 'user',
          badges: defaultBadges,
          watchlist: [],
          watchlistDetails: [],
          completed: [],
          level: 0,
          xp: 0,
          banned: false
        };

        const userDocRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userDocRef, userData);

        localStorage.setItem('userData', JSON.stringify(userData));
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error during user authentication:', error);
      setError((error as any).message || 'Authentication failed.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-white">
      <div className="w-full max-w-md bg-surface p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <Logo />
          </div>
          <h2 className="text-3xl font-bold">{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
          <p className="text-gray-400 mt-2">
            {isLogin ? 'Sign in to continue to your account' : 'Sign up to get started'}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Enter your username"
                className="w-full bg-surface-light py-3 px-4 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}
          <div className="relative mb-4">
            <MailIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
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
            <LockIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="w-full bg-surface-light py-3 pl-10 pr-10 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-3.5 text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-primary py-3 rounded-lg text-white font-medium hover:bg-primary-dark transition-colors"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <span
            className="text-primary cursor-pointer hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
