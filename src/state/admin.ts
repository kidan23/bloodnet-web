import { useMutation, useQuery } from '@tanstack/react-query';
import api from './api';
import { ApprovalStatus } from './auth';

export interface PendingApplication {
  _id: string;
  email: string;
  role: string;
  status: ApprovalStatus;
  createdAt: string;
  profileData: any;
  rejectionReason?: string;
}

export interface ApplicationsResponse {
  results: PendingApplication[];
  totalResults: number;
  page?: number;
  limit?: number;
}

export interface ReviewApplicationDto {
  status: 'approved' | 'rejected';
  rejectionReason?: string;
}

export function useGetApplications(status?: ApprovalStatus) {
  return useQuery({
    queryKey: ['admin-applications', status],
    queryFn: async () => {
      const params = status ? { status } : {};
      const { data } = await api.get('/applications', { params });
      return data as ApplicationsResponse;
    }
  });
}

export function useReviewApplication() {
  return useMutation({
    mutationFn: async ({ applicationId, review }: { applicationId: string; review: ReviewApplicationDto }) => {
      const { data } = await api.patch(`/applications/${applicationId}/review`, review);
      return data;
    }
  });
}

// --- Admin Dashboard API hooks ---

export function useAdminKpis() {
  return useQuery({
    queryKey: ['admin-kpis'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/api/admin/kpis');
        return data;
      } catch (e) {
        // fallback to mock data
        return {
          totalUsers: 1200,
          totalDonations: 340,
          pendingRequests: 15,
          approvedBloodBanks: 22,
          rejectedApplications: 3,
        };
      }
    },
  });
}

export function useAdminDonationsChart() {
  return useQuery({
    queryKey: ['donations-chart'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/api/admin/stats/donations-per-month');
        return data;
      } catch (e) {
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [20, 35, 50, 40, 60, 80],
        };
      }
    },
  });
}

export function useAdminUserGrowthChart() {
  return useQuery({
    queryKey: ['user-growth-chart'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/api/admin/stats/user-growth');
        return data;
      } catch (e) {
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [100, 200, 400, 700, 900, 1200],
        };
      }
    },
  });
}
