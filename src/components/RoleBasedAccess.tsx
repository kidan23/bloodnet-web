import React from 'react';
import { useAuth } from '../state/authContext';
import { UserRole } from '../state/auth';
import { Message } from 'primereact/message';

interface RoleBasedAccessProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({ 
  allowedRoles, 
  children, 
  fallback 
}) => {
  const { userRole, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return fallback || (
      <Message 
        severity="warn" 
        text="You must be logged in to access this content." 
      />
    );
  }

  if (!allowedRoles.includes(userRole)) {
    return fallback || (
      <Message 
        severity="error" 
        text="You don't have permission to access this content." 
      />
    );
  }

  return <>{children}</>;
};

export default RoleBasedAccess;
