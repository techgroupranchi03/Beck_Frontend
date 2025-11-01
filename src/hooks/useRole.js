// Hook to access user role and check permissions
import { useAuth } from '../context/AuthContext';

export const useRole = () => {
  const { user, hasRole } = useAuth();

  const isAdmin = () => hasRole('admin');
  const isClient = () => hasRole('client');
  
  const canViewAllClients = () => isAdmin();
  const canEditClients = () => isAdmin();
  const canDeleteClients = () => isAdmin();
  
  const canViewOwnData = () => isClient() || isAdmin();

  return {
    user,
    isAdmin,
    isClient,
    canViewAllClients,
    canEditClients,
    canDeleteClients,
    canViewOwnData,
  };
};
