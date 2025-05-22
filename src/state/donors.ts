import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Fetch all donors (GET /donors)
export async function fetchDonors(params?: any) {
  const { data } = await api.get('/donors', { params });
  return data;
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
