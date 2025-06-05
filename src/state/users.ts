// React Query hooks for users
import { useQuery } from '@tanstack/react-query';
import api from './api';

interface User {
  _id: string;
  email: string;
  role: string;
  createdAt: string;
}

interface UserSearchResponse {
  users: User[];
  total: number;
}

// API endpoints
const USERS_API = '/users';

// Search users by email
export async function searchUsers(query: string): Promise<UserSearchResponse> {
  const { data } = await api.get(`${USERS_API}/search`, { 
    params: { q: query } 
  });
  return data;
}

// React Query hooks
export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => searchUsers(query),
    enabled: !!query && query.length > 0,
  });
}
