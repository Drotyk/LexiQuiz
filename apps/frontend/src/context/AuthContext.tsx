'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserDto } from '@wordforge/shared-types';
import { api, setAuthToken } from '@/lib/api';

interface AuthContextType {
  user: UserDto | null;
  isLoading: boolean;
  login: (token: string, userData: UserDto) => void;
  logout: () => Promise<void>;
  updateUser: (updatedUser: UserDto) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Attempt initial token refresh on app load
    const checkAuth = async () => {
      try {
        const response = await api.post('/auth/refresh');
        const { accessToken, user: userData } = response.data;
        setAuthToken(accessToken);
        setUser(userData);
      } catch {
        setAuthToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (token: string, userData: UserDto) => {
    setAuthToken(token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedUser: UserDto) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
