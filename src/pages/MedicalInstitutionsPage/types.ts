export interface MedicalInstitution {
  _id: string;
  name: string;
  registrationNumber: string;
  type: string;
  phoneNumber: string;
  email?: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  contactPersonName?: string;
  contactPersonRole?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  operatingHours?: string[];
  services?: string[];
  coordinates: [number, number]; // [longitude, latitude]
  isActive?: boolean;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicalInstitutionDto {
  name: string;
  registrationNumber: string;
  type: string;
  phoneNumber: string;
  email?: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  contactPersonName?: string;
  contactPersonRole?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  operatingHours?: string[];
  services?: string[];
  coordinates: [number, number]; // [longitude, latitude]
  isActive?: boolean;
}

export interface UpdateMedicalInstitutionDto extends Partial<CreateMedicalInstitutionDto> {}

export interface MedicalInstitutionsResponse {
  results: MedicalInstitution[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface MedicalInstitutionSearchParams {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: string;
  [key: string]: any;
}
