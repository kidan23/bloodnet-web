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

  if (!isLoggedIn || !allowedRoles.includes(userRole)) {
    // If user is not logged in or doesn't have required role, show fallback or nothing
    return fallback || null;
  }

  return <>{children}</>;
};

/**
 * Hook to check if user has specific role(s)
 * @param allowedRoles - Array of roles to check against
 * @returns boolean indicating if user has one of the allowed roles
 */
export const useHasRole = (allowedRoles: UserRole[]): boolean => {
  const { userRole } = useAuth();
  return allowedRoles.includes(userRole);
};

/**
 * Hook to check if user is admin
 * @returns boolean indicating if user is admin
 */
export const useIsAdmin = (): boolean => {
  const { userRole } = useAuth();
  return userRole === UserRole.ADMIN;
};

/**
 * Hook to check if user is donor
 * @returns boolean indicating if user is donor
 */
export const useIsDonor = (): boolean => {
  const { userRole } = useAuth();
  return userRole === UserRole.DONOR;
};

/**
 * Hook to check if user is blood bank admin
 * @returns boolean indicating if user is blood bank admin
 */
export const useIsBloodBank = (): boolean => {
  const { userRole } = useAuth();
  return userRole === UserRole.BLOOD_BANK;
};

/**
 * Hook to check if user is medical institution admin
 * @returns boolean indicating if user is medical institution admin
 */
export const useIsMedicalInstitution = (): boolean => {
  const { userRole } = useAuth();
  return userRole === UserRole.MEDICAL_INSTITUTION;
};

/**
 * Hook to check if user is hospital admin
 * @returns boolean indicating if user is hospital admin
 */
export const useIsHospital = (): boolean => {
  const { userRole } = useAuth();
  return userRole === UserRole.HOSPITAL;
};

export default RoleBasedAccess;
