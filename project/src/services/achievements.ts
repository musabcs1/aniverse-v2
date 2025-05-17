import { collection, doc, getDocs, getDoc, setDoc, updateDoc, query, where, arrayUnion } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Achievement, User } from '../types';

// Default achievements
export const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'id'>[] = [
  {
    name: 'Anime Başlangıç',
    description: 'İlk animeni izlemeye başla',
    icon: 'play-circle',
    requirement: {
      type: 'anime_count',
      count: 1
    }
  },
  {
    name: 'Anime Uzmanı',
    description: '10 anime izle',
    icon: 'award',
    requirement: {
      type: 'anime_count',
      count: 10
    }
  },
  {
    name: 'Anime Otaku',
    description: '50 anime izle',
    icon: 'trophy',
    requirement: {
      type: 'anime_count',
      count: 50
    }
  },
  {
    name: 'İlk Eleştiri',
    description: 'İlk anime incelemeni yaz',
    icon: 'edit',
    requirement: {
      type: 'review_count',
      count: 1
    }
  },
  {
    name: 'Eleştirmen',
    description: '10 anime incelemesi yaz',
    icon: 'file-text',
    requirement: {
      type: 'review_count',
      count: 10
    }
  },
  {
    name: 'Sosyal Kelebek',
    description: '20 yorum yap',
    icon: 'message-circle',
    requirement: {
      type: 'comment_count',
      count: 20
    }
  },
  {
    name: 'Sadık Kullanıcı',
    description: '7 gün üst üste giriş yap',
    icon: 'calendar',
    requirement: {
      type: 'login_streak',
      count: 7
    }
  }
];

// Initialize achievements in Firestore
export const initializeAchievements = async () => {
  try {
    const achievementsRef = collection(db, 'achievements');
    const existingAchievements = await getDocs(achievementsRef);

    if (existingAchievements.empty) {
      // Initialize default achievements
      for (let i = 0; i < DEFAULT_ACHIEVEMENTS.length; i++) {
        const achievement = DEFAULT_ACHIEVEMENTS[i];
        await setDoc(doc(achievementsRef, `achievement_${i + 1}`), {
          id: `achievement_${i + 1}`,
          ...achievement
        });
      }
    }
  } catch (error) {
    console.error('Error initializing achievements:', error);
  }
};

// Get all available achievements
export const getAllAchievements = async (): Promise<Achievement[]> => {
  try {
    const achievementsRef = collection(db, 'achievements');
    const achievementsSnapshot = await getDocs(achievementsRef);
    
    return achievementsSnapshot.docs.map(doc => doc.data() as Achievement);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
};

// Get user's achievements
export const getUserAchievements = async (userId: string): Promise<Achievement[]> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().achievements) {
      return userDoc.data().achievements as Achievement[];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }
};

// Check and update user achievements
export const checkAndUpdateAchievements = async (user: User): Promise<Achievement[]> => {
  try {
    const allAchievements = await getAllAchievements();
    const userAchievements = user.achievements || [];
    const newAchievements: Achievement[] = [];
    
    // Get user stats
    const animeCount = (user.watchlist?.length || 0) + (user.completed?.length || 0);
    const reviewCount = user.stats?.reviews || 0;
    const commentCount = user.stats?.comments || 0;
    
    // Check each achievement
    for (const achievement of allAchievements) {
      // Skip if already unlocked
      const alreadyUnlocked = userAchievements.some(a => a.id === achievement.id);
      if (alreadyUnlocked) continue;
      
      let unlocked = false;
      let progress = 0;
      
      // Check requirement
      switch (achievement.requirement.type) {
        case 'anime_count':
          progress = Math.min(100, (animeCount / (achievement.requirement.count || 1)) * 100);
          unlocked = animeCount >= (achievement.requirement.count || 0);
          break;
        case 'review_count':
          progress = Math.min(100, (reviewCount / (achievement.requirement.count || 1)) * 100);
          unlocked = reviewCount >= (achievement.requirement.count || 0);
          break;
        case 'comment_count':
          progress = Math.min(100, (commentCount / (achievement.requirement.count || 1)) * 100);
          unlocked = commentCount >= (achievement.requirement.count || 0);
          break;
        // Other types can be handled here
      }
      
      // If unlocked, add to new achievements
      if (unlocked) {
        const unlockedAchievement = {
          ...achievement,
          unlockedAt: new Date(),
          progress: 100
        };
        newAchievements.push(unlockedAchievement);
      } else {
        // Update progress
        const achievementWithProgress = {
          ...achievement,
          progress
        };
        newAchievements.push(achievementWithProgress);
      }
    }
    
    // Update user document if there are new achievements
    if (newAchievements.length > 0) {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        achievements: [...userAchievements, ...newAchievements.filter(a => a.progress === 100)]
      });
    }
    
    return [...userAchievements, ...newAchievements];
  } catch (error) {
    console.error('Error checking achievements:', error);
    return user.achievements || [];
  }
};

// Update login streak achievement
export const updateLoginStreak = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      const lastLogin = userData.stats?.lastLogin ? new Date(userData.stats.lastLogin) : null;
      const now = new Date();
      
      // Check if last login was yesterday
      let streak = userData.stats?.loginStreak || 0;
      if (lastLogin) {
        const dayDifference = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDifference === 1) {
          // Consecutive login
          streak += 1;
        } else if (dayDifference > 1) {
          // Streak broken
          streak = 1;
        }
        // If same day, don't update streak
      } else {
        streak = 1;
      }
      
      // Update user stats
      await updateDoc(userRef, {
        'stats.lastLogin': now,
        'stats.loginStreak': streak
      });
      
      // Check streak achievements
      if (streak === 7) {
        // Find the streak achievement
        const achievementsRef = collection(db, 'achievements');
        const q = query(achievementsRef, where('requirement.type', '==', 'login_streak'));
        const achievementsSnapshot = await getDocs(q);
        
        if (!achievementsSnapshot.empty) {
          const streakAchievement = achievementsSnapshot.docs[0].data() as Achievement;
          
          // Check if user already has this achievement
          const userAchievements = userData.achievements || [];
          const hasAchievement = userAchievements.some(a => a.id === streakAchievement.id);
          
          if (!hasAchievement) {
            // Add achievement to user
            await updateDoc(userRef, {
              achievements: arrayUnion({
                ...streakAchievement,
                unlockedAt: new Date(),
                progress: 100
              })
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error updating login streak:', error);
  }
}; 