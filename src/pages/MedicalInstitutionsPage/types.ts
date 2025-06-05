export enum ApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

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
  location: {
    type: "Point";
    coordinates: [number, number];
  };  coordinates: [number, number]; // [longitude, latitude]
  isActive: boolean;
  user?: string | {
    _id: string;
    email: string;
    role: string;
    createdAt: string;
  };
  approvalStatus?: ApprovalStatus;
  rejectionReason?: string;
  appliedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
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
  services?: string[];  coordinates: [number, number]; // [longitude, latitude]
  isActive: boolean;
}

export interface UpdateMedicalInstitutionDto
  extends Partial<CreateMedicalInstitutionDto> {
  user?: string;
}

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

export interface MedicalInstitutionApplicationDto
  extends CreateMedicalInstitutionDto {
  userEmail: string;
  userPassword: string;
}
