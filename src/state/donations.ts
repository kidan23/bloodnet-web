// React Query hooks for donations
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Mock donations data for development/demo purposes
const mockDonations: Record<string, Array<{id: number; donorId: string; date: string; amount: number; status: string}>> = {
  "1": [
    { id: 1, donorId: "1", date: '2025-01-15', amount: 450, status: 'completed' },
    { id: 2, donorId: "1", date: '2024-10-20', amount: 500, status: 'completed' },
    { id: 3, donorId: "1", date: '2024-07-05', amount: 450, status: 'completed' }
  ],
  "2": [
    { id: 4, donorId: "2", date: '2024-12-05', amount: 500, status: 'completed' },
    { id: 5, donorId: "2", date: '2024-09-12', amount: 450, status: 'completed' },
    { id: 6, donorId: "2", date: '2024-06-20', amount: 500, status: 'completed' },
    { id: 7, donorId: "2", date: '2024-03-15', amount: 450, status: 'completed' }
  ]
};

export function useDonations(options?: { 
  donorId?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ['donations', options?.donorId, options?.page, options?.pageSize],
    queryFn: async () => {      try {
        const page = options?.page || 0;
        const pageSize = options?.pageSize || 10;
        
        if (options?.donorId) {
          // Fetch donations for a specific donor with pagination
          try {
            // Use page+1 because API might be 1-indexed while our local state is 0-indexed
            const { data } = await api.get(`/donations?donor=${options.donorId}&page=${page+1}&limit=${pageSize}`);
            
            // Handle the specific API response format
            // {"results":[],"page":1,"limit":10,"totalPages":0,"totalResults":0}
            if (data.results) {
              return {
                content: data.results,
                totalElements: data.totalResults,
                totalPages: data.totalPages,
                number: data.page - 1, // Convert to 0-indexed for consistency
                size: data.limit,
                hasNext: data.page < data.totalPages,
                hasPrevious: data.page > 1
              };
            }
            
            // If the API returns just an array, convert to paginated format
            return {
              content: data,
              totalElements: data.length,
              totalPages: 1,
              number: page,
              size: pageSize,
              hasNext: false,
              hasPrevious: page > 0
            };
          } catch (error) {
            console.error("Error fetching donations:", error);
            throw error;
          }        }
        // For all donations with pagination
        const { data } = await api.get(`/donations?page=${page+1}&limit=${pageSize}`);
        
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
          };
        }
        
        return {
          content: data,
          totalElements: data.length,
          totalPages: 1,
          number: page,
          size: pageSize,
          hasNext: false,
          hasPrevious: page > 0
        };
      } catch (error){
        console.error("Error fetching donations:", error);        // For demo purposes, return mock data if the API fails
        if (options?.donorId && mockDonations[options.donorId as keyof typeof mockDonations]) {
          // Simulate pagination for mock data
          const allDonations = mockDonations[options.donorId as keyof typeof mockDonations];
          const page = options?.page || 0;
          const pageSize = options?.pageSize || 10;
          const startIdx = page * pageSize;
          const endIdx = Math.min(startIdx + pageSize, allDonations.length);
          const paginatedItems = allDonations.slice(startIdx, endIdx);
          
          // Return mock data in the same format as the API response
          return {
            content: paginatedItems,
            totalElements: allDonations.length,
            totalPages: Math.ceil(allDonations.length / pageSize),
            number: page,
            size: pageSize,
            hasNext: endIdx < allDonations.length,
            hasPrevious: page > 0
          };
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
        };
      }
    },
  });
}

export function useCreateDonation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newDonation: { donorName: string; amount: number }) => {
      // TODO: Replace with real API call
      return newDonation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    },
  });
}

export async function fetchDonations() {
  // Simulate API call
  return Promise.resolve([
    { id: 1, donorName: "Alice", amount: 500 },
    { id: 2, donorName: "Bob", amount: 350 },
  ]);
}

export async function createDonation(donation: { donorName: string; amount: number }) {
  // Simulate API call
  return Promise.resolve({ id: Math.random(), ...donation });
}
