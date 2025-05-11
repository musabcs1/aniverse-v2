import React, { useState } from 'react';
import { 
  Bell, 
  Trash2, 
  CheckSquare, 
  Filter, 
  SlidersHorizontal,
  ArrowLeft
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from '../components/ui/NotificationItem';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const NotificationsPage: React.FC = () => {
  const { notifications, loading, unreadCount, markAllAsRead, deleteAllNotifications } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'system' | 'message' | 'activity' | 'anime'>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const navigate = useNavigate();

  // Apply filters
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      await deleteAllNotifications(notifications[0]?.userId);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const getFilterLabel = () => {
    switch (filter) {
      case 'unread': return 'Unread';
      case 'system': return 'System';
      case 'message': return 'Messages';
      case 'activity': return 'Activity';
      case 'anime': return 'Anime';
      default: return 'All';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-16 min-h-screen">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="relative w-20 h-20">
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute top-2 left-2 w-16 h-16 border-4 border-secondary border-b-transparent rounded-full animate-spin animate-delay-150"></div>
          </div>
          <h1 className="text-2xl font-bold text-white mt-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Loading notifications...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-16 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <button 
                onClick={handleGoBack}
                className="p-2 mr-3 rounded-full hover:bg-surface-dark"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-300" />
              </button>
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              {unreadCount > 0 && (
                <span className="ml-3 px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Filter button */}
              <div className="relative">
                <button 
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="p-2 rounded-full hover:bg-surface-dark text-gray-300 hover:text-white transition-colors"
                  aria-label="Filter notifications"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </button>
                
                {showFilterMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-surface rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="p-2 border-b border-surface-dark">
                      <p className="text-xs text-gray-400">Filter by</p>
                    </div>
                    {(['all', 'unread', 'system', 'message', 'activity', 'anime'] as const).map((filterType) => (
                      <button
                        key={filterType}
                        className={`w-full text-left px-4 py-2 text-sm ${filter === filterType ? 'bg-primary/20 text-primary font-medium' : 'text-gray-300 hover:bg-surface-dark'}`}
                        onClick={() => {
                          setFilter(filterType);
                          setShowFilterMenu(false);
                        }}
                      >
                        {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Mark all read button */}
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="p-2 rounded-full hover:bg-surface-dark text-gray-300 hover:text-white transition-colors"
                  aria-label="Mark all as read"
                >
                  <CheckSquare className="h-5 w-5" />
                </button>
              )}
              
              {/* Clear all button */}
              {notifications.length > 0 && (
                <button 
                  onClick={handleClearAll}
                  className="p-2 rounded-full hover:bg-surface-dark text-gray-300 hover:text-white transition-colors"
                  aria-label="Delete all notifications"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter indicator */}
          {filter !== 'all' && (
            <div className="bg-surface-dark mb-6 px-4 py-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center text-sm">
                <Filter className="h-4 w-4 mr-2 text-primary" />
                <span>Filtered by: <span className="text-primary font-medium">{getFilterLabel()}</span></span>
              </div>
              <button 
                onClick={() => setFilter('all')}
                className="text-xs text-gray-400 hover:text-white"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Notifications list */}
          {filteredNotifications.length > 0 ? (
            <div className="space-y-2">
              {filteredNotifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-full bg-surface-dark flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-gray-300">No notifications</h3>
              <p className="text-gray-400 max-w-xs">
                {filter !== 'all' 
                  ? `You don't have any ${filter === 'unread' ? 'unread' : filter} notifications at the moment.` 
                  : "You don't have any notifications at the moment."}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationsPage;