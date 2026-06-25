import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, signup as apiSignup, logout as apiLogout } from '../api/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiLogin(credentials);
      const userData = response.data;
      const userObj = {
        userId: userData.userId || userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone,
      };
      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj));
      return { success: true, user: userObj };
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data || 'Login failed. Please try again.';
      return { success: false, error: message };
    }
  };

  const signup = async (data) => {
    try {
      const response = await apiSignup(data);
      const userData = response.data;
      const userObj = {
        userId: userData.userId || userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone,
      };
      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj));
      return { success: true, user: userObj };
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data || 'Signup failed. Please try again.';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error on server:', error);
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAdmin = user?.role === 'ADMIN';

  const value = {
    user,
    login,
    signup,
    logout,
    isAdmin,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
