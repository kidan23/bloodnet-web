import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Mock data for development/demo purposes
const mockDonorData = [
  {
    _id: "1",
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
  },
  {
    _id: "2",
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
