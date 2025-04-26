import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Bell, LogOut, User } from 'lucide-react';
import Logo from '../ui/Logo';

interface HeaderProps {
  scrolled: boolean;
  toggleMobileMenu: () => void;
  mobileMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ scrolled, toggleMobileMenu, mobileMenuOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPurpleTheme, setIsPurpleTheme] = useState(() => {
    return localStorage.getItem('theme') === 'purple';
  });

  useEffect(() => {
    // Check for user data when component mounts and when localStorage changes
    const checkAuth = () => {
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        try {
          const parsedData = JSON.parse(storedUserData);
          setUserData(parsedData);
        } catch {
          // If data is invalid, clear it
          localStorage.removeItem('userData');
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isPurpleTheme) {
      document.body.style.backgroundColor = 'purple';
    } else {
      document.body.style.backgroundColor = '';
    }
  }, [isPurpleTheme]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    setUserData(null);
    setShowProfileMenu(false);
    navigate('/');
  };

  const toggleTheme = () => {
    const newTheme = !isPurpleTheme;
    setIsPurpleTheme(newTheme);
    localStorage.setItem('theme', newTheme ? 'purple' : 'default');
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
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
            <button onClick={toggleTheme} className="btn-primary py-2 px-4">
              Toggle Purple Theme
            </button>
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
                  {userData?.role === 'admin' && (
                    <Link to="/admin" className="btn-secondary">
                      Admin Panel
                    </Link>
                  )}
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