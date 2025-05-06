import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  email: string;
  role?: string;
  banned?: boolean;
  avatar?: string;
  xp?: number;
  level?: number;
  badges?: any[];
  watchlist?: string[];
  watchlistDetails?: any[];
  completed?: string[];
  joinDate?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  logout: () => void;
  isBanned: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            userData.id = user.uid;
            
            // Check if user is banned
            if (userData.banned) {
              setIsBanned(true);
              console.log('User is banned');
            } else {
              setIsBanned(false);
            }
            
            setCurrentUser(userData);
            localStorage.setItem('userData', JSON.stringify(userData));
          } else {
            setCurrentUser(null);
            localStorage.removeItem('userData');
          }
        } else {
          setCurrentUser(null);
          setIsBanned(false);
          localStorage.removeItem('userData');
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setError('Failed to authenticate user');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = () => {
    auth.signOut();
    localStorage.removeItem('userData');
    setCurrentUser(null);
    setIsBanned(false);
  };

  const value = {
    currentUser,
    loading,
    error,
    logout,
    isBanned
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 