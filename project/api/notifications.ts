import { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../src/firebaseConfig'; // Adjusted the path to match the correct location

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(notifications);
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error('Firebase error:', error.message);
        res.status(500).json({ error: 'Firebase error occurred' });
      } else {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Unexpected error occurred' });
      }
    }
  } else if (req.method === 'POST') {
    const { userId, notification } = req.body;
    if (!userId || !notification) {
      return res.status(400).json({ error: 'Missing userId or notification in request body' });
    }

    try {
      const newNotificationRef = doc(collection(db, 'notifications'));
      await setDoc(newNotificationRef, { userId, ...notification });
      res.status(201).json({ message: 'Notification added successfully' });
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error('Firebase error:', error.message);
        res.status(500).json({ error: 'Firebase error occurred' });
      } else {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Unexpected error occurred' });
      }
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export async function createThreadDeletedNotification(userId: string, threadTitle: string) {
  try {
    const newNotificationRef = doc(collection(db, 'notifications'));
    const notification = {
      userId,
      title: 'Thread Deleted',
      message: `Your thread titled "${threadTitle}" has been deleted by an admin.`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    await setDoc(newNotificationRef, notification);
  } catch (error) {
    console.error('Error creating thread deleted notification:', error);
    throw error;
  }
}