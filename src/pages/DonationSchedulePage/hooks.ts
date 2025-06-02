// React Query hooks for donation schedules

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDonationSchedules,
  fetchDonationScheduleById,
  createDonationSchedule,
  updateDonationSchedule,
  deleteDonationSchedule,
  fetchSchedulesByDonor,
  fetchSchedulesByBloodBank,
  fetchSchedulesByDateRange,
  fetchSchedulesByStatus,
  fetchUpcomingSchedules,
  fetchScheduleStats,
  confirmSchedule,
  cancelSchedule,
  completeSchedule,
  checkAvailableTimeSlots,
} from "./api";
import type {
  DonationScheduleQueryParams,
  CreateDonationScheduleDto,
  UpdateDonationScheduleDto,
  ScheduleStatus,
} from "./types";
import { useAuth } from "../../state/authContext";
import { UserRole } from "../../state/auth";

// Query keys for better cache management
export const donationScheduleKeys = {
  all: ["donationSchedules"] as const,
  lists: () => [...donationScheduleKeys.all, "list"] as const,
  list: (params: DonationScheduleQueryParams) => [...donationScheduleKeys.lists(), params] as const,
  details: () => [...donationScheduleKeys.all, "detail"] as const,
  detail: (id: string) => [...donationScheduleKeys.details(), id] as const,
  donor: (donorId: string) => [...donationScheduleKeys.all, "donor", donorId] as const,
  bloodBank: (bloodBankId: string) => [...donationScheduleKeys.all, "bloodBank", bloodBankId] as const,
  dateRange: (startDate: Date, endDate: Date) => [...donationScheduleKeys.all, "dateRange", startDate.toISOString(), endDate.toISOString()] as const,
  status: (status: ScheduleStatus) => [...donationScheduleKeys.all, "status", status] as const,
  upcoming: (hours?: number) => [...donationScheduleKeys.all, "upcoming", hours] as const,
  stats: (bloodBankId?: string) => [...donationScheduleKeys.all, "stats", bloodBankId] as const,
  timeSlots: (bloodBankId: string, date?: Date) => [
    ...donationScheduleKeys.all,
    "timeSlots",
    bloodBankId,
    date ? date.toISOString() : undefined,
  ] as const,
};

// Query hook for fetching all donation schedules based on user's role
export function useDonationSchedules(params?: DonationScheduleQueryParams) {
  const { user, userRole } = useAuth();
  
  return useQuery({
    queryKey: [...donationScheduleKeys.list(params || {}), userRole, user?._id],
    queryFn: () => {
      // For donors, fetch only their own schedules
      if (userRole === UserRole.DONOR && user?._id) {
        return fetchSchedulesByDonor(user._id, params);
      }
      
      // For blood banks, fetch only schedules at their location
      if (userRole === UserRole.BLOOD_BANK && user?.bloodBankProfile) {
        return fetchSchedulesByBloodBank(user.bloodBankProfile, params);
      }
      
      // For hospitals or admins, fetch all schedules (role-based access controlled by backend)
      return fetchDonationSchedules(params);
    },
  });
}

// Query hook for fetching a single donation schedule by ID
export function useDonationSchedule(id?: string) {
  return useQuery({
    queryKey: donationScheduleKeys.detail(id!),
    queryFn: () => fetchDonationScheduleById(id!),
    enabled: !!id,
  });
}

// Query hook for fetching schedules by donor
export function useSchedulesByDonor(donorId?: string, params?: DonationScheduleQueryParams) {
  return useQuery({
    queryKey: donationScheduleKeys.donor(donorId!),
    queryFn: () => fetchSchedulesByDonor(donorId!, params),
    enabled: !!donorId,
  });
}

// Query hook for fetching schedules by blood bank
export function useSchedulesByBloodBank(bloodBankId?: string, params?: DonationScheduleQueryParams) {
  return useQuery({
    queryKey: donationScheduleKeys.bloodBank(bloodBankId!),
    queryFn: () => fetchSchedulesByBloodBank(bloodBankId!, params),
    enabled: !!bloodBankId,
  });
}

// Query hook for fetching schedules by date range
export function useSchedulesByDateRange(startDate: Date, endDate: Date, params?: DonationScheduleQueryParams) {
  return useQuery({
    queryKey: donationScheduleKeys.dateRange(startDate, endDate),
    queryFn: () => fetchSchedulesByDateRange(startDate, endDate, params),
    enabled: !!(startDate && endDate),
  });
}

// Query hook for fetching schedules by status
export function useSchedulesByStatus(status?: ScheduleStatus, params?: DonationScheduleQueryParams) {
  return useQuery({
    queryKey: donationScheduleKeys.status(status!),
    queryFn: () => fetchSchedulesByStatus(status!, params),
    enabled: !!status,
  });
}

// Query hook for fetching upcoming schedules
export function useUpcomingSchedules(hours?: number) {
  return useQuery({
    queryKey: donationScheduleKeys.upcoming(hours),
    queryFn: () => fetchUpcomingSchedules(hours),
  });
}

// Query hook for fetching schedule statistics
export function useScheduleStats(bloodBankId?: string) {
  return useQuery({
    queryKey: donationScheduleKeys.stats(bloodBankId),
    queryFn: () => fetchScheduleStats(bloodBankId),
  });
}

// Query hook for checking available time slots
export function useAvailableTimeSlots(bloodBankId?: string, date?: Date) {
  return useQuery({
    queryKey: donationScheduleKeys.timeSlots(bloodBankId!, date!),
    queryFn: () => checkAvailableTimeSlots(bloodBankId!, date!),
    enabled: !!(bloodBankId && date),
  });
}

// Mutation hook for creating a new donation schedule
export function useCreateDonationSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDonationSchedule,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.all });
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.donor(data.donor._id) });
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.bloodBank(data.bloodBank._id) });
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.stats() });
    },
  });
}

// Mutation hook for updating a donation schedule
export function useUpdateDonationSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDonationScheduleDto }) =>
      updateDonationSchedule(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.all });
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.donor(data.donor._id) });
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.bloodBank(data.bloodBank._id) });
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.stats() });
    },
  });
}

// Mutation hook for deleting a donation schedule
export function useDeleteDonationSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDonationSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.all });
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.stats() });
    },
  });
}

// Mutation hook for confirming a schedule
export function useConfirmSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmSchedule,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.all });
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.detail(data._id) });
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.donor(data.donor._id) });
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.bloodBank(data.bloodBank._id) });
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.stats() });
    },
  });
}

// Mutation hook for canceling a schedule
export function useCancelSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelSchedule(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.all });
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.detail(data._id) });
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.donor(data.donor._id) });
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.bloodBank(data.bloodBank._id) });
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.stats() });
    },
  });
}

// Mutation hook for completing a schedule
export function useCompleteSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, donationId }: { id: string; donationId: string }) =>
      completeSchedule(id, donationId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.all });
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.detail(data._id) });
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.donor(data.donor._id) });
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.bloodBank(data.bloodBank._id) });
      queryClient.invalidateQueries({ queryKey: donationScheduleKeys.stats() });
      // Also invalidate donations since a new donation was created
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    },
  });
}
