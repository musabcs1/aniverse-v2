import React, { useEffect, useState } from 'react';
import { onSnapshot, query, collection, where } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = (userId: string) => {
      const notificationsRef = query(
        collection(db, 'notifications'),
        where('userId', '==', userId)
      );

      const unsubscribe = onSnapshot(notificationsRef, (snapshot) => {
        const updatedNotifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(updatedNotifications);
        setLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchNotifications(user.uid);
      } else {
        setNotifications([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ marginTop: '4rem' }}>
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      {notifications.length > 0 ? (
        <ul className="space-y-4">
          {notifications.map((notification) => (
            <li key={notification.id} className="bg-surface-light p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
              <p className="text-xs text-gray-400 mb-1">{notification.message}</p>
              <span className="text-xs text-gray-500">
                {new Date(notification.timestamp).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No notifications available.</p>
      )}
    </div>
  );
};

export default NotificationsPage;