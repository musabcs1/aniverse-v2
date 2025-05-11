import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, LogOut, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from '../ui/Logo';
import LanguageSelector from '../LanguageSelector';
import ThemeToggle from '../ui/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../ui/NotificationBell';

interface HeaderProps {
  toggleMobileMenu: () => void;
  mobileMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleMobileMenu, mobileMenuOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/', { replace: true });
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const isDark = theme === 'dark';

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? isDark 
            ? 'bg-background/95 backdrop-blur-md shadow-lg' 
            : 'bg-light-background/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
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
                  className={`${isDark ? 'bg-surface/60' : 'bg-gray-200/80'} py-2 pl-10 pr-4 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-secondary text-sm`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </form>
            </div>

            {currentUser && (
              <>
                <NotificationBell />
                <Link to="/messages" className={`relative p-2 rounded-full ${isDark ? 'hover:bg-surface-dark' : 'hover:bg-gray-200'} transition-all`}>
                  <MessageSquare className={`h-6 w-6 ${isDark ? 'text-white' : 'text-gray-700'}`} />
                </Link>
              </>
            )}

            <ThemeToggle />
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
                  <span className={isDark ? "text-white" : "text-gray-800"}>{currentUser.username}</span>
                </button>

                {showProfileMenu && (
                  <div className={`absolute right-0 mt-2 w-48 ${isDark ? 'bg-surface' : 'bg-white'} rounded-lg shadow-lg py-2`}>
                    <Link to="/profile" className={`block px-4 py-2 ${isDark ? 'text-white hover:bg-surface-light' : 'text-gray-700 hover:bg-gray-100'}`}>
                      {t('user.profile')}
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className={`w-full text-left px-4 py-2 ${isDark ? 'text-white hover:bg-surface-light' : 'text-gray-700 hover:bg-gray-100'} flex items-center`}
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
              <X className={`h-6 w-6 ${isDark ? 'text-white' : 'text-gray-800'}`} /> : 
              <Menu className={`h-6 w-6 ${isDark ? 'text-white' : 'text-gray-800'}`} />
            }
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
