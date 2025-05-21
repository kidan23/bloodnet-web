// React Query hooks for donors
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useDonors() {
  return useQuery({
    queryKey: ['donors'],
    queryFn: async () => {
      // TODO: Replace with real API call
      return [];
    },
  });
}

export function useCreateDonor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newDonor: { name: string }) => {
      // TODO: Replace with real API call
      return newDonor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
    },
  });
}
