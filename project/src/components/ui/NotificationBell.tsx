import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import NotificationItem from './NotificationItem';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const bellRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/notifications');
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  return (
    <div className="relative" ref={bellRef}>
      <button
        className="relative p-2 rounded-full hover:bg-surface-dark transition-all"
        onClick={handleBellClick}
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 text-xs bg-primary text-white font-semibold rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-[28rem] overflow-hidden flex flex-col bg-surface rounded-xl shadow-lg z-50">
          <div className="flex items-center justify-between p-4 border-b border-surface-dark">
            <h3 className="font-semibold text-white">Notifications</h3>
            <div className="flex items-center">
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary hover:text-primary-light transition-colors mr-4"
                >
                  Mark all as read
                </button>
              )}
              <button 
                onClick={handleViewAll}
                className="text-xs text-gray-300 hover:text-white transition-colors"
              >
                View all
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2">
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map(notification => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                <Bell className="h-10 w-10 text-gray-500 mb-2" />
                <p className="text-gray-400 text-sm">No notifications yet</p>
              </div>
            )}
          </div>
          
          {notifications.length > 5 && (
            <div className="p-3 border-t border-surface-dark">
              <button 
                onClick={handleViewAll}
                className="w-full py-2 text-center text-primary hover:text-primary-light transition-colors text-sm"
              >
                See all {notifications.length} notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 