// React Query hooks for donations
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import type { 
  Donation, 
  CreateDonationDto, 
  UpdateDonationDto, 
  PaginatedDonationsResponse,
  DonorStats,
  DonationFilters
} from '../pages/DonationsPage/types';

// Mock donations data for development/demo purposes
const mockDonations: Record<string, Array<{id: string; donorId: string; date: string; volumeCollected: number; status: string}>> = {
  "1": [
    { id: "1", donorId: "1", date: '2025-01-15', volumeCollected: 450, status: 'completed' },
    { id: "2", donorId: "1", date: '2024-10-20', volumeCollected: 500, status: 'completed' },
    { id: "3", donorId: "1", date: '2024-07-05', volumeCollected: 450, status: 'completed' }
  ],
  "2": [
    { id: "4", donorId: "2", date: '2024-12-05', volumeCollected: 500, status: 'completed' },
    { id: "5", donorId: "2", date: '2024-09-12', volumeCollected: 450, status: 'completed' },
    { id: "6", donorId: "2", date: '2024-06-20', volumeCollected: 500, status: 'completed' },
    { id: "7", donorId: "2", date: '2024-03-15', volumeCollected: 450, status: 'completed' }
  ]
};

export function useDonations(options?: { 
  donorId?: string;
  bloodBankId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  filters?: DonationFilters;
}) {  return useQuery({
    queryKey: options?.donorId 
      ? ['donations', 'donor', options.donorId, options] 
      : ['donations', options],queryFn: async () => {
      try {
        const page = options?.page || 0;
        const pageSize = options?.pageSize || 10;
        
        // Use donor-specific endpoint if donorId is provided
        if (options?.donorId) {
          let queryParams = `page=${page+1}&limit=${pageSize}`;
          
          if (options?.status) {
            queryParams += `&status=${options.status}`;
          }
          
          if (options?.startDate) {
            queryParams += `&startDate=${options.startDate}`;
          }
          
          if (options?.endDate) {
            queryParams += `&endDate=${options.endDate}`;
          }
          
          if (options?.filters) {
            Object.entries(options.filters).forEach(([key, value]) => {
              if (value) {
                queryParams += `&${key}=${value}`;
              }
            });
          }
          
          const { data } = await api.get(`/donations/donor/${options.donorId}?${queryParams}`);
          
          // Handle the specific API response format
          if (data.results) {
            return {
              content: data.results,
              totalElements: data.totalResults,
              totalPages: data.totalPages,
              number: data.page - 1, // Convert to 0-indexed for consistency
              size: data.limit,
              hasNext: data.page < data.totalPages,
              hasPrevious: data.page > 1
            } as PaginatedDonationsResponse;
          }
          
          return {
            content: data,
            totalElements: data.length,
            totalPages: 1,
            number: page,
            size: pageSize,
            hasNext: false,
            hasPrevious: page > 0
          } as PaginatedDonationsResponse;
        }
        
        // Use general donations endpoint for other cases
        let queryParams = `page=${page+1}&limit=${pageSize}`;
        
        if (options?.bloodBankId) {
          queryParams += `&bloodBank=${options.bloodBankId}`;
        }
        
        if (options?.status) {
          queryParams += `&status=${options.status}`;
        }
        
        if (options?.startDate) {
          queryParams += `&startDate=${options.startDate}`;
        }
        
        if (options?.endDate) {
          queryParams += `&endDate=${options.endDate}`;
        }
        
        if (options?.filters) {
          Object.entries(options.filters).forEach(([key, value]) => {
            if (value) {
              queryParams += `&${key}=${value}`;
            }
          });
        }
        
        const { data } = await api.get(`/donations?${queryParams}`);
        
        // Handle the specific API response format
        if (data.results) {
          return {
            content: data.results,
            totalElements: data.totalResults,
            totalPages: data.totalPages,
            number: data.page - 1, // Convert to 0-indexed for consistency
            size: data.limit,
            hasNext: data.page < data.totalPages,
            hasPrevious: data.page > 1
          } as PaginatedDonationsResponse;
        }
        
        return {
          content: data,
          totalElements: data.length,
          totalPages: 1,
          number: page,
          size: pageSize,
          hasNext: false,
          hasPrevious: page > 0
        } as PaginatedDonationsResponse;
      } catch (error) {
        console.error("Error fetching donations:", error);
        
        // For demo purposes, return mock data if the API fails
        if (options?.donorId && mockDonations[options.donorId as keyof typeof mockDonations]) {
          // Simulate pagination for mock data
          const allDonations = mockDonations[options.donorId as keyof typeof mockDonations];
          const page = options?.page || 0;
          const pageSize = options?.pageSize || 10;
          const startIdx = page * pageSize;
          const endIdx = Math.min(startIdx + pageSize, allDonations.length);
          const paginatedItems = allDonations.slice(startIdx, endIdx);
          
          // Map mock data to match the Donation type structure
          const mappedItems = paginatedItems.map(item => ({
            ...item,
            donor: { id: item.donorId, name: "Mock Donor" }, // Add mock donor object
            bloodBank: { id: "mockBloodBank", name: "Mock Blood Bank" }, // Add mock blood bank object
            donationDate: item.date, // Map date to donationDate
          }));

          // Return mock data in the same format as the API response
          return {
            content: mappedItems,
            totalElements: allDonations.length,
            totalPages: Math.ceil(allDonations.length / pageSize),
            number: page,
            size: pageSize,
            hasNext: endIdx < allDonations.length,
            hasPrevious: page > 0
          } as any;
        }
        
        // Return empty results in the API format
        return {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: options?.pageSize || 10,
          hasNext: false,
          hasPrevious: false
        } as PaginatedDonationsResponse;
      }
    },
  });
}

export function useDonation(id?: string) {
  return useQuery({
    queryKey: ['donation', id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        const { data } = await api.get(`/donations/${id}`);
        return data as Donation;
      } catch (error) {
        console.error(`Error fetching donation with ID ${id}:`, error);
        return null;
      }
    },
    enabled: !!id,
  });
}

export function useDonorStats(donorId?: string) {
  return useQuery({
    queryKey: ['donorStats', donorId],
    queryFn: async () => {
      if (!donorId) return null;
      
      try {
        const { data } = await api.get(`/donations/donor/${donorId}/stats`);
        return data as DonorStats;
      } catch (error) {
        console.error(`Error fetching donor stats for donor ID ${donorId}:`, error);
        
        // Mock stats data if API fails
        return {
          totalDonations: 3,
          totalVolume: 1400,
          lastDonation: '2025-01-15',
          averageHemoglobin: 14.5,
          eligibleToDonateSince: '2025-04-15',
        } as DonorStats;
      }
    },
    enabled: !!donorId,
  });
}

export function useCreateDonation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newDonation: CreateDonationDto) => {
      const { data } = await api.post('/donations', newDonation);
      return data as Donation;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      
      // Also invalidate donor-specific donations if donor ID was provided
      if (variables.donor) {
        queryClient.invalidateQueries({ queryKey: ['donations', { donorId: variables.donor }] });
        queryClient.invalidateQueries({ queryKey: ['donorStats', variables.donor] });
      }
      
      // Invalidate blood bank-specific donations if blood bank ID was provided
      if (variables.bloodBank) {
        queryClient.invalidateQueries({ queryKey: ['donations', { bloodBankId: variables.bloodBank }] });
      }
    },
  });
}

export function useUpdateDonation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDonationDto }) => {
      const { data: responseData } = await api.patch(`/donations/${id}`, data);
      return responseData as Donation;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['donation', variables.id] });
      
      // Also invalidate donor-specific donations if donor ID was provided
      if (data.donor) {
        queryClient.invalidateQueries({ queryKey: ['donations', { donorId: data.donor }] });
        queryClient.invalidateQueries({ queryKey: ['donorStats', data.donor] });
      }
      
      // Invalidate blood bank-specific donations if blood bank ID was provided
      if (data.bloodBank) {
        queryClient.invalidateQueries({ queryKey: ['donations', { bloodBankId: data.bloodBank }] });
      }
    },
  });
}

export function useDeleteDonation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/donations/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    },
  });
}

// Legacy functions for backward compatibility - will be deprecated
export async function fetchDonations() {
  try {
    const { data } = await api.get('/donations');
    return data.results || data;
  } catch (error) {
    console.error("Error fetching donations:", error);
    // Return mock data for demo purposes
    return [
      { id: "1", donorName: "Alice", volumeCollected: 500 },
      { id: "2", donorName: "Bob", volumeCollected: 350 },
    ];
  }
}

export async function createDonation(donation: CreateDonationDto) {
  try {
    const { data } = await api.post('/donations', donation);
  return data;
  } catch (error) {
    console.error("Error creating donation:", error);
    // Return mock response for demo purposes
    return { id: Math.random().toString(), ...donation };
  }
}
