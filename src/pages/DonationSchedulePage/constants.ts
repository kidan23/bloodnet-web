// Constants for donation schedules

import type { TimeSlot } from "./types";
import { ScheduleStatus, ReminderStatus } from "./types";

// Time slot options for scheduling appointments
export const TIME_SLOTS: TimeSlot[] = [
  { label: "8:00 AM - 9:00 AM", value: "08:00-09:00" },
  { label: "9:00 AM - 10:00 AM", value: "09:00-10:00" },
  { label: "10:00 AM - 11:00 AM", value: "10:00-11:00" },
  { label: "11:00 AM - 12:00 PM", value: "11:00-12:00" },
  { label: "12:00 PM - 1:00 PM", value: "12:00-13:00" },
  { label: "1:00 PM - 2:00 PM", value: "13:00-14:00" },
  { label: "2:00 PM - 3:00 PM", value: "14:00-15:00" },
  { label: "3:00 PM - 4:00 PM", value: "15:00-16:00" },
  { label: "4:00 PM - 5:00 PM", value: "16:00-17:00" },
  { label: "5:00 PM - 6:00 PM", value: "17:00-18:00" },
];

// Donation type options
export const DONATION_TYPES = [
  { label: "Whole Blood", value: "Whole Blood" },
  { label: "Plasma", value: "Plasma" },
  { label: "Platelets", value: "Platelets" },
  { label: "Double Red Cells", value: "Double Red Cells" },
  { label: "Power Red", value: "Power Red" },
];

// Purpose options
export const PURPOSE_OPTIONS = [
  { label: "Regular Donation", value: "Regular Donation" },
  { label: "Emergency Request", value: "Emergency Request" },
  { label: "Blood Drive", value: "Blood Drive" },
  { label: "Replacement Donation", value: "Replacement Donation" },
  { label: "Directed Donation", value: "Directed Donation" },
];

// Contact method options
export const CONTACT_METHODS = [
  { label: "Phone", value: "Phone" },
  { label: "Email", value: "Email" },
  { label: "SMS", value: "SMS" },
  { label: "Mobile App", value: "Mobile App" },
];

// Status options for filtering
export const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Scheduled", value: ScheduleStatus.SCHEDULED },
  { label: "Confirmed", value: ScheduleStatus.CONFIRMED },
  { label: "Cancelled", value: ScheduleStatus.CANCELLED },
  { label: "Completed", value: ScheduleStatus.COMPLETED },
  { label: "No Show", value: ScheduleStatus.NO_SHOW },
];

// Reminder status options
export const REMINDER_STATUS_OPTIONS = [
  { label: "Not Sent", value: ReminderStatus.NOT_SENT },
  { label: "Sent", value: ReminderStatus.SENT },
  { label: "Failed", value: ReminderStatus.FAILED },
];

// Recurring pattern options
export const RECURRING_PATTERNS = [
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Every 2 Months", value: "every-2-months" },
  { label: "Every 3 Months", value: "every-3-months" },
  { label: "Every 6 Months", value: "every-6-months" },
  { label: "Yearly", value: "yearly" },
];

// Default estimated duration in minutes
export const DEFAULT_DURATION = 60;

// Status colors for UI display
export const STATUS_COLORS = {
  [ScheduleStatus.SCHEDULED]: "info",
  [ScheduleStatus.CONFIRMED]: "success",
  [ScheduleStatus.CANCELLED]: "danger",
  [ScheduleStatus.COMPLETED]: "success",
  [ScheduleStatus.NO_SHOW]: "warning",
} as const;

// Status labels for UI display
export const STATUS_LABELS = {
  [ScheduleStatus.SCHEDULED]: "Scheduled",
  [ScheduleStatus.CONFIRMED]: "Confirmed",
  [ScheduleStatus.CANCELLED]: "Cancelled",
  [ScheduleStatus.COMPLETED]: "Completed",
  [ScheduleStatus.NO_SHOW]: "No Show",
} as const;

// Status severity mapping for PrimeReact Tag component
export const STATUS_SEVERITY = {
  [ScheduleStatus.SCHEDULED]: "info",
  [ScheduleStatus.CONFIRMED]: "success",
  [ScheduleStatus.CANCELLED]: "danger",
  [ScheduleStatus.COMPLETED]: "success",
  [ScheduleStatus.NO_SHOW]: "warning",
} as const;

// Reminder status colors
export const REMINDER_STATUS_COLORS = {
  [ReminderStatus.NOT_SENT]: "info",
  [ReminderStatus.SENT]: "success",
  [ReminderStatus.FAILED]: "danger",
} as const;

// Days of the week for recurring schedules
export const DAYS_OF_WEEK = [
  { label: "Monday", value: "monday" },
  { label: "Tuesday", value: "tuesday" },
  { label: "Wednesday", value: "wednesday" },
  { label: "Thursday", value: "thursday" },
  { label: "Friday", value: "friday" },
  { label: "Saturday", value: "saturday" },
  { label: "Sunday", value: "sunday" },
];

// Sort options for schedule lists
export const SORT_OPTIONS = [
  { label: "Date (Newest First)", value: "-scheduledDate" },
  { label: "Date (Oldest First)", value: "scheduledDate" },
  { label: "Status", value: "status" },
  { label: "Time Slot", value: "timeSlot" },
  { label: "Donor Name", value: "donor.firstName" },
  { label: "Blood Bank", value: "bloodBank.name" },
];

// Pagination options
export const PAGINATION_OPTIONS = [
  { label: "10 per page", value: 10 },
  { label: "25 per page", value: 25 },
  { label: "50 per page", value: 50 },
  { label: "100 per page", value: 100 },
];

// Default form values
export const DEFAULT_SCHEDULE_FORM = {
  donor: "",
  bloodBank: "",
  scheduledDate: new Date(),
  timeSlot: "",
  donationType: "Whole Blood",
  purpose: "Regular Donation",
  contactMethod: "Email",
  sendReminders: true,
  estimatedDuration: DEFAULT_DURATION,
  isRecurring: false,
  specialInstructions: "",
  notes: "",
};

// Validation messages
export const VALIDATION_MESSAGES = {
  DONOR_REQUIRED: "Donor selection is required",
  BLOOD_BANK_REQUIRED: "Blood bank selection is required",
  DATE_REQUIRED: "Scheduled date is required",
  DATE_FUTURE: "Scheduled date must be in the future",
  TIME_SLOT_REQUIRED: "Time slot selection is required",
  CANCELLATION_REASON_REQUIRED: "Cancellation reason is required",
  DONATION_ID_REQUIRED: "Donation ID is required for completion",
};
