import { collection, doc, getDocs, setDoc, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Badge, UserRole } from '../types';

// Default badge configurations with their permissions
export const DEFAULT_BADGES: Record<UserRole, Omit<Badge, 'id'>> = {
  admin: {
    name: 'admin',
    color: '#EF4444',
    permissions: [
      'manage_users',
      'manage_content',
      'manage_badges',
      'post_news',
      'delete_news',
      'manage_forums',
      'delete_comments',
      'pin_threads'
    ]
  },
  writer: {
    name: 'writer',
    color: '#3B82F6',
    permissions: [
      'post_news',
      'edit_own_news',
      'delete_own_news',
      'manage_forums',
      'pin_own_threads'
    ]
  },
  user: {
    name: 'user',
    color: '#10B981',
    permissions: [
      'post_comments',
      'edit_own_comments',
      'create_threads',
      'edit_own_threads'
    ]
  }
};

export const initializeBadges = async () => {
  try {
    const badgesRef = collection(db, 'badges');
    const existingBadges = await getDocs(badgesRef);

    if (existingBadges.empty) {
      // Initialize default badges
      for (const [role, badge] of Object.entries(DEFAULT_BADGES)) {
        await setDoc(doc(badgesRef, role), {
          id: role,
          ...badge
        });
      }
    }
  } catch (error) {
    console.error('Error initializing badges:', error);
  }
};

export const getUserBadges = async (role: UserRole): Promise<Badge[]> => {
  try {
    const badgesRef = collection(db, 'badges');
    const badgesQuery = query(badgesRef, where('name', '==', role));
    const badgesSnapshot = await getDocs(badgesQuery);
    
    return badgesSnapshot.docs.map(doc => doc.data() as Badge);
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }
};

export const hasPermission = (userBadges: Badge[], permission: string): boolean => {
  return userBadges.some(badge => badge.permissions.includes(permission));
};