export type BloodType = "A" | "B" | "AB" | "O";

export interface LocationPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Donor {
  _id?: string;
  user?: string;
  
  // Personal Information
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  dateOfBirth: string; // ISO string
  gender: 'Male' | 'Female' | 'Other';
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  
  // Address Information
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  
  // Blood Information
  bloodType: BloodType;
  RhFactor: '+' | '-';
  
  // Medical Information
  medicalConditions?: string[];
  medications?: string[];
  allergies?: string[];
  
  // Donation History
  lastDonationDate?: string; // ISO string
  totalDonations?: number;
  nextEligibleDate?: string; // ISO string
  
  // Location
  location: LocationPoint;
  
  // Eligibility and Preferences
  isEligible?: boolean;
  receiveDonationAlerts?: boolean;
  maxTravelDistance?: number;
  preferredDonationCenter?: string;
  availableDays?: string[];
  preferredTimeOfDay?: string;
  
  // Computed/Helper properties
  age?: number;
  distance?: number; // For nearby queries
  createdAt?: string;
  updatedAt?: string;
}

export type CreateDonorPayload = Omit<Donor, '_id' | 'createdAt' | 'updatedAt' | 'age' | 'distance'> & {
  bloodType?: BloodType;
  RhFactor?: '+' | '-';
};
