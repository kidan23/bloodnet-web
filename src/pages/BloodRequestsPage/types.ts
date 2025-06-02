// Types for Blood Requests
import { BloodTypeEnum, type BloodType } from "../../pages/DonorsPage/types";

export { BloodTypeEnum };

export enum RequestStatus {
  PENDING = "pending",
  FULFILLED = "fulfilled",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
  PARTIALLY_FULFILLED = "partially_fulfilled",
}

export enum RequestPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface BloodRequest {
  _id: string;
  institution: {
    id: string;
    name: string;
  };
  bloodType: BloodType;
  RhFactor: string;
  unitsRequired: number;
  priority: RequestPriority;
  requiredBy: string;
  patientCondition?: string;
  notes?: string;
  coordinates: [number, number]; // [longitude, latitude]
  notifyNearbyDonors?: boolean;
  notificationRadius?: number;
  status: RequestStatus;
  requestedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBloodRequestDto {
  institution: string;
  bloodType: BloodType;
  RhFactor: string;
  unitsRequired: number;
  priority?: RequestPriority;
  requiredBy: Date;
  patientCondition?: string;
  notes?: string;
  coordinates: [number, number]; // [longitude, latitude]
  notifyNearbyDonors?: boolean;
  notificationRadius?: number;
  location: string; // Location of the blood request
  eligibleDonorIds: string[]; // IDs of eligible donors
  nearbyBloodBankIds: string[]; // IDs of nearby blood banks
}

export interface UpdateBloodRequestDto extends Partial<CreateBloodRequestDto> {
  status?: RequestStatus;
}

export interface BloodRequestQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: string;
  [key: string]: string | number | undefined;
}

export interface PaginatedResponse<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface NearbySearchParams {
  bloodType: string;
  rhFactor: string;
  latitude: number;
  longitude: number;
  radius?: number;
}
