import React from 'react';
import { Link } from 'react-router-dom';
import { X, Home, Film, MessageSquare, Newspaper, User, Bell, Search } from 'lucide-react';
import Logo from '../ui/Logo';

interface MobileMenuProps {
  isOpen: boolean;
  closeMenu: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, closeMenu }) => {
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
            placeholder="Search anime..." 
            className="bg-surface/60 py-3 pl-10 pr-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-secondary text-white"
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-2 overflow-y-auto">
        <ul className="space-y-4">
          <li>
            <Link to="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface" onClick={closeMenu}>
              <Home className="h-6 w-6 text-secondary" />
              <span className="text-lg font-medium">Home</span>
            </Link>
          </li>
          <li>
            <Link to="/anime" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface" onClick={closeMenu}>
              <Film className="h-6 w-6 text-secondary" />
              <span className="text-lg font-medium">Anime</span>
            </Link>
          </li>
          <li>
            <Link to="/forum" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface" onClick={closeMenu}>
              <MessageSquare className="h-6 w-6 text-secondary" />
              <span className="text-lg font-medium">Forum</span>
            </Link>
          </li>
          <li>
            <Link to="/news" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface" onClick={closeMenu}>
              <Newspaper className="h-6 w-6 text-secondary" />
              <span className="text-lg font-medium">News</span>
            </Link>
          </li>
          <li>
            <Link to="/profile" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface" onClick={closeMenu}>
              <User className="h-6 w-6 text-secondary" />
              <span className="text-lg font-medium">Profile</span>
            </Link>
          </li>
          <li>
            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface">
              <Bell className="h-6 w-6 text-secondary" />
              <span className="text-lg font-medium">Notifications</span>
              <span className="bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-auto">
                3
              </span>
            </div>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <Link 
          to="/auth" 
          className="block w-full py-3 text-center font-medium text-white bg-primary rounded-lg"
          onClick={closeMenu}
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default MobileMenu;