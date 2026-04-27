import { useState, useCallback } from 'react';
import { User, Role } from '../types';
import { api } from '../lib/services/api';
import { useToast } from '../components/ToastProvider';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { success, error, info } = useToast();

  const getDashboardPageForRole = (role: string) => {
    if (role === Role.ADMIN) return 'admin-dashboard';
    if (role === Role.WARDEN) return 'warden-dashboard';
    return 'guest-dashboard';
  };

  const loadUserFromToken = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return null;

    try {
      const user = await api.getMe();
      setCurrentUser(user);
      return getDashboardPageForRole(user.role);
    } catch {
      localStorage.removeItem('token');
      return null;
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const user = await api.login(email, password);
      setCurrentUser(user);
      success(`Welcome back, ${user.name}!`);
      return getDashboardPageForRole(user.role);
    } catch (err: any) {
      throw err;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const user = await api.signup(name, email, password);
      setCurrentUser(user);
      success('Account created successfully!');
      return 'guest-dashboard';
    } catch (err: any) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    info('You have been logged out');
  };

  return {
    currentUser,
    loadUserFromToken,
    login,
    signup,
    logout,
  };
};
