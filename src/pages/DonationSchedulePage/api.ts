// API functions for donation schedules

import api from "../../state/api";
import { notificationsService } from "../../services/notificationsService";
import type {
  DonationSchedule,
  CreateDonationScheduleDto,
  UpdateDonationScheduleDto,
  DonationScheduleQueryParams,
  PaginatedScheduleResponse,
  ScheduleStats,
  ScheduleStatus,
} from "./types";

// Base API endpoint
const DONATION_SCHEDULE_API = "/donation-schedules";

// Fetch all donation schedules with optional query parameters
export async function fetchDonationSchedules(
  params?: DonationScheduleQueryParams
): Promise<PaginatedScheduleResponse> {
  const { data } = await api.get(DONATION_SCHEDULE_API, { params });
  return data;
}

// Get a single donation schedule by ID
export async function fetchDonationScheduleById(id: string): Promise<DonationSchedule> {
  const { data } = await api.get(`${DONATION_SCHEDULE_API}/${id}`);
  return data;
}

// Create a new donation schedule
export async function createDonationSchedule(
  scheduleData: CreateDonationScheduleDto
): Promise<DonationSchedule> {
  const { data } = await api.post(DONATION_SCHEDULE_API, scheduleData);

  // Notify donor about appointment reminder if reminders are enabled
  if (scheduleData.sendReminders) {
    await notificationsService.notifyAppointmentReminder(
      scheduleData.donor,
      data._id,
      new Date(scheduleData.scheduledDate),
      data.bloodBank?.name ?? "",
      scheduleData.timeSlot ?? ""
    );
  }

  return data;
}

// Update a donation schedule
export async function updateDonationSchedule(
  id: string,
  scheduleData: UpdateDonationScheduleDto
): Promise<DonationSchedule> {
  const { data } = await api.patch(`${DONATION_SCHEDULE_API}/${id}`, scheduleData);

  // Notify donor about appointment reminder if reminders are enabled
  if (scheduleData.sendReminders) {
    await notificationsService.notifyAppointmentReminder(
      data.donor?._id ?? "",
      id,
      new Date(scheduleData.scheduledDate ?? data.scheduledDate),
      data.bloodBank?.name ?? "",
      scheduleData.timeSlot ?? data.timeSlot ?? ""
    );
  }

  return data;
}

// Delete a donation schedule
export async function deleteDonationSchedule(id: string): Promise<void> {
  await api.delete(`${DONATION_SCHEDULE_API}/${id}`);
}

// Get schedules by donor
export async function fetchSchedulesByDonor(
  donorId: string,
  params?: DonationScheduleQueryParams
): Promise<PaginatedScheduleResponse> {
  const { data } = await api.get(`${DONATION_SCHEDULE_API}/donor/${donorId}`, { params });
  return data;
}

// Get schedules by blood bank
export async function fetchSchedulesByBloodBank(
  bloodBankId: string,
  params?: DonationScheduleQueryParams
): Promise<PaginatedScheduleResponse> {
  const { data } = await api.get(`${DONATION_SCHEDULE_API}/blood-bank/${bloodBankId}`, { params });
  return data;
}

// Get schedules by date range
export async function fetchSchedulesByDateRange(
  startDate: Date,
  endDate: Date,
  params?: DonationScheduleQueryParams
): Promise<PaginatedScheduleResponse> {
  const queryParams = {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    ...params,
  };
  const { data } = await api.get(`${DONATION_SCHEDULE_API}/date-range`, { params: queryParams });
  return data;
}

// Get schedules by status
export async function fetchSchedulesByStatus(
  status: ScheduleStatus,
  params?: DonationScheduleQueryParams
): Promise<PaginatedScheduleResponse> {
  const { data } = await api.get(`${DONATION_SCHEDULE_API}/status/${status}`, { params });
  return data;
}

// Get upcoming schedules
export async function fetchUpcomingSchedules(hours?: number): Promise<DonationSchedule[]> {
  const params = hours ? { hours } : {};
  const { data } = await api.get(`${DONATION_SCHEDULE_API}/upcoming`, { params });
  return data;
}

// Get schedule statistics
export async function fetchScheduleStats(bloodBankId?: string): Promise<ScheduleStats> {
  const params = bloodBankId ? { bloodBankId } : {};
  const { data } = await api.get(`${DONATION_SCHEDULE_API}/stats`, { params });
  return data;
}

// Confirm a schedule
export async function confirmSchedule(id: string): Promise<DonationSchedule> {
  const { data } = await api.patch(`${DONATION_SCHEDULE_API}/${id}/confirm`);
  return data;
}

// Cancel a schedule
export async function cancelSchedule(id: string, reason?: string): Promise<DonationSchedule> {
  const { data } = await api.patch(`${DONATION_SCHEDULE_API}/${id}/cancel`, { reason });
  return data;
}

// Complete a schedule
export async function completeSchedule(id: string, donationId: string): Promise<DonationSchedule> {
  const { data } = await api.patch(`${DONATION_SCHEDULE_API}/${id}/complete`, { donationId });
  return data;
}

// Check available time slots for a specific date and blood bank
export async function checkAvailableTimeSlots(
  bloodBankId: string,
  date: Date
): Promise<{ timeSlot: string; available: boolean }[]> {
  const params = {
    bloodBankId,
    date: date.toISOString(),
  };
  const { data } = await api.get(`${DONATION_SCHEDULE_API}/time-slots/availability`, { params });
  return data;
}
