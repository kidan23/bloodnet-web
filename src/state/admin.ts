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

// Dashboard quick stats
export function useAdminQuickStats(dateRange?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['admin-quick-stats', dateRange],
    queryFn: async () => {
      const params = dateRange ? { dateRange } : {};
      const { data } = await api.get('/api/admin/dashboard/quick-stats', { params });
      return data;
    },
  });
}

// Recent activities
export function useAdminRecentActivities(query?: {
  page?: number;
  limit?: number;
  activityType?: string;
  dateRange?: { startDate?: string; endDate?: string };
}) {
  return useQuery({
    queryKey: ['admin-recent-activities', query],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/dashboard/recent-activities', { 
        params: query 
      });
      return data;
    },
  });
}

// Blood inventory
export function useAdminBloodInventory(query?: {
  bloodBankId?: string;
  location?: string;
}) {
  return useQuery({
    queryKey: ['admin-blood-inventory', query],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/dashboard/blood-inventory', { 
        params: query 
      });
      return data;
    },
  });
}

// Monthly trends
export function useAdminMonthlyTrends(query?: {
  year?: number;
  months?: number;
}) {
  return useQuery({
    queryKey: ['admin-monthly-trends', query],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/dashboard/monthly-trends', { 
        params: query 
      });
      return data;
    },
  });
}

// Regional distribution
export function useAdminRegionalDistribution() {
  return useQuery({
    queryKey: ['admin-regional-distribution'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/dashboard/regional-distribution');
      return data;
    },
  });
}

// Alerts
export function useAdminAlerts(query?: {
  page?: number;
  limit?: number;
  severity?: string;
  resolved?: boolean;
}) {
  return useQuery({
    queryKey: ['admin-alerts', query],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/alerts', { params: query });
      return data;
    },
  });
}

// Resolve alert mutation
export function useResolveAlert() {
  return useMutation({
    mutationFn: async ({ alertId, resolveData }: { 
      alertId: string; 
      resolveData: { resolution: string; notes?: string } 
    }) => {
      const { data } = await api.put(`/api/admin/alerts/${alertId}/resolve`, resolveData);
      return data;
    },
  });
}

// Check inventory alerts mutation
export function useCheckInventoryAlerts() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/api/admin/alerts/check-inventory');
      return data;
    },
  });
}
