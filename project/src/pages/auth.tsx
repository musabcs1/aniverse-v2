import React, { useState } from 'react';
import { User, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/ui/Logo';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-md w-full">
          {/* Logo & Title */}
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

          {/* Form */}
          <form className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-surface p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="Choose a username"
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

            {/* Remember Me + Forgot Password */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 bg-surface-dark border-gray-600 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="text-secondary hover:text-secondary-light">
                    Forgot password?
                  </a>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full btn-primary py-3"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-800 absolute w-full"></div>
              <div className="bg-background px-4 relative z-10 text-gray-500 text-sm">
                or continue with
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="btn-ghost py-3 flex items-center justify-center">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  {/* Google icon paths */}
                </svg>
                Google
              </button>
              <button type="button" className="btn-ghost py-3 flex items-center justify-center">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  {/* Discord icon paths */}
                </svg>
                Discord
              </button>
            </div>

            {/* Toggle Login/Register */}
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

      {/* Right Side - Image & Quote */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent z-10"></div>
        <img
          src="https://images.pexels.com/photos/6898854/pexels-photo-6898854.jpeg"
          alt="Anime illustration"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-12 z-20">
          <blockquote className="text-white text-xl italic font-light mb-4">
            "Adventure awaits those brave enough to explore new worlds."
          </blockquote>
          <div className="flex items-center">
            <div className="h-px bg-white/30 flex-grow mr-4"></div>
            <p className="text-white/70 font-medium">Aniverse</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
