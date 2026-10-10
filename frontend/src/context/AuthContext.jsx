import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, clearAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      const savedUser = localStorage.getItem('user_info');
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Refresh profile in background
          const freshProfile = await api.auth.getProfile();
          setUser(freshProfile);
          localStorage.setItem('user_info', JSON.stringify(freshProfile));
        } catch (err) {
          console.error("Auth check failed:", err);
          clearAuthToken();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const res = await api.auth.login({ username, password });
    setAuthToken(res.access);
    localStorage.setItem('refresh_token', res.refresh);
    localStorage.setItem('user_info', JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    setAuthToken(res.access);
    localStorage.setItem('refresh_token', res.refresh);
    localStorage.setItem('user_info', JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
  };

  const quickLoginAs = async (roleType) => {
    if (roleType === 'vendor') {
      return await login('sharma_kirana', 'password123');
    } else if (roleType === 'customer1') {
      return await login('rahul_v', 'password123');
    } else if (roleType === 'customer2') {
      return await login('priya_s', 'password123');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout,
      quickLoginAs
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
