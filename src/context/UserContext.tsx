import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserPreferences, UserContextType } from '../types';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem('user');
    const savedPreferences = localStorage.getItem('preferences');
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Validate user has required fields
        if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.name) {
          setUser(parsedUser);
        } else {
          console.warn('Invalid user data in localStorage, clearing...');
          localStorage.removeItem('user');
        }
      } catch (e) {
        console.error('Failed to parse user from localStorage:', e);
        localStorage.removeItem('user');
      }
    }
    if (savedPreferences) {
      try {
        const parsedPrefs = JSON.parse(savedPreferences);
        if (parsedPrefs && parsedPrefs.user_id) {
          setPreferences(parsedPrefs);
        } else {
          console.warn('Invalid preferences data in localStorage, clearing...');
          localStorage.removeItem('preferences');
        }
      } catch (e) {
        console.error('Failed to parse preferences from localStorage:', e);
        localStorage.removeItem('preferences');
      }
    }
  }, []);

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  };

  const handleSetPreferences = (newPreferences: UserPreferences | null) => {
    setPreferences(newPreferences);
    if (newPreferences) {
      localStorage.setItem('preferences', JSON.stringify(newPreferences));
    } else {
      localStorage.removeItem('preferences');
    }
  };

  const logout = () => {
    setUser(null);
    setPreferences(null);
    localStorage.removeItem('user');
    localStorage.removeItem('preferences');
  };

  return (
    <UserContext.Provider
      value={{
        user,
        preferences,
        setUser: handleSetUser,
        setPreferences: handleSetPreferences,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
