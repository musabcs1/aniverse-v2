import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Bell, LogOut } from 'lucide-react';
import Logo from '../ui/Logo';
import { useUserContext } from './contexts/UserContext'; // UserContext'i import edin

interface HeaderProps {
  scrolled: boolean;
  toggleMobileMenu: () => void;
  mobileMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ scrolled, toggleMobileMenu, mobileMenuOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, clearUserData } = useUserContext(); // UserContext'ten veri alın
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    clearUserData();
    setShowProfileMenu(false);
    navigate('/');
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Logo />
            <nav className="hidden md:flex ml-8 space-x-1">
              <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
              <Link to="/anime" className={`nav-link ${isActive('/anime') ? 'active' : ''}`}>Anime</Link>
              <Link to="/forum" className={`nav-link ${isActive('/forum') ? 'active' : ''}`}>Forum</Link>
              <Link to="/news" className={`nav-link ${isActive('/news') ? 'active' : ''}`}>News</Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-surface/60 py-2 pl-10 pr-4 rounded-full w-56 focus:w-64 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            <div className="flex items-center space-x-4">
              {userData ? (
                <>
                  <button className="relative">
                    <Bell className="h-6 w-6 text-gray-300 hover:text-white transition-colors" />
                    <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
                  </button>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center space-x-2"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                        <img 
                          src={userData.avatar} 
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="text-white">{userData.username}</span>
                    </button>

                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-lg py-2">
                        <Link to="/profile" className="block px-4 py-2 text-white hover:bg-surface-light">
                          Profile
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-white hover:bg-surface-light flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link to="/auth" className="btn-primary">Sign In</Link>
              )}
            </div>
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
      </div>
    </header>
  );
};

export default Header;
