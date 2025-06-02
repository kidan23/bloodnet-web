import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Mock data for development/demo purposes
const mockDonorData = [
  {
    _id: "1",
    user: "user123", // Mock user ID
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "555-123-4567",
    email: "john.doe@example.com",
    dateOfBirth: "1985-05-15",
    gender: "Male",
    bloodType: "A",
    RhFactor: "+",
    isEligible: true,
    lastDonationDate: "2025-01-10",
    totalDonations: 8,
    nextEligibleDate: "2025-07-10",
    city: "New York",
    state: "NY",
    address: "123 Main St",
    postalCode: "10001",
    medicalConditions: [],
    medications: [],
    allergies: ["Penicillin"],
    emergencyContactName: "Jane Doe",
    emergencyContactPhone: "555-987-6543",
    emergencyContactRelationship: "Spouse"
  },  {
    _id: "2",
    user: "user456", // Mock user ID
    firstName: "Sarah",
    lastName: "Smith",
    phoneNumber: "555-234-5678",
    email: "sarah.smith@example.com",
    dateOfBirth: "1990-09-20",
    gender: "Female",
    bloodType: "O",
    RhFactor: "-",
    isEligible: true,
    lastDonationDate: "2024-12-05",
    totalDonations: 12,
    nextEligibleDate: "2025-06-05",
    city: "Boston",
    state: "MA",
    address: "456 Oak Ave",
    postalCode: "02108",
    medicalConditions: ["Asthma"],
    medications: ["Albuterol"],
    allergies: []
  }
];

// Fetch all donors (GET /donors)
export async function fetchDonors(params?: any) {
  try {
    const { data } = await api.get('/donors', { params });
    return data;
  } catch (error) {
    console.error("Error fetching donors:", error);
    // For demo purposes, return mock data if the API fails
    if (params?.id) {
      const donor = mockDonorData.find(d => d._id === params.id);
      return donor ? { results: [donor], total: 1 } : { results: [], total: 0 };
    }
    return { results: mockDonorData, total: mockDonorData.length };
  }
}

// Fetch a single donor by ID (GET /donors/:id)
export async function fetchDonorById(id: string) {
  try {
    const { data } = await api.get(`/donors/${id}`);
    return data;
  } catch (error) {
    console.error(`Error fetching donor with ID ${id}:`, error);
    // For demo purposes, return mock data if the API fails
    return mockDonorData.find(donor => donor._id === id) || null;
  }
}

// Fetch a single donor by user ID (GET /donors/user/:userId)
export async function fetchDonorByUserId(userId: string) {
  try {
    const { data } = await api.get(`/donors/user/${userId}`);
    return data;
  } catch (error) {
    console.error(`Error fetching donor for user ID ${userId}:`, error);
    // For demo purposes, return mock data if the API fails
    // In a real app, this would return null if no donor profile exists
    return mockDonorData.find(donor => donor.user === userId) || null;
  }
}

// Create donor (POST /donors)
export async function createDonor(payload: any) {
  const { data } = await api.post('/donors', payload);
  return data;
}

// Update donor (PATCH /donors/:id)
export async function updateDonor(id: string, payload: any) {
  const { data } = await api.patch(`/donors/${id}`, payload);
  return data;
}

// Delete donor (DELETE /donors/:id) -- assuming RESTful convention, though not in controller, add for completeness
export async function deleteDonor(id: string) {
  const { data } = await api.delete(`/donors/${id}`);
  return data;
}

// Search for nearby donors
export async function findNearbyDonors(
  bloodType: string,
  lng: number,
  lat: number,
  radius?: number,
  params?: any
) {
  try {
    const queryParams = {
      lng,
      lat,
      radius: radius || 10, // Default 10km radius
      ...params
    };
    
    // Only add bloodType to query if it's specified
    if (bloodType) {
      queryParams.bloodType = bloodType;
    }
    
    const { data } = await api.get('/donors/nearby', { params: queryParams });
    return data;
  } catch (error) {
    console.error("Error fetching nearby donors:", error);
    // For demo purposes, return mock nearby data
    let filteredMockData = mockDonorData;
    
    // Filter by blood type only if specified
    if (bloodType) {
      filteredMockData = mockDonorData.filter(donor => 
        `${donor.bloodType}${donor.RhFactor}` === bloodType || 
        donor.bloodType === bloodType.replace(/[+-]/, '') // Handle cases where RhFactor is separate
      );
    }
    
    return {
      results: filteredMockData.map(donor => ({
        ...donor,
        // Add mock location data
        location: {
          type: "Point",
          coordinates: [39.45389 + (Math.random() - 0.5) * 0.1, 13.5169 + (Math.random() - 0.5) * 0.1] // Mock coordinates around Mek'ele
        },
        // Add distance for sorting
        distance: Math.round(Math.random() * 10 * 100) / 100, // Random distance 0-10km
      })),
      total: filteredMockData.length
    };
  }
}

export function useDonors(params?: any) {
  return useQuery({
    queryKey: ['donors', params],
    queryFn: () => fetchDonors(params),
  });
}

export function useDonor(id?: string) {
  return useQuery({
    queryKey: ['donor', id],
    queryFn: () => fetchDonorById(id!),
    enabled: !!id, // Only run the query if an ID is provided
  });
}

export function useDonorByUserId(userId?: string) {
  return useQuery({
    queryKey: ['donor', 'user', userId],
    queryFn: () => fetchDonorByUserId(userId!),
    enabled: !!userId, // Only run the query if a user ID is provided
  });
}

export function useCreateDonor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDonor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
    },
  });
}

export function useUpdateDonor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: any) => updateDonor(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
    },
  });
}

export function useDeleteDonor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDonor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
    },
  });
}

// React Query hook for nearby donors
export function useNearbyDonors(
  bloodType: string,
  lng: number,
  lat: number,
  radius?: number,
  params?: any
) {
  return useQuery({
    queryKey: ['donors', 'nearby', bloodType, lng, lat, radius, params],
    queryFn: () => findNearbyDonors(bloodType, lng, lat, radius, params),
    enabled: !!(lng && lat), // Only require coordinates, blood type is optional
  });
}
