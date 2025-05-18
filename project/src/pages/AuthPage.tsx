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
    <div className="flex items-center justify-center min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: 'url("https://cdn.pixabay.com/photo/2022/10/24/09/54/nebula-7543424_1280.jpg")', 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: 'brightness(0.7)',
        animation: 'slowZoom 30s infinite alternate',
      }}></div>
      
      <style>{`
        @keyframes slowZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        
        @keyframes floatEffect {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        .title-glow {
          animation: floatEffect 6s ease-in-out infinite;
        }

        .login-float {
          animation: floatEffect 8s ease-in-out infinite 1s;
          box-shadow: 0 0 30px rgba(138, 43, 226, 0.3);
          transition: box-shadow 0.3s ease;
        }
        
        .login-float:hover {
          box-shadow: 0 0 40px rgba(186, 85, 211, 0.5);
        }
        
        .form-input {
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }
        
        .form-input:focus {
          transform: translateY(-2px);
          border: 1px solid rgba(186, 85, 211, 0.5);
          box-shadow: 0 0 15px rgba(138, 43, 226, 0.3);
        }
        
        .submit-btn {
          transition: all 0.3s ease;
        }
        
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 15px rgba(138, 43, 226, 0.5);
        }
        
        .star {
          background-color: white;
          border-radius: 50%;
          position: absolute;
          opacity: 0;
          box-shadow: 0 0 4px #fff, 0 0 8px #fff;
          z-index: 1;
          animation: twinkle 5s infinite;
        }
        
        .star-float-1 {
          animation: twinkle 5s infinite, starFloat1 15s ease-in-out infinite;
        }
        
        .star-float-2 {
          animation: twinkle 5s infinite, starFloat2 20s ease-in-out infinite;
        }
        
        .star-float-3 {
          animation: twinkle 5s infinite, starFloat3 12s ease-in-out infinite;
        }
        
        .star-large {
          width: 3px !important;
          height: 3px !important;
          box-shadow: 0 0 8px 2px #fff, 0 0 12px 4px rgba(255, 255, 255, 0.8);
        }
        
        @keyframes twinkle {
          0% { opacity: 0; }
          50% { opacity: 0.9; }
          100% { opacity: 0; }
        }
        
        @keyframes starFloat1 {
          0% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(0) translateX(10px); }
          75% { transform: translateY(10px) translateX(5px); }
          100% { transform: translateY(0) translateX(0); }
        }
        
        @keyframes starFloat2 {
          0% { transform: translateY(0) translateX(0) rotate(0deg); }
          33% { transform: translateY(-15px) translateX(-8px) rotate(5deg); }
          66% { transform: translateY(8px) translateX(15px) rotate(-5deg); }
          100% { transform: translateY(0) translateX(0) rotate(0deg); }
        }
        
        @keyframes starFloat3 {
          0% { transform: translateY(0) translateX(0); }
          20% { transform: translateY(12px) translateX(-5px); }
          40% { transform: translateY(5px) translateX(-12px); }
          60% { transform: translateY(-7px) translateX(-7px); }
          80% { transform: translateY(-12px) translateX(5px); }
          100% { transform: translateY(0) translateX(0); }
        }
      `}</style>
      
      {/* Stars effect */}
      {Array.from({ length: 100 }).map((_, i) => {
        const size = Math.random() * 3 + 1;
        const isLargeStar = Math.random() > 0.9;
        const floatPattern = Math.floor(Math.random() * 3) + 1;
        
        return (
          <div 
            key={i}
            className={`star ${isLargeStar ? 'star-large' : ''} star-float-${floatPattern}`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 5 + 3}s, ${Math.random() * 10 + 10}s`,
            }}
          />
        );
      })}
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-6 text-white title-glow" style={{
            textShadow: '0 0 20px #8a2be2, 0 0 40px #8a2be2, 0 0 60px #ba55d3, 0 0 80px #ba55d3'
          }}></h1>
        </div>
        <div className="bg-surface/80 backdrop-blur-sm p-8 rounded-lg shadow-lg login-float">
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
                  className="w-full bg-surface-light py-3 px-4 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary form-input"
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
                className="w-full bg-surface-light py-3 pl-10 pr-4 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary form-input"
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
                className="w-full bg-surface-light py-3 pl-10 pr-10 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary form-input"
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
              className="w-full bg-primary py-3 rounded-lg text-white font-medium hover:bg-primary-dark transition-colors submit-btn"
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
    </div>
  );
};

export default AuthPage;
