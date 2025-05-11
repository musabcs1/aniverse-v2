import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  getUserNotifications, 
  subscribeToUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
  deleteNotification
} from '../services/notifications';
import { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendNotification: (title: string, message: string, type?: 'system' | 'message' | 'activity' | 'anime', relatedId?: string) => Promise<void>;
  removeNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to refresh notifications
  const refreshNotifications = async () => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const userNotifications = await getUserNotifications(currentUser.id);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.read).length);
      setError(null);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time listener for notifications
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserNotifications(currentUser.id, (updatedNotifications) => {
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!currentUser) return;

    try {
      await markAllNotificationsAsRead(currentUser.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  // Send a notification (to the current user or another user)
  const sendNotification = async (
    title: string, 
    message: string,
    type: 'system' | 'message' | 'activity' | 'anime' = 'system',
    relatedId?: string
  ) => {
    if (!currentUser) return;
    
    try {
      await createNotification(currentUser.id, title, message, type, relatedId);
      // The real-time listener will update the notifications state
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  };

  // Remove a notification
  const removeNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      // Recalculate unread count
      setUnreadCount(notifications.filter(n => !n.read && n.id !== notificationId).length);
    } catch (error) {
      console.error('Error removing notification:', error);
      throw error;
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    sendNotification,
    removeNotification,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 