import React, { useState } from 'react';
import { User, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Logo from '../components/ui/Logo';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        // Sign in
        await signInWithEmailAndPassword(auth, email, password);
        alert('Signed in successfully!');
      } else {
        // Sign up
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Account created successfully!');
      }
      navigate('/'); // Redirect to the home page
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            <h1 className="text-3xl font-orbitron font-bold">
              {isLogin ? 'Welcome Back' : 'Join the Community'}
            </h1>
            <p className="text-gray-400 mt-2">
              {isLogin ? 'Sign in to continue to your account' : 'Create an account to start your anime journey'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleAuth}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-surface p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  className="w-full bg-surface p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-surface p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder={isLogin ? "Enter your password" : "Create a password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full btn-primary py-3"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>

            <div className="text-center mt-4">
              <p className="text-gray-400 text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  className="ml-1 text-secondary hover:text-secondary-light"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;