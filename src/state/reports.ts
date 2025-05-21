// React Query hooks for reports
import { useQuery } from '@tanstack/react-query';

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      // TODO: Replace with real API call
      return [];
    },
  });
}

export async function fetchReports() {
  // Simulate API call
  return Promise.resolve([
    { id: 1, title: "Monthly Report" },
    { id: 2, title: "Annual Report" },
  ]);
}
