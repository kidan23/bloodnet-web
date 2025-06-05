// Expiry Management Hooks - Dedicated backend routes for expiry handling
import { useQuery } from '@tanstack/react-query';
import api from './api';

// Hook to get expired blood units
export function useExpiredBloodUnits(params: {
  filters?: Record<string, any>;
  page?: number;
  pageSize?: number;
} = {}) {
  return useQuery({
    queryKey: ['expiredBloodUnits', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: (params.page || 0).toString(),
        limit: (params.pageSize || 50).toString(),
        ...params.filters,
      });
      
      const response = await api.get(`/donations/blood-units/expired?${queryParams}`);
      return response.data;
    },
  });
}

// Hook to get blood units expiring soon
export function useBloodUnitsExpiringSoon(params: {
  days?: number;
  filters?: Record<string, any>;
  page?: number;
  pageSize?: number;
} = {}) {
  return useQuery({
    queryKey: ['bloodUnitsExpiringSoon', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: (params.page || 0).toString(),
        limit: (params.pageSize || 50).toString(),
        ...(params.days && { days: params.days.toString() }),
        ...params.filters,
      });
      
      const response = await api.get(`/donations/blood-units/expiring-soon?${queryParams}`);
      return response.data;
    },
  });
}
