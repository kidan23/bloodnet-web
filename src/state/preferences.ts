// React Query hooks for preferences
import { useQuery } from '@tanstack/react-query';

export function usePreferences() {
  return useQuery({
    queryKey: ['preferences'],
    queryFn: async () => {
      // TODO: Replace with real API call
      return {};
    },
  });
}

export async function fetchPreferences() {
  // Simulate API call
  return Promise.resolve({ theme: 'light', notifications: true });
}
