import { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../src/firebaseConfig'; // Adjusted the path to match the correct location

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const notificationsRef = collection(db, 'notifications');
      const snapshot = await getDocs(notificationsRef);
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
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}