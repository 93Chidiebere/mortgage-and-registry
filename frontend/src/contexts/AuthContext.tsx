import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/mortgage';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: User['role'] }>;
  logout: () => void;
  register: (email: string, password: string, name: string, role: User['role']) => Promise<boolean>;
  switchRole: (role: User['role']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const savedUser = localStorage.getItem('mortgage_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; role?: User['role'] }> => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data.user);
      localStorage.setItem('mortgage_user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      setIsLoading(false);
      return { success: true, role: data.user.role };
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      return { success: false };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mortgage_user');
    localStorage.removeItem('token');
  };

  const register = async (email: string, password: string, name: string, role: User['role']): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/register', { email, password, name, role });
      setUser(data.user);
      localStorage.setItem('mortgage_user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      return false;
    }
  };

  // For demo purposes - switch between roles
  const switchRole = (role: User['role']) => {
    if (user) {
      const updatedUser = { ...user, role };
      if (role === 'lender') {
        updatedUser.lenderId = 'lender-1';
      }
      setUser(updatedUser);
      localStorage.setItem('mortgage_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
