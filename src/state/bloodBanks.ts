// React Query hooks for blood banks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useBloodBanks() {
  return useQuery({
    queryKey: ['bloodBanks'],
    queryFn: async () => {
      // TODO: Replace with real API call
      return [];
    },
  });
}

export function useCreateBloodBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newBank: { name: string }) => {
      // TODO: Replace with real API call
      return newBank;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodBanks'] });
    },
  });
}

export async function fetchBloodBanks() {
  // Simulate API call
  return Promise.resolve([
    { id: 1, name: "Red Cross" },
    { id: 2, name: "City Blood Bank" },
  ]);
}

export async function createBloodBank(bank: { name: string }) {
  // Simulate API call
  return Promise.resolve({ id: Math.random(), ...bank });
}
