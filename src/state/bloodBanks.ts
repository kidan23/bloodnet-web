// React Query hooks for blood banks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import type {
  BloodBank,
  BloodBankQueryParams,
  CreateBloodBankDto,
  NearbySearchParams,
  UpdateBloodBankDto,
  PaginatedResponse
} from '../pages/BloodBanksPage/types';

// API endpoints
const BLOOD_BANK_API = '/blood-bank';

// Fetch all blood banks with optional query parameters
export async function fetchBloodBanks(params?: BloodBankQueryParams): Promise<PaginatedResponse<BloodBank>> {
  const { data } = await api.get(BLOOD_BANK_API, { params });
  return data;
}

// Get a single blood bank by ID
export async function fetchBloodBankById(id: string): Promise<BloodBank> {
  const { data } = await api.get(`${BLOOD_BANK_API}/${id}`);
  return data;
}

// Create a new blood bank
export async function createBloodBank(bankData: CreateBloodBankDto): Promise<BloodBank> {
  const { data } = await api.post(BLOOD_BANK_API, bankData);
  return data;
}

// Update a blood bank
export async function updateBloodBank(id: string, bankData: UpdateBloodBankDto): Promise<BloodBank> {
  const { data } = await api.patch(`${BLOOD_BANK_API}/${id}`, bankData);
  return data;
}

// Delete a blood bank
export async function deleteBloodBank(id: string): Promise<void> {
  await api.delete(`${BLOOD_BANK_API}/${id}`);
}

// Toggle active status of a blood bank
export async function toggleBloodBankStatus(id: string): Promise<BloodBank> {
  const { data } = await api.patch(`${BLOOD_BANK_API}/${id}/toggle-status`, {});
  return data;
}

// Update blood types available at a blood bank
export async function updateBloodTypesAvailable(id: string, bloodTypes: string[]): Promise<BloodBank> {
  const { data } = await api.patch(`${BLOOD_BANK_API}/${id}/blood-types`, { bloodTypes });
  return data;
}

// Search blood banks by name
export async function searchBloodBanksByName(name: string): Promise<PaginatedResponse<BloodBank>> {
  const { data } = await api.get(`${BLOOD_BANK_API}/search/name/${name}`);
  return data;
}

// Search blood banks by city
export async function searchBloodBanksByCity(city: string): Promise<PaginatedResponse<BloodBank>> {
  const { data } = await api.get(`${BLOOD_BANK_API}/search/city/${city}`);
  return data;
}

// Search blood banks by coordinates
export async function searchBloodBanksByCoordinates(params: NearbySearchParams): Promise<PaginatedResponse<BloodBank>> {
  const { data } = await api.get(`${BLOOD_BANK_API}/search/coordinates`, { params });
  return data;
}

// Search for nearby blood banks with specific blood type
export async function searchNearbyWithBloodType(params: NearbySearchParams & { bloodType: string }): Promise<PaginatedResponse<BloodBank>> {
  const { data } = await api.get(`${BLOOD_BANK_API}/search/nearby-blood-type`, { params });
  return data;
}

// Assign user to blood bank
export async function assignUserToBloodBank(id: string, userId: string): Promise<BloodBank> {
  const { data } = await api.patch(`${BLOOD_BANK_API}/${id}`, { user: userId });
  return data;
}

// React Query hooks
export function useBloodBanks(params?: BloodBankQueryParams) {
  return useQuery({
    queryKey: ['bloodBanks', params],
    queryFn: () => fetchBloodBanks(params),
  });
}

export function useBloodBank(id: string) {
  return useQuery({
    queryKey: ['bloodBank', id],
    queryFn: () => fetchBloodBankById(id),
    enabled: !!id,
  });
}

export function useCreateBloodBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBloodBank,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodBanks'] });
    },
  });
}

export function useUpdateBloodBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBloodBankDto }) => 
      updateBloodBank(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bloodBanks'] });
      queryClient.invalidateQueries({ queryKey: ['bloodBank', variables.id] });
    },
  });
}

export function useDeleteBloodBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBloodBank,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodBanks'] });
    },
  });
}

export function useToggleBloodBankStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleBloodBankStatus,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['bloodBanks'] });
      queryClient.invalidateQueries({ queryKey: ['bloodBank', id] });
    },
  });
}

export function useUpdateBloodTypes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, bloodTypes }: { id: string; bloodTypes: string[] }) => 
      updateBloodTypesAvailable(id, bloodTypes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bloodBanks'] });
      queryClient.invalidateQueries({ queryKey: ['bloodBank', variables.id] });
    },
  });
}

export function useSearchBloodBanksByName(name: string) {
  return useQuery({
    queryKey: ['bloodBanks', 'name', name],
    queryFn: () => searchBloodBanksByName(name),
    enabled: !!name && name.length > 0,
  });
}

export function useSearchBloodBanksByCity(city: string) {
  return useQuery({
    queryKey: ['bloodBanks', 'city', city],
    queryFn: () => searchBloodBanksByCity(city),
    enabled: !!city && city.length > 0,
  });
}

export function useSearchBloodBanksByCoordinates(params: NearbySearchParams) {
  return useQuery({
    queryKey: ['bloodBanks', 'coordinates', params],
    queryFn: () => searchBloodBanksByCoordinates(params),
    enabled: !!params.latitude && !!params.longitude,
  });
}

export function useSearchNearbyWithBloodType(params: NearbySearchParams & { bloodType: string }) {
  return useQuery({
    queryKey: ['bloodBanks', 'nearbyWithBloodType', params],
    queryFn: () => searchNearbyWithBloodType(params),
    enabled: !!params.latitude && !!params.longitude && !!params.bloodType,
  });
}

export function useAssignUserToBloodBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => 
      assignUserToBloodBank(id, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bloodBanks'] });
      queryClient.invalidateQueries({ queryKey: ['bloodBank', variables.id] });
    },
  });
}
