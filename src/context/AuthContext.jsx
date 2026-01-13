import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { adminLogout } from '../service/Admin/Admin_auth';
import { clientLogout } from '../service/Clients/Clients_auth';
import { teamsLogout } from '../service/Teams/Teams_auth';
import BASE_URL from '../config';

// Add import at the top:
import { trackAuthEvent } from '../utils/tracking';


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
// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  //console.log('AuthProvider user state:', user);

  // Fetch user details 
  const fetchUserDetails = async (token, role) => {
    try {
      let endpoint;
      if (role === 'admin') {
        endpoint = `${BASE_URL}/admin/auth/me`;
      } else if (role === 'client') {
        endpoint = `${BASE_URL}/client/auth/me`;
      } else if (role === 'team') {
        endpoint = `${BASE_URL}/team/auth/me`;
      }

      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // console.log('Fetched user details response:', response.data);
      if (response.data.success) {
        const userData = response.data.data.admin || response.data.data.client || response.data.data.teamMember;
        // console.log('User data fetched:', userData);
        if (userData) {
          setUser({
            ...userData,
            token,
            role,
            teamRole: userData.role || null

          });
          // Track token validation success
          await trackAuthEvent('Token Validation', role, 'success');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error fetching user details:', error);

      // Track token validation failure
      await trackAuthEvent('Token Validation', role, 'failed',
        error.response?.status === 401 ? 'Unauthorized' : error.message);
      if (error.response?.status === 401) {
        if (role === 'admin') {
          localStorage.removeItem('admin_token');
        } else if (role === 'client') {
          localStorage.removeItem('client_token');
        } else if (role === 'team') {
          localStorage.removeItem('team_token');
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

        // Check for team token
        const teamToken = localStorage.getItem('team_token');
        if (teamToken) {
          const success = await fetchUserDetails(teamToken, 'team');
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

      // Track login attempt
      await trackAuthEvent('Login Attempt', role, 'started');


      // Store token in localStorage based on role
      if (role === 'admin') {
        localStorage.setItem('admin_token', token);
      } else if (role === 'client') {
        localStorage.setItem('client_token', token);
      } else if (role === 'team') {
        localStorage.setItem('team_token', token);
      }

      // Fetch user details from API
      const success = await fetchUserDetails(token, role);
      //console.log('Fetch user details success:', success);

      if (success) {
        // Track successful login
        await trackAuthEvent('Login', role, 'success');
        return true;
      } else {
        // Track failed login
        await trackAuthEvent('Login', role, 'failed', 'Failed to fetch user details');


        // If failed to fetch user details, remove token
        if (role === 'admin') {
          localStorage.removeItem('admin_token');
        } else if (role === 'client') {
          localStorage.removeItem('client_token');
        } else if (role === 'team') {
          localStorage.removeItem('team_token');
        }
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      await trackAuthEvent('Login', role, 'failed', error.message || 'Login error');
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    const userRole = user?.role;

    // Track logout attempt
    await trackAuthEvent('Logout', userRole || 'unknown', 'started');

    try {
      // Call logout API based on role
      if (userRole === 'admin') {
        const res = await adminLogout();
        // Track successful logout
        await trackAuthEvent('Logout', 'admin', 'success');
        // console.log('adminLogout response:', res);
        localStorage.removeItem('admin_token');
        setUser(null);
        navigate('/admin/login');
      } else if (userRole === 'client') {
        const res = await clientLogout();
        await trackAuthEvent('Logout', 'client', 'success');
        //console.log('clientLogout response:', res);
        localStorage.removeItem('client_token');
        setUser(null);
        navigate('/clients/login');
      } else if (userRole === 'team') {
        const res = await teamsLogout();
        await trackAuthEvent('Logout', 'team', 'success');
        //console.log('teamsLogout response:', res);
        localStorage.removeItem('team_token');
        setUser(null);
        navigate('/teams/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      await trackAuthEvent('Logout', userRole || 'unknown', 'failed', error.message);
      if (userRole === 'admin') {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      } else if (userRole === 'client') {
        localStorage.removeItem('client_token');
        navigate('/clients/login');
      } else if (userRole === 'team') {
        localStorage.removeItem('team_token');
        navigate('/teams/login');
      } else {
        localStorage.clear();
        navigate('/');
      }
      setUser(null);
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