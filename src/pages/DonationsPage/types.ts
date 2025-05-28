// Types for the Donation module
import { DonationStatus, DonationType, CollectionMethod } from "./constants";

export interface Donation {
  id: string;
  donor: string;
  donorName?: string;
  bloodBank: string;
  bloodBankName?: string;
  donationDate: string;
  status: DonationStatus;
  
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
