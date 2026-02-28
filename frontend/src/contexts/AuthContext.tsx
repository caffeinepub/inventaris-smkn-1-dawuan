import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../types';
import { getAuthUser, setAuthUser, getUserByUsername } from '../utils/storage';

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  updateCurrentUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = getAuthUser();
    if (stored) {
      setUser(stored);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const found = getUserByUsername(username);
    if (found && found.password === password) {
      const authUser: AuthUser = {
        id: found.id,
        username: found.username,
        fullName: found.fullName,
        role: found.role,
      };
      setUser(authUser);
      setAuthUser(authUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setAuthUser(null);
  };

  const updateCurrentUser = (updated: AuthUser) => {
    setUser(updated);
    setAuthUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
