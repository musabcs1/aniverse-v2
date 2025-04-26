import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Bell, LogOut } from 'lucide-react';
import Logo from '../ui/Logo';
import { Notification } from '../../types';
import { onSnapshot, collection } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface HeaderProps {
  toggleMobileMenu: () => void;
  mobileMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleMobileMenu, mobileMenuOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotificationsTray, setShowNotificationsTray] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

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
    const notificationsRef = collection(db, 'notifications');
    const unsubscribe = onSnapshot(notificationsRef, (snapshot) => {
      const updatedNotifications = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Untitled',
          message: data.message || 'No message',
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          read: data.read || false,
        };
      });
      setNotifications(updatedNotifications);
    });

    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const trayElement = document.querySelector('.notifications-tray');
      if (trayElement && !trayElement.contains(event.target as Node)) {
        setShowNotificationsTray(false);
      }
    };

    if (showNotificationsTray) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationsTray]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    setUserData(null);
    setShowProfileMenu(false);
    navigate('/');
  };

  const toggleNotificationsTray = () => {
    setShowNotificationsTray(!showNotificationsTray);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

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

          <div className="hidden md:flex items-center space-x-4" style={{ position: 'absolute', top: '19px', left: '697px', height: '40px' }}>
            <div className="relative" style={{ width: '225px' }}>
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-surface/60 py-2 pl-10 pr-4 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            <button className="relative" onClick={toggleNotificationsTray}>
              <Bell className="h-6 w-6 text-gray-300 hover:text-white transition-colors" />
              <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {unreadCount}
              </span>
            </button>

            {showNotificationsTray && (
              <div className="absolute right-0 mt-[45px] w-64 bg-surface rounded-lg shadow-lg py-2 notifications-tray">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.id} className="px-4 py-2 text-white hover:bg-surface-light">
                      <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                      <p className="text-xs text-gray-400 mb-1">{notification.message}</p>
                      <span className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-400">No notifications</div>
                )}
              </div>
            )}
          </div>

          {userData ? (
            <>
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