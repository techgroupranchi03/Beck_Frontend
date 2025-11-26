import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * ProtectedRoute Component
 * 
 * This component wraps routes that require authentication
 * 
 * Props:
 * - children: The component to render if authenticated
 * - requiredRole: (optional) Specific role required (e.g., 'admin', 'client')
 * - redirectTo: (optional) Custom redirect path if not authenticated
 */
const ProtectedRoute = ({ 
  children, 
  requiredRole = null,
  redirectTo = null 
}) => {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Determine redirect path based on required role
    const loginPath = requiredRole === 'admin' 
      ? '/admin/login' 
      : requiredRole === 'client'
      ? '/clients/login'
      : redirectTo || '/clients/login';

    // Redirect to login, preserving the attempted location
    return (
      <Navigate 
        to={loginPath} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check if specific role is required
  if (requiredRole && !hasRole(requiredRole)) {
    // User is authenticated but doesn't have required role
    // Redirect to their appropriate dashboard
    const dashboardPath = user.role === 'admin' 
      ? '/admin/dashboard' 
      : '/clients/dashboard';
    
    return <Navigate to={dashboardPath} replace />;
  }

  // User is authenticated and has required role (if specified)
  return children;
};

export default ProtectedRoute;