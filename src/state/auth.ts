import { useMutation } from '@tanstack/react-query';
import api from './api';

export enum UserRole {
  DONOR = 'donor',
  HOSPITAL = 'hospital',
  BLOOD_BANK = 'blood_bank',
  MEDICAL_INSTITUTION = 'medical_institution',
  ADMIN = 'admin',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  approvalStatus?: ApprovalStatus;
  profileComplete?: boolean;
  rejectionReason?: string;
  donorProfile?: string; // Reference to Donor document
  bloodBankProfile?: string; // Reference to BloodBank document
  medicalInstitutionProfile?: string; // Reference to MedicalInstitution document
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface SignupPayload {
  email: string;
  password: string;
  role: UserRole;
}

export interface ApplyPayload {
  email: string;
  password: string;
  role: UserRole;
  profileData: any; // Will be either BloodBank or MedicalInstitution data
}

export function useLogin() {
  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await api.post(
        import.meta.env.VITE_AUTH_LOGIN_PATH,
        payload
      );
      return data;
    },
  });
}

export function useSignup() {
  return useMutation<LoginResponse, Error, SignupPayload>({
    mutationFn: async (payload: SignupPayload) => {
      const { data } = await api.post('/auth/signup', payload);
      return data;
    },
  });
}

export function useApply() {
  return useMutation<{ message: string }, Error, ApplyPayload>({
    mutationFn: async (payload: ApplyPayload) => {
      const { data } = await api.post('/applications', payload);
      return data;
    },
  });
}

export function useCheckProfileComplete() {
  return useMutation<{ profileComplete: boolean; missingProfile: string | null }, Error>({
    mutationFn: async () => {
      const { data } = await api.get('/auth/profile-status');
      return data;
    },
  });
}
