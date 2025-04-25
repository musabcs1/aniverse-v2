import React, { createContext, useState, useContext, ReactNode } from 'react';

interface UserData {
  username: string;
  email: string;
  level: number;
  joinDate: string;
  avatar: string;
  badges: any[];
  watchlist: any[];
}

interface UserContextType {
  userData: UserData | null;
  setUserData: (userData: UserData) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData | null>(null);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};