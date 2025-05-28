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
