import React from 'react';
import { 
  Bell, 
  MessageSquare, 
  BarChart3, 
  Film, 
  X, 
  Check 
} from 'lucide-react';
import { Notification } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const navigate = useNavigate();
  const { markAsRead, removeNotification } = useNotifications();

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-400" />;
      case 'activity':
        return <BarChart3 className="h-5 w-5 text-green-400" />;
      case 'anime':
        return <Film className="h-5 w-5 text-purple-400" />;
      case 'system':
      default:
        return <Bell className="h-5 w-5 text-yellow-400" />;
    }
  };

  const handleClick = async () => {
    await markAsRead(notification.id);
    
    // Navigate based on type and relatedId if available
    if (notification.relatedId) {
      switch (notification.type) {
        case 'message':
          navigate(`/messages/${notification.relatedId}`);
          break;
        case 'anime':
          navigate(`/anime/${notification.relatedId}`);
          break;
        case 'activity':
          navigate(`/forum/thread/${notification.relatedId}`);
          break;
        default:
          // Do nothing for system notifications
          break;
      }
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead(notification.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await removeNotification(notification.id);
  };

  return (
    <div 
      className={`p-4 mb-2 rounded-lg flex items-start transition-colors cursor-pointer hover:bg-surface-light ${
        notification.read ? 'bg-surface' : 'bg-surface-dark border-l-4 border-primary'
      }`}
      onClick={handleClick}
    >
      <div className={`p-2 rounded-full mr-3 flex-shrink-0 ${
        notification.read ? 'bg-surface-dark' : 'bg-primary/20'
      }`}>
        {getNotificationIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-white text-sm mb-1 truncate">{notification.title}</h4>
        <p className="text-gray-300 text-xs mb-2 line-clamp-2">{notification.message}</p>
        <div className="text-xs text-gray-400">
          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
        </div>
      </div>
      
      <div className="flex items-center ml-2 space-x-1">
        {!notification.read && (
          <button 
            onClick={handleMarkAsRead}
            className="p-1.5 rounded-full hover:bg-surface-dark transition-colors"
            title="Mark as read"
          >
            <Check className="h-4 w-4 text-green-400" />
          </button>
        )}
        <button 
          onClick={handleDelete}
          className="p-1.5 rounded-full hover:bg-surface-dark transition-colors"
          title="Delete notification"
        >
          <X className="h-4 w-4 text-red-400" />
        </button>
      </div>
    </div>
  );
};

export default NotificationItem; 