import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user from token on startup
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setUser({
            id: decoded.user.id,
            email: decoded.user.email,
            name: decoded.user.name
          });
        } catch (err) {
          console.error('Failed to decode token', err);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      
      const decoded = jwtDecode(token);
      setUser({
        id: decoded.user.id,
        email: decoded.user.email,
        name: decoded.user.name
      });
      
      return { success: true };
    } catch (error) {
      throw error.response?.data || { msg: 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      
      const decoded = jwtDecode(token);
      setUser({
        id: decoded.user.id,
        email: decoded.user.email,
        name: decoded.user.name
      });
      
      return { success: true };
    } catch (error) {
      throw error.response?.data || { msg: 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    // Remove axios auth header
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    token,
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};