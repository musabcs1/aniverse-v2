import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Home, Film, MessageSquare, Newspaper, User, Bell, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from '../ui/Logo';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import LanguageSelector from '../LanguageSelector';

interface MobileMenuProps {
  isOpen: boolean;
  closeMenu: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, closeMenu }) => {
  const [userData, setUserData] = useState<any | null>(null);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  useEffect(() => {
    // Only fetch notifications if there's a user logged in
    if (!auth.currentUser) {
      setNotificationsCount(0);
      return;
    }

    const notificationsRef = collection(db, 'notifications');
    // Query only notifications for the current user
    const q = query(notificationsRef, where('userId', '==', auth.currentUser.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotificationsCount(snapshot.size);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setNotificationsCount(0);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    setUserData(null);
    closeMenu();
    navigate('/');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col md:hidden">
      <div className="px-4 py-4 flex items-center justify-between border-b border-gray-800">
        <Logo />
        <button onClick={closeMenu} className="text-white">
          <X className="h-6 w-6" />
        </button>
      </div>
      
      <div className="p-4">
        <div className="relative mb-6">
          <input 
            type="text" 
            placeholder={t('common.search') + "..."} 
            className="bg-surface/60 py-3 pl-10 pr-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-secondary text-white"
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-dark">
            <span className="text-lg font-medium">{t('common.language')}</span>
            <LanguageSelector />
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-2 overflow-y-auto">
        <ul className="space-y-4">
          <li>
            <Link to="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface" onClick={closeMenu}>
              <Home className="h-6 w-6 text-primary" />
              <span className="text-lg font-medium">{t('header.home')}</span>
            </Link>
          </li>
          <li>
            <Link to="/anime" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface" onClick={closeMenu}>
              <Film className="h-6 w-6 text-primary" />
              <span className="text-lg font-medium">{t('header.browse')}</span>
            </Link>
          </li>
          <li>
            <Link to="/forum" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface" onClick={closeMenu}>
              <MessageSquare className="h-6 w-6 text-primary" />
              <span className="text-lg font-medium">{t('header.forum')}</span>
            </Link>
          </li>
          <li>
            <Link to="/news" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface" onClick={closeMenu}>
              <Newspaper className="h-6 w-6 text-primary" />
              <span className="text-lg font-medium">{t('header.news')}</span>
            </Link>
          </li>
          <li>
            <Link to="/profile" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface" onClick={closeMenu}>
              <User className="h-6 w-6 text-primary" />
              <span className="text-lg font-medium">{t('user.profile')}</span>
            </Link>
          </li>
          <li>
            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface">
              <Bell className="h-6 w-6 text-primary" />
              <span className="text-lg font-medium">{t('user.notifications')}</span>
              <span className="bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-auto">
                {notificationsCount}
              </span>
            </div>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        {userData ? (
          <button 
            onClick={handleLogout}
            className="block w-full py-3 text-center font-medium text-white bg-surface rounded-lg"
          >
            {t('header.logout')}
          </button>
        ) : (
          <Link 
            to="/auth" 
            className="block w-full py-3 text-center font-medium text-white bg-primary rounded-lg"
            onClick={closeMenu}
          >
            {t('header.login')}
          </Link>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;