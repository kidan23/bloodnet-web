// Blood Inventory and Blood Unit Management Hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import type { 
  Donation, 
  BloodInventoryFilters,
  UpdateBloodUnitStatusDto,
  DispatchBloodUnitDto,
  UseBloodUnitDto,
  DiscardBloodUnitDto,
  PaginatedBloodUnitsResponse
} from '../pages/DonationsPage/types';
import { BloodUnitStatus } from '../pages/DonationsPage/types';

// Additional interfaces for new endpoints
export interface ReserveBloodUnitDto {
  requestId: string;
  reservedAt?: string;
}

export interface ExpireBloodUnitDto {
  expiredAt?: string;
}

export interface BloodUnitTrackingInfo {
  donationId: string;
  currentStatus: string;
  statusHistory: {
    status: string;
    timestamp: string;
    notes?: string;
    performedBy?: string;
  }[];
  location?: string;
  dispatchInfo?: {
    dispatchedTo?: string;
    dispatchedAt?: string;
    transportMethod?: string;
  };
  usageInfo?: {
    usedFor?: string;
    usedAt?: string;
    hospitalId?: string;
  };
  discardInfo?: {
    reason?: string;
    discardedAt?: string;
  };
}

// Blood Inventory Hooks - using donations endpoint with status filtering
export function useBloodInventory(options?: {
  filters?: BloodInventoryFilters;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ['bloodInventory', options],
    queryFn: async () => {
      try {
        const page = options?.page || 0;
        const pageSize = options?.pageSize || 20;
        let queryParams = `page=${page + 1}&limit=${pageSize}`;

        // Only get completed donations for blood inventory
        queryParams += '&status=completed';

        if (options?.filters) {
          Object.entries(options.filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              queryParams += `&${key}=${value}`;
            }
          });
        }

        // Use donations endpoint to get blood units (completed donations)
        const { data } = await api.get(`/donations?${queryParams}`);

        if (data.results) {
          return {
            content: data.results,
            totalElements: data.totalResults,
            totalPages: Math.ceil(data.totalResults / pageSize),
            number: page,
            size: pageSize,
            hasNext: (page + 1) * pageSize < data.totalResults,
            hasPrevious: page > 0
          } as PaginatedBloodUnitsResponse;
        }

        return {
          content: data,
          totalElements: data.length,
          totalPages: 1,
          number: page,
          size: pageSize,
          hasNext: false,
          hasPrevious: page > 0
        } as PaginatedBloodUnitsResponse;
      } catch (error) {
        console.error("Error fetching blood inventory:", error);
        // Return empty data on error
        return {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: options?.pageSize || 20,
          hasNext: false,
          hasPrevious: false
        } as PaginatedBloodUnitsResponse;
      }
    },
  });
}

// Blood Inventory Stats Hook (simplified for backend alignment)
export function useBloodInventoryStats() {
  return useQuery({
    queryKey: ['bloodInventoryStats'],
    queryFn: async () => {
      try {
        // Use donations endpoint to calculate stats from completed donations
        const { data } = await api.get('/donations?status=completed&limit=1000');
        const donations = data.results || data;
        
        // Calculate basic stats from donations
        const stats = {
          totalUnits: donations.length,
          availableUnits: donations.filter((d: Donation) => d.unitStatus === BloodUnitStatus.IN_INVENTORY).length,
          reservedUnits: donations.filter((d: Donation) => d.unitStatus === BloodUnitStatus.RESERVED).length,
          dispatchedUnits: donations.filter((d: Donation) => d.unitStatus === BloodUnitStatus.DISPATCHED).length,
          usedUnits: donations.filter((d: Donation) => d.unitStatus === BloodUnitStatus.USED).length,
          expiredUnits: donations.filter((d: Donation) => d.unitStatus === BloodUnitStatus.EXPIRED).length,
          discardedUnits: donations.filter((d: Donation) => d.unitStatus === BloodUnitStatus.DISCARDED).length,
          quarantinedUnits: donations.filter((d: Donation) => d.unitStatus === BloodUnitStatus.QUARANTINED).length,
        };
        
        return stats;
      } catch (error) {
        console.error("Error fetching blood inventory stats:", error);
        // Return empty stats on error
        return {
          totalUnits: 0,
          availableUnits: 0,
          reservedUnits: 0,
          dispatchedUnits: 0,
          usedUnits: 0,
          expiredUnits: 0,
          discardedUnits: 0,
          quarantinedUnits: 0,
        };
      }
    },
  });
}

// Blood Unit Status Management Hooks (aligned with backend)
export function useUpdateBloodUnitStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBloodUnitStatusDto }) => {
      const { data: responseData } = await api.patch(`/donations/${id}/blood-unit-status`, data);
      return responseData as Donation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodInventory'] });
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['bloodInventoryStats'] });
    },
  });
}

export function useMarkAsDispatched() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: DispatchBloodUnitDto }) => {
      const { data: responseData } = await api.patch(`/donations/${id}/dispatch`, data);
      return responseData as Donation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodInventory'] });
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['bloodInventoryStats'] });
    },
  });
}

export function useMarkAsUsed() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UseBloodUnitDto }) => {
      const { data: responseData } = await api.patch(`/donations/${id}/use`, data);
      return responseData as Donation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodInventory'] });
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['bloodInventoryStats'] });
    },
  });
}

export function useDiscardBloodUnit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: DiscardBloodUnitDto }) => {
      const { data: responseData } = await api.patch(`/donations/${id}/discard`, data);
      return responseData as Donation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodInventory'] });
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['bloodInventoryStats'] });
      queryClient.invalidateQueries({ queryKey: ['expiredBloodUnits'] });
      queryClient.invalidateQueries({ queryKey: ['bloodUnitsExpiringSoon'] });
    },
  });
}

export function useBulkDiscardBloodUnits() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (donationIds: string[]) => {
      const { data } = await api.post('/donations/bulk-discard', { donationIds });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodInventory'] });
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['bloodInventoryStats'] });
      queryClient.invalidateQueries({ queryKey: ['expiredBloodUnits'] });
      queryClient.invalidateQueries({ queryKey: ['bloodUnitsExpiringSoon'] });
    },
  });
}

export function useExpireBloodUnit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ExpireBloodUnitDto }) => {
      const { data: responseData } = await api.patch(`/donations/${id}/expire`, data);
      return responseData as Donation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodInventory'] });
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['bloodInventoryStats'] });
      queryClient.invalidateQueries({ queryKey: ['expiredBloodUnits'] });
      queryClient.invalidateQueries({ queryKey: ['bloodUnitsExpiringSoon'] });
    },
  });
}

// Additional Blood Unit Management Hooks

// Hook to mark blood unit as expired
export function useMarkAsExpired() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: responseData } = await api.put(`/donations/${id}/expire`);
      return responseData as Donation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodInventory'] });
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['bloodInventoryStats'] });
      queryClient.invalidateQueries({ queryKey: ['expiredBloodUnits'] });
      queryClient.invalidateQueries({ queryKey: ['bloodUnitsExpiringSoon'] });
    },
  });
}

// Hook to reserve blood unit for a request
export function useReserveBloodUnit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, requestId }: { id: string; requestId: string }) => {
      const { data: responseData } = await api.put(`/donations/${id}/reserve/${requestId}`);
      return responseData as Donation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodInventory'] });
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['bloodInventoryStats'] });
      queryClient.invalidateQueries({ queryKey: ['bloodRequests'] });
    },
  });
}

// Hook to process expired blood units
export function useProcessExpiredUnits() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/donations/blood-units/process-expired');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodInventory'] });
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['bloodInventoryStats'] });
      queryClient.invalidateQueries({ queryKey: ['expiredBloodUnits'] });
      queryClient.invalidateQueries({ queryKey: ['bloodUnitsExpiringSoon'] });
    },
  });
}

// Extended interface for tracking response
export interface TrackingDataResponse extends Donation {
  isExpired?: boolean;
  daysUntilExpiry?: number;
}

// Hook to get blood unit tracking information
export function useBloodUnitTracking(id: string) {
  return useQuery({
    queryKey: ['bloodUnitTracking', id],
    queryFn: async () => {
      const { data } = await api.get(`/donations/${id}/tracking`);
      return data as TrackingDataResponse;
    },
    enabled: !!id,
  });
}

// Hook to get blood units by status
export function useBloodUnitsByStatus(status: BloodUnitStatus, options?: {
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ['bloodUnitsByStatus', status, options],
    queryFn: async () => {
      const page = options?.page || 0;
      const pageSize = options?.pageSize || 20;
      let queryParams = `page=${page + 1}&limit=${pageSize}`;

      const { data } = await api.get(`/donations/blood-units/status/${status}?${queryParams}`);
      
      if (data.results) {
        return {
          content: data.results,
          totalElements: data.totalResults,
          totalPages: Math.ceil(data.totalResults / pageSize),
          number: page,
          size: pageSize,
          hasNext: (page + 1) * pageSize < data.totalResults,
          hasPrevious: page > 0
        } as PaginatedBloodUnitsResponse;
      }
      
      return {
        content: data,
        totalElements: data.length,
        totalPages: 1,
        number: page,
        size: pageSize,
        hasNext: false,
        hasPrevious: page > 0
      } as PaginatedBloodUnitsResponse;
    },
    enabled: !!status,
  });
}

// Hook to get expired blood units
export function useExpiredBloodUnits(options?: {
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ['expiredBloodUnits', options],
    queryFn: async () => {
      const page = options?.page || 0;
      const pageSize = options?.pageSize || 20;
      let queryParams = `page=${page + 1}&limit=${pageSize}`;

      const { data } = await api.get(`/donations/blood-units/expired?${queryParams}`);
      
      if (data.results) {
        return {
          content: data.results,
          totalElements: data.totalResults,
          totalPages: Math.ceil(data.totalResults / pageSize),
          number: page,
          size: pageSize,
          hasNext: (page + 1) * pageSize < data.totalResults,
          hasPrevious: page > 0
        } as PaginatedBloodUnitsResponse;
      }
      
      return {
        content: data,
        totalElements: data.length,
        totalPages: 1,
        number: page,
        size: pageSize,
        hasNext: false,
        hasPrevious: page > 0
      } as PaginatedBloodUnitsResponse;
    },
  });
}

// Hook to get blood units expiring soon
export function useBloodUnitsExpiringSoon(days: number = 7, options?: {
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ['bloodUnitsExpiringSoon', days, options],
    queryFn: async () => {
      const page = options?.page || 0;
      const pageSize = options?.pageSize || 20;
      let queryParams = `page=${page + 1}&limit=${pageSize}&days=${days}`;

      const { data } = await api.get(`/donations/blood-units/expiring-soon?${queryParams}`);
      
      if (data.results) {
        return {
          content: data.results,
          totalElements: data.totalResults,
          totalPages: Math.ceil(data.totalResults / pageSize),
          number: page,
          size: pageSize,
          hasNext: (page + 1) * pageSize < data.totalResults,
          hasPrevious: page > 0
        } as PaginatedBloodUnitsResponse;
      }
      
      return {
        content: data,
        totalElements: data.length,
        totalPages: 1,
        number: page,
        size: pageSize,
        hasNext: false,
        hasPrevious: page > 0
      } as PaginatedBloodUnitsResponse;
    },
  });
}
