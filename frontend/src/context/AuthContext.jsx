import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getToken, getUser, setStorageItem, removeStorageItem } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    try {
      const token = getToken();
      const userData = getUser();
      if (token && userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    setStorageItem('token', response.token);
    setStorageItem('user', JSON.stringify(response.user));
    setUser(response.user);
    return response.user;
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    setStorageItem('token', response.token);
    setStorageItem('user', JSON.stringify(response.user));
    setUser(response.user);
    return response.user;
  };

  const adminLogin = async (email, password, secretKey) => {
    const response = await authAPI.adminLogin({ email, password, secretKey });
    setStorageItem('token', response.token);
    setStorageItem('user', JSON.stringify(response.user));
    setUser(response.user);
    return response.user;
  };

  const adminRegister = async (userData) => {
    const response = await authAPI.adminRegister(userData);
    setStorageItem('token', response.token);
    setStorageItem('user', JSON.stringify(response.user));
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    removeStorageItem('token');
    removeStorageItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, adminLogin, adminRegister, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

