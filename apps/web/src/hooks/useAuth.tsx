import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { User } from '../lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string; password: string; name: string;
    phone?: string; class?: string; section?: string;
    yearOfStudy?: string; department?: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { setLoading(false); return; }
    api.get<User>('/auth/me').then(setUser).catch(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }).finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', { email, password });
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    setUser(res.user);
  }, []);

  const register = useCallback(async (data: {
    email: string; password: string; name: string;
    phone?: string; class?: string; section?: string;
    yearOfStudy?: string; department?: string;
  }) => {
    const res = await api.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', data);
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { AuthProvider, useAuth };
