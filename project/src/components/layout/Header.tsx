import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Bell, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from '../ui/Logo';
import { Notification } from '../../types';
import { onSnapshot, collection, doc, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import LanguageSelector from '../LanguageSelector';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  toggleMobileMenu: () => void;
  mobileMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleMobileMenu, mobileMenuOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const notificationsRef = query(
        collection(db, 'notifications'),
        where('userId', '==', currentUser.id)
      );
      
      const notificationsUnsubscribe = onSnapshot(notificationsRef, (snapshot) => {
        const updatedNotifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title || 'Notification',
          message: doc.data().message || '',
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          read: doc.data().read || false
        })) as Notification[];
        setNotifications(updatedNotifications);
      });

      return () => {
        notificationsUnsubscribe();
      };
    } else {
      setNotifications([]);
    }
  }, [currentUser]);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/', { replace: true });
  };

  const handleNotificationsClick = () => {
    navigate('/notifications');
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
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
              <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>{t('header.home')}</Link>
              <Link to="/anime" className={`nav-link ${isActive('/anime') ? 'active' : ''}`}>{t('header.browse')}</Link>
              <Link to="/forum" className={`nav-link ${isActive('/forum') ? 'active' : ''}`}>{t('header.forum')}</Link>
              <Link to="/news" className={`nav-link ${isActive('/news') ? 'active' : ''}`}>{t('header.news')}</Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-4" style={{ position: 'absolute', top: '19px', left: '697px', height: '40px' }}>
            <div className="relative" style={{ width: '225px' }}>
              <form onSubmit={handleSearch}>
                <input 
                  type="text" 
                  placeholder={t('common.search') + "..."} 
                  className="bg-surface/60 py-2 pl-10 pr-4 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </form>
            </div>

            <button className="relative" onClick={handleNotificationsClick}>
              <Bell className="h-6 w-6 text-gray-300 hover:text-white transition-colors" />
              <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {unreadCount}
              </span>
            </button>

            <LanguageSelector />
          </div>

          {currentUser ? (
            <>
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2"
                >
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                    <img 
                      src={currentUser.avatar} 
                      alt={t('user.profile')}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-white">{currentUser.username}</span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-lg py-2">
                    <Link to="/profile" className="block px-4 py-2 text-white hover:bg-surface-light">
                      {t('user.profile')}
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-white hover:bg-surface-light flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('header.logout')}
                    </button>
                  </div>
                )}
              </div>
              {currentUser.role === 'admin' && (
                <Link to="/admin" className="btn-secondary">
                  {t('header.admin')}
                </Link>
              )}
            </>
          ) : (
            <Link to="/auth" className="btn-primary">{t('header.login')}</Link>
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
