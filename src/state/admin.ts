import { useMutation, useQuery } from '@tanstack/react-query';
import api from './api';
import { ApprovalStatus } from './auth';

export interface PendingApplication {
  _id: string;
  email: string;
  role: string;
  approvalStatus: ApprovalStatus;
  createdAt: string;
  profileData: any;
  rejectionReason?: string;
}

export function useGetApplications(status?: ApprovalStatus) {
  return useQuery({
    queryKey: ['admin-applications', status],
    queryFn: async () => {
      const params = status ? { status } : {};
      const { data } = await api.get('/admin/applications', { params });
      return data as PendingApplication[];
    }
  });
}

export function useApproveApplication() {
  return useMutation({
    mutationFn: async (applicationId: string) => {
      const { data } = await api.post(`/admin/applications/${applicationId}/approve`);
      return data;
    }
  });
}

export function useRejectApplication() {
  return useMutation({
    mutationFn: async ({ applicationId, reason }: { applicationId: string; reason: string }) => {
      const { data } = await api.post(`/admin/applications/${applicationId}/reject`, { reason });
      return data;
    }
  });
}
