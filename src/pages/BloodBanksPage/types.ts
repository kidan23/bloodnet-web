// Types for Blood Banks
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface BloodBank {
  id: string;
  name: string;
  address: string;
  location: GeoPoint;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  contactNumber: string;
  alternateContactNumber?: string;
  email: string;
  website?: string;
  operatingHours?: string;
  bloodTypesAvailable?: string[];
  licenseNumber?: string;
  establishedDate?: string;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface CreateBloodBankDto {
  name: string;
  address: string;
  location: GeoPoint;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  contactNumber: string;
  alternateContactNumber?: string;
  email: string;
  website?: string;
  operatingHours?: string;
  bloodTypesAvailable?: string[];
  licenseNumber?: string;
  establishedDate?: string;
}

export interface UpdateBloodBankDto extends Partial<CreateBloodBankDto> {
  // Additional fields that can be updated but not required for creation
}

export interface BloodBankQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: string;
  [key: string]: string | number | undefined;
}

export interface NearbySearchParams {
  latitude: number;
  longitude: number;
  maxDistance?: number;
  bloodType?: string;
}
