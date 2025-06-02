// Types for Donation Schedule module based on backend entity

import type { BloodBank } from "../BloodBanksPage";

export enum ScheduleStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

export enum ReminderStatus {
  NOT_SENT = 'NOT_SENT',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export interface DonationSchedule {
  _id: string;
  donor: {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    email?: string;
    bloodType?: string;
    RhFactor?: string;
  };
  bloodBank: BloodBank;
  scheduledDate: string;
  timeSlot: string;
  status: ScheduleStatus;
  
  // Optional fields
  donationType?: string;
  purpose?: string;
  contactMethod?: string;
  sendReminders: boolean;
  reminderStatus: ReminderStatus;
  reminderSentAt?: string;
  
  // User who scheduled (admin/staff)
  scheduledBy?: {
    _id: string;
    email: string;
    name?: string;
  };
  
  // Status timestamps
  confirmedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  
  // Additional info
  specialInstructions?: string;
  notes?: string;
  
  // Related donation if completed
  completedDonation?: {
    _id: string;
    bagNumber?: string;
    volumeCollected?: number;
  };
  
  // Duration and recurrence
  estimatedDuration: number;
  isRecurring: boolean;
  recurringPattern?: string;
  parentSchedule?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateDonationScheduleDto {
  donor: string;
  bloodBank: string;
  scheduledDate: string | Date;
  timeSlot: string;
  donationType?: string;
  purpose?: string;
  contactMethod?: string;
  sendReminders?: boolean;
  specialInstructions?: string;
  notes?: string;
  estimatedDuration?: number;
  isRecurring?: boolean;
  recurringPattern?: string;
  parentSchedule?: string;
  scheduledBy?: string;
}

export interface UpdateDonationScheduleDto {
  scheduledDate?: string | Date;
  timeSlot?: string;
  donationType?: string;
  purpose?: string;
  contactMethod?: string;
  sendReminders?: boolean;
  specialInstructions?: string;
  notes?: string;
  estimatedDuration?: number;
  status?: ScheduleStatus;
  cancellationReason?: string;
}

// Query parameters for API calls
export interface DonationScheduleQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: ScheduleStatus;
  donorId?: string;
  bloodBankId?: string;
  startDate?: string;
  endDate?: string;
  timeSlot?: string;
  search?: string;
}

export interface DonationScheduleQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  donorId?: string;
  bloodBankId?: string;
  status?: ScheduleStatus;
  startDate?: string;
  endDate?: string;
  timeSlot?: string;
  sendReminders?: boolean;
  isRecurring?: boolean;
  [key: string]: any;
}

export interface PaginatedScheduleResponse {
  data: DonationSchedule[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ScheduleStats {
  totalSchedules: number;
  scheduledCount: number;
  confirmedCount: number;
  cancelledCount: number;
  completedCount: number;
  noShowCount: number;
  upcomingSchedules: number;
}

// Form related types
export interface ScheduleFormData extends CreateDonationScheduleDto {
  _id?: string;
}

// Filter types for search
export interface ScheduleFilters {
  status?: ScheduleStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  bloodBankId?: string;
  donorId?: string;
  timeSlots?: string[];
  reminderStatus?: ReminderStatus[];
}

// Time slot options
export interface TimeSlot {
  label: string;
  value: string;
  available?: boolean;
}

// Donor schedule summary
export interface DonorScheduleSummary {
  totalSchedules: number;
  upcomingSchedules: number;
  lastScheduledDate?: string;
  nextScheduledDate?: string;
  eligibilityDate?: string;
  isEligible: boolean;
}
