// React Query hooks for donations
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useDonations() {
  return useQuery({
    queryKey: ['donations'],
    queryFn: async () => {
      // TODO: Replace with real API call
      return [];
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
