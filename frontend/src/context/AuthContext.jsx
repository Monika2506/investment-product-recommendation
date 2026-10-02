import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, profileService } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('investiq_token') || null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('investiq_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data) {
            setUser(res.data.user);
            setProfile(res.data.profile);
          }
        } catch (err) {
          console.error("Failed to verify authentication token:", err);
          localStorage.removeItem('investiq_token');
          setToken(null);
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await authService.login(credentials);
      if (res.success && res.data) {
        localStorage.setItem('investiq_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);

        // Fetch profile
        try {
          const profRes = await profileService.getProfile();
          if (profRes.success) setProfile(profRes.data);
        } catch (_) {}

        toast.success(`Welcome back, ${res.data.user.full_name}!`);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      toast.error(err.message || 'Login failed.');
      return { success: false, message: err.message, errors: err.errors };
    }
  };

  const demoLogin = async (role = 'user') => {
    try {
      const res = await authService.demoLogin(role);
      if (res.success && res.data) {
        localStorage.setItem('investiq_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);

        try {
          const profRes = await profileService.getProfile();
          if (profRes.success) setProfile(profRes.data);
        } catch (_) {}

        toast.success(`Demo login successful as ${role.toUpperCase()}: ${res.data.user.full_name}`);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      toast.error(err.message || 'Demo login failed.');
      return { success: false, message: err.message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await authService.register(userData);
      if (res.success && res.data) {
        localStorage.setItem('investiq_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        toast.success('Registration successful! Welcome to InvestIQ.');
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
      return { success: false, message: err.message, errors: err.errors };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (_) {}
    localStorage.removeItem('investiq_token');
    setToken(null);
    setUser(null);
    setProfile(null);
    toast.info('You have been securely logged out.');
  };

  const refreshMe = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data.user);
        setProfile(res.data.profile);
      }
    } catch (_) {}
  };

  const value = {
    user,
    profile,
    setProfile,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    login,
    demoLogin,
    register,
    logout,
    refreshMe
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
