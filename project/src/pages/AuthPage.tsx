import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/ui/Logo';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        if (userCredential.user) {
          const userDocRef = doc(db, "users", userCredential.user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            localStorage.setItem('userData', JSON.stringify(userData));
            window.dispatchEvent(new Event('storage'));
            navigate('/profile');
          } else {
            console.error("User data not found in Firestore.");
          }
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userData = {
          username,
          email,
          level: 0,
          joinDate: new Date().toISOString(),
          avatar: "https://i.pravatar.cc/150?img=33",
          badges: [],
          watchlist: [],
          role: 'user',
        };

        const userDocRef = doc(db, "users", userCredential.user.uid);
        await setDoc(userDocRef, userData);

        localStorage.setItem('userData', JSON.stringify(userData));
        window.dispatchEvent(new Event('storage'));
        alert('Account created successfully!');
        navigate('/profile');
      }
    } catch (error) {
      console.error(error);
      alert('Authentication failed.');
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
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
