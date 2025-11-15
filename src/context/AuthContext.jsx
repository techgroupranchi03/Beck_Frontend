import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Create the Auth Context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// API base URL
const API_BASE_URL = 'http://31.97.230.38:8080/api';

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user details from API using token
  const fetchUserDetails = async (token, role) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Extract user data based on role
        const userData = response.data.data.admin || response.data.data.client;
        
        if (userData) {
          setUser({
            ...userData,
            token,
            role
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error fetching user details:', error);
      // If token is invalid or expired, clear it
      if (error.response?.status === 401) {
        if (role === 'admin') {
          localStorage.removeItem('admin_token');
        } else if (role === 'client') {
          localStorage.removeItem('client_token');
        }
      }
      return false;
    }
  };

  // Check if user is already logged in on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for admin token first
        const adminToken = localStorage.getItem('admin_token');
        if (adminToken) {
          const success = await fetchUserDetails(adminToken, 'admin');
          if (success) {
            setLoading(false);
            return;
          }
        }

        // Check for client token
        const clientToken = localStorage.getItem('client_token');
        if (clientToken) {
          const success = await fetchUserDetails(clientToken, 'client');
          if (success) {
            setLoading(false);
            return;
          }
        }

        // No valid token found
        setUser(null);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function - only stores token, then fetches user details
  const login = async (token, role = 'admin') => {
    try {
      // Store token in localStorage based on role
      if (role === 'admin') {
        localStorage.setItem('admin_token', token);
      } else if (role === 'client') {
        localStorage.setItem('client_token', token);
      }

      // Fetch user details from API
      const success = await fetchUserDetails(token, role);
      
      if (success) {
        return true;
      } else {
        // If failed to fetch user details, remove token
        if (role === 'admin') {
          localStorage.removeItem('admin_token');
        } else if (role === 'client') {
          localStorage.removeItem('client_token');
        }
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    const userRole = user?.role;
    
    // Clear user state
    setUser(null);

    // Clear localStorage based on role
    if (userRole === 'admin') {
      localStorage.removeItem('admin_token');
      navigate('/admin/login');
    } else if (userRole === 'client') {
      localStorage.removeItem('client_token');
      navigate('/clients/login');
    } else {
      // Clear all if role is unknown
      localStorage.clear();
      navigate('/');
    }
  };

  // Refresh user data (useful after profile updates)
  const refreshUser = async () => {
    if (!user) return false;

    const token = user.token;
    const role = user.role;
    
    return await fetchUserDetails(token, role);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return user !== null && user.token !== undefined;
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Get token for API requests
  const getToken = () => {
    return user?.token || null;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated,
    hasRole,
    getToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};