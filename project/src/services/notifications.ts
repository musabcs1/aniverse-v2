import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  updateDoc, 
  doc, 
  deleteDoc,
  Timestamp,
  limit,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Notification } from '../types';

/**
 * Creates a new notification for a specified user
 */
export const createNotification = async (
  userId: string, 
  title: string, 
  message: string, 
  type: 'system' | 'message' | 'activity' | 'anime' = 'system',
  relatedId?: string
) => {
  try {
    const notificationData = {
      userId,
      title,
      message,
      type,
      relatedId,
      createdAt: serverTimestamp(),
      read: false
    };
    
    const docRef = await addDoc(collection(db, 'notifications'), notificationData);
    return { id: docRef.id, ...notificationData };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Gets all notifications for a user
 */
export const getUserNotifications = async (userId: string, unreadOnly = false) => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      ...(unreadOnly ? [where('read', '==', false)] : []),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const querySnapshot = await getDocs(notificationsQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt instanceof Timestamp 
        ? doc.data().createdAt.toDate() 
        : new Date()
    })) as Notification[];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Sets up a real-time listener for a user's notifications
 */
export const subscribeToUserNotifications = (
  userId: string, 
  callback: (notifications: Notification[]) => void
) => {
  const notificationsQuery = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  
  return onSnapshot(notificationsQuery, (querySnapshot) => {
    const notifications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt instanceof Timestamp 
        ? doc.data().createdAt.toDate() 
        : new Date()
    })) as Notification[];
    
    callback(notifications);
  });
};

/**
 * Marks a notification as read
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Marks all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const querySnapshot = await getDocs(notificationsQuery);
    
    const updatePromises = querySnapshot.docs.map(docSnapshot => {
      const notificationRef = doc(db, 'notifications', docSnapshot.id);
      return updateDoc(notificationRef, { read: true });
    });
    
    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Deletes a notification
 */
export const deleteNotification = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notificationRef);
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Deletes all notifications for a user
 */
export const deleteAllNotifications = async (userId: string) => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(notificationsQuery);
    
    const deletePromises = querySnapshot.docs.map(docSnapshot => {
      const notificationRef = doc(db, 'notifications', docSnapshot.id);
      return deleteDoc(notificationRef);
    });
    
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
}; 