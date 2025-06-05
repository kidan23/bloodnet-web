// Types for the Donation module
import { DonationStatus, DonationType, CollectionMethod } from "./constants";

// Blood unit status enum from backend
export enum BloodUnitStatus {
  IN_INVENTORY = "in_inventory",
  RESERVED = "reserved",
  DISPATCHED = "dispatched",
  USED = "used",
  EXPIRED = "expired",
  DISCARDED = "discarded",
  QUARANTINED = "quarantined",
}

export interface Donation {
  _id: string;
  donor: {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  };
  bloodBank: {
    _id: string;
    name: string;
    location?: string;
  };
  donationDate: string;
  status: DonationStatus;
  bloodType?: string;

  // Blood unit tracking fields from backend
  unitStatus?: BloodUnitStatus;
  expiryDate?: string;
  dispatchedAt?: string;
  dispatchedTo?: string;
  usedAt?: string;
  usedFor?: string;
  discardedAt?: string;
  discardReason?: string;
  reservedForRequest?: string;
  // Medical metrics
  weight?: number;
  height?: number;
  hemoglobinLevel?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  pulseRate?: number;
  temperature?: number;

  // Blood donation details
  volumeCollected?: number;
  donationType?: string;
  bagNumber?: string;
  collectionMethod?: string;

  // Staff and equipment
  phlebotomist?: string;
  equipmentUsed?: string;

  // Post-donation
  adverseReaction?: boolean;
  adverseReactionDetails?: string;
  nextEligibleDonationDate?: string;

  // Notes
  notes?: string;
  isApproved?: boolean;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// BloodUnit interface - what the inventory page uses (same structure as Donation)
export type BloodUnit = Donation;

// Blood unit management DTOs from backend
export interface UpdateBloodUnitStatusDto {
  unitStatus: BloodUnitStatus;
  dispatchedTo?: string;
  dispatchedAt?: string;
  usedFor?: string;
  usedAt?: string;
  discardReason?: string;
  discardedAt?: string;
  reservedForRequest?: string;
}

export interface DispatchBloodUnitDto {
  dispatchedTo: string;
  dispatchedAt?: string;
  forRequest?: string;
}

export interface UseBloodUnitDto {
  usedFor: string;
  usedAt?: string;
}

export interface DiscardBloodUnitDto {
  discardReason: string;
  discardedAt?: string;
}

export interface AutoFulfillBloodRequestDto {
  bloodType: string;
  rhFactor: string;
  unitsNeeded: string;
  bloodBankId?: string;
}

export interface CreateDonationDto {
  donor: string;
  bloodBank: string;
  donationDate: string | Date;
  status?: DonationStatus;

  // Medical metrics (all optional)
  weight?: number;
  height?: number;
  hemoglobinLevel?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  pulseRate?: number;
  temperature?: number;

  // Blood donation details
  volumeCollected?: number;
  donationType?: string;
  bagNumber?: string;
  collectionMethod?: string;

  // Staff and equipment
  phlebotomist?: string;
  equipmentUsed?: string;

  // Post-donation
  adverseReaction?: boolean;
  adverseReactionDetails?: string;
  nextEligibleDonationDate?: string | Date;

  // Notes
  notes?: string;
  isApproved?: boolean;
}

export interface UpdateDonationDto extends Partial<CreateDonationDto> {}

export interface DonationFilters {
  donor?: string;
  bloodBank?: string;
  status?: DonationStatus;
  startDate?: string;
  endDate?: string;
  donationType?: DonationType;
  collectionMethod?: CollectionMethod;
}

export interface PaginatedDonationsResponse {
  content: Donation[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface DonorStats {
  totalDonations: number;
  totalVolume: number;
  lastDonation: string | null;
  averageHemoglobin: number | null;
  eligibleToDonateSince: string | null;
}

export interface BloodInventoryFilters {
  bloodType?: string;
  unitStatus?: BloodUnitStatus;
  donationType?: string;
  bloodBankId?: string;
  expiringWithinDays?: number;
  minWeight?: number;
  maxWeight?: number;
  startDate?: string;
  endDate?: string;
}

export interface DispatchRecord {
  id: string;
  unitIds: string[];
  hospitalId: string;
  hospitalName: string;
  requestId?: string;
  dispatchDate: string;
  deliveryDate?: string;
  status: "Pending" | "In Transit" | "Delivered" | "Cancelled";
  transportMethod: string;
  driverName?: string;
  vehicleNumber?: string;
  temperatureLog?: Array<{ time: string; temperature: number }>;
  notes?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsageRecord {
  id: string;
  unitId: string;
  bloodType: string;
  rhFactor: string;
  hospitalId: string;
  hospitalName: string;
  patientId: string;
  usageDate: string;
  purpose: "Surgery" | "Emergency" | "Transfusion" | "Research";
  quantity: number;
  status: "Completed" | "Partial" | "Cancelled";
  physician: string;
  notes?: string;
  dispatchId?: string;
  expiryDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BloodRequest {
  id: string;
  hospitalId: string;
  hospitalName: string;
  patientId: string;
  requestDate: string;
  urgency: "Critical" | "High" | "Medium" | "Low";
  bloodType: string;
  rhFactor: string;
  quantity: number;
  purpose: string;
  status: "Pending" | "Partially Fulfilled" | "Fulfilled" | "Cancelled";
  requiredBy: string;
  contactPerson: string;
  contactPhone?: string;
  notes?: string;
  fulfilledQuantity?: number;
  assignedUnits?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BloodInventoryStats {
  totalUnits: number;
  availableUnits: number;
  reservedUnits: number;
  dispatchedUnits: number;
  usedUnits: number;
  expiredUnits: number;
  discardedUnits: number;
  expiringWithin7Days: number;
  expiringWithin3Days: number;
  averageAge: number;
  inventoryByType: { [key: string]: number };
  inventoryByLocation: { [key: string]: number };
}

export interface DispatchStats {
  totalDispatches: number;
  pendingDispatches: number;
  inTransitDispatches: number;
  deliveredDispatches: number;
  cancelledDispatches: number;
  averageDeliveryTime: number;
  dispatchesByHospital: { [key: string]: number };
}

export interface UsageStats {
  totalUnitsUsed: number;
  completedUsages: number;
  partialUsages: number;
  cancelledUsages: number;
  usageByType: { [key: string]: number };
  usageByPurpose: { [key: string]: number };
  usageByHospital: { [key: string]: number };
  averageUsagePerDay: number;
}

export interface RequestFulfillmentStats {
  totalRequests: number;
  pendingRequests: number;
  fulfilledRequests: number;
  partiallyFulfilled: number;
  cancelledRequests: number;
  averageFulfillmentTime: number;
  fulfillmentRate: number;
  requestsByUrgency: { [key: string]: number };
  requestsByHospital: { [key: string]: number };
}

export interface CreateBloodUnitDto {
  donationId: string;
  bagNumber: string;
  bloodType: string;
  rhFactor: string;
  volumeML: number;
  collectionDate: string;
  location: string;
  storageConditions?: string;
}

export interface CreateDispatchDto {
  unitIds: string[];
  hospitalId: string;
  requestId?: string;
  transportMethod: string;
  driverName?: string;
  vehicleNumber?: string;
  notes?: string;
}

export interface CreateUsageRecordDto {
  unitId: string;
  hospitalId: string;
  patientId: string;
  purpose: UsageRecord["purpose"];
  quantity: number;
  physician: string;
  notes?: string;
  dispatchId?: string;
}

export interface CreateBloodRequestDto {
  hospitalId: string;
  patientId: string;
  urgency: BloodRequest["urgency"];
  bloodType: string;
  rhFactor: string;
  quantity: number;
  purpose: string;
  requiredBy: string;
  contactPerson: string;
  contactPhone?: string;
  notes?: string;
}

export interface UpdateBloodUnitDto extends Partial<CreateBloodUnitDto> {
  unitStatus?: BloodUnitStatus;
}

export interface UpdateDispatchDto extends Partial<CreateDispatchDto> {
  status?: DispatchRecord["status"];
  deliveryDate?: string;
}

export interface UpdateUsageRecordDto extends Partial<CreateUsageRecordDto> {
  status?: UsageRecord["status"];
}

export interface UpdateBloodRequestDto extends Partial<CreateBloodRequestDto> {
  status?: BloodRequest["status"];
  fulfilledQuantity?: number;
  assignedUnits?: string[];
}

export interface PaginatedBloodUnitsResponse {
  content: BloodUnit[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedDispatchResponse {
  content: DispatchRecord[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedUsageResponse {
  content: UsageRecord[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedBloodRequestsResponse {
  content: BloodRequest[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
