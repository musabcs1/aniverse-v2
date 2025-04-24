import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Bell, User } from 'lucide-react';
import Logo from '../ui/Logo';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user data exists in localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-background glass-effect fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/anime" className="nav-link">Anime</Link>
          <Link to="/forum" className="nav-link">Forum</Link>
          <Link to="/news" className="nav-link">News</Link>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <input
            type="search"
            placeholder="Search..."
            className="bg-surface rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <button className="relative">
            <Bell className="h-6 w-6 text-gray-300 hover:text-white transition-colors" />
            <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </button>

          {isLoggedIn ? (
            <Link to="/profile" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </Link>
          ) : (
            <Link to="/auth" className="btn-primary">
              Sign In
            </Link>
          )}
        </div>

        <button
          className="md:hidden flex items-center"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ?
            <X className="h-6 w-6 text-white" /> :
            <Menu className="h-6 w-6 text-white" />
          }
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background py-4">
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/anime" className="nav-link">Anime</Link>
            <Link to="/forum" className="nav-link">Forum</Link>
            <Link to="/news" className="nav-link">News</Link>
            <input
              type="search"
              placeholder="Search..."
              className="bg-surface rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            {isLoggedIn ? (
              <Link to="/profile" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span>Profile</span>
              </Link>
            ) : (
              <Link to="/auth" className="btn-primary">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;