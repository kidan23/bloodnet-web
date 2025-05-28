// React Query hooks for blood requests
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type UpdateBloodRequestDto,
  type BloodRequestQueryParams,
  RequestStatus,
  type NearbySearchParams,
} from "../pages/BloodRequestsPage/types";

import {
  fetchBloodRequests,
  fetchBloodRequestById,
  createBloodRequest,
  updateBloodRequest,
  deleteBloodRequest,
  updateBloodRequestStatus,
  findBloodRequestsByInstitution,
  findBloodRequestsByStatus,
  findBloodRequestsByBloodType,
  findNearbyBloodRequests,
  findUrgentBloodRequests,
} from "../pages/BloodRequestsPage/api";

// Query hook for fetching all blood requests
export function useBloodRequests(params?: BloodRequestQueryParams) {
  return useQuery({
    queryKey: ["bloodRequests", params],
    queryFn: () => fetchBloodRequests(params),
  });
}

// Query hook for fetching a single blood request by ID
export function useBloodRequest(id?: string) {
  return useQuery({
    queryKey: ["bloodRequest", id],
    queryFn: () => fetchBloodRequestById(id!),
    enabled: !!id, // Only run the query if an ID is provided
  });
}

// Mutation hook for creating a new blood request
export function useCreateBloodRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBloodRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bloodRequests"] });
    },
  });
}

// Mutation hook for updating a blood request
export function useUpdateBloodRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBloodRequestDto }) =>
      updateBloodRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bloodRequests"] });
      queryClient.invalidateQueries({
        queryKey: ["bloodRequest", variables.id],
      });
    },
  });
}

// Mutation hook for deleting a blood request
export function useDeleteBloodRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBloodRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bloodRequests"] });
    },
  });
}

// Mutation hook for updating a blood request status
export function useUpdateBloodRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      updateBloodRequestStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bloodRequests"] });
      queryClient.invalidateQueries({
        queryKey: ["bloodRequest", variables.id],
      });
    },
  });
}

// Query hook for finding blood requests by institution
export function useBloodRequestsByInstitution(institutionId?: string) {
  return useQuery({
    queryKey: ["bloodRequests", "institution", institutionId],
    queryFn: () => findBloodRequestsByInstitution(institutionId!),
    enabled: !!institutionId,
  });
}

// Query hook for finding blood requests by status
export function useBloodRequestsByStatus(status?: RequestStatus) {
  return useQuery({
    queryKey: ["bloodRequests", "status", status],
    queryFn: () => findBloodRequestsByStatus(status!),
    enabled: !!status,
  });
}

// Query hook for finding blood requests by blood type
export function useBloodRequestsByBloodType(
  bloodType?: string,
  rhFactor?: string
) {
  return useQuery({
    queryKey: ["bloodRequests", "bloodType", bloodType, rhFactor],
    queryFn: () => findBloodRequestsByBloodType(bloodType!, rhFactor!),
    enabled: !!bloodType && !!rhFactor,
  });
}

// Query hook for finding nearby blood requests
export function useNearbyBloodRequests(params: NearbySearchParams) {
  return useQuery({
    queryKey: ["bloodRequests", "nearby", params],
    queryFn: () => findNearbyBloodRequests(params),
    enabled:
      !!params.latitude &&
      !!params.longitude &&
      !!params.bloodType &&
      !!params.rhFactor,
  });
}

// Query hook for finding urgent blood requests
export function useUrgentBloodRequests() {
  return useQuery({
    queryKey: ["bloodRequests", "urgent"],
    queryFn: findUrgentBloodRequests,
  });
}
