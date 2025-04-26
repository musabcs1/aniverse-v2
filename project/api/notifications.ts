import { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../src/firebaseConfig'; // Adjusted the path to match the correct location

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const notificationsRef = collection(db, 'notifications');
      const snapshot = await getDocs(notificationsRef);
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error); // Log the error for debugging
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}