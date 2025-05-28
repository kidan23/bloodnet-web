// API functions for blood requests
import api from "../../state/api";
import type {
  BloodRequest,
  CreateBloodRequestDto,
  UpdateBloodRequestDto,
  BloodRequestQueryParams,
  PaginatedResponse,
  RequestStatus,
  NearbySearchParams,
} from "./types";

// Base API endpoint for blood requests
const BLOOD_REQUEST_API = "/blood-requests";

// Fetch all blood requests with optional query parameters
export async function fetchBloodRequests(
  params?: BloodRequestQueryParams
): Promise<PaginatedResponse<BloodRequest>> {
  const { data } = await api.get(BLOOD_REQUEST_API, { params });
  return data;
}

// Get a single blood request by ID
export async function fetchBloodRequestById(id: string): Promise<BloodRequest> {
  const { data } = await api.get(`${BLOOD_REQUEST_API}/${id}`);
  return data;
}

// Create a new blood request
export async function createBloodRequest(
  requestData: CreateBloodRequestDto
): Promise<BloodRequest> {
  const { data } = await api.post(BLOOD_REQUEST_API, requestData);
  return data;
}

// Update a blood request
export async function updateBloodRequest(
  id: string,
  requestData: UpdateBloodRequestDto
): Promise<BloodRequest> {
  const { data } = await api.patch(`${BLOOD_REQUEST_API}/${id}`, requestData);
  return data;
}

// Delete a blood request
export async function deleteBloodRequest(id: string): Promise<void> {
  await api.delete(`${BLOOD_REQUEST_API}/${id}`);
}

// Update blood request status
export async function updateBloodRequestStatus(
  id: string,
  status: RequestStatus
): Promise<BloodRequest> {
  const { data } = await api.patch(`${BLOOD_REQUEST_API}/${id}/status`, {
    status,
  });
  return data;
}

// Find blood requests by institution
export async function findBloodRequestsByInstitution(
  institutionId: string
): Promise<BloodRequest[]> {
  const { data } = await api.get(
    `${BLOOD_REQUEST_API}/institution/${institutionId}`
  );
  return data;
}

// Find blood requests by status
export async function findBloodRequestsByStatus(
  status: RequestStatus
): Promise<BloodRequest[]> {
  const { data } = await api.get(`${BLOOD_REQUEST_API}/status/${status}`);
  return data;
}

// Find blood requests by blood type
export async function findBloodRequestsByBloodType(
  bloodType: string,
  rhFactor: string
): Promise<BloodRequest[]> {
  const { data } = await api.get(
    `${BLOOD_REQUEST_API}/blood-type/${bloodType}/${rhFactor}`
  );
  return data;
}

// Find nearby blood requests
export async function findNearbyBloodRequests(
  params: NearbySearchParams
): Promise<PaginatedResponse<BloodRequest>> {
  const { data } = await api.get(`${BLOOD_REQUEST_API}/nearby`, { params });
  return data;
}

// Find urgent blood requests
export async function findUrgentBloodRequests(): Promise<BloodRequest[]> {
  const { data } = await api.get(`${BLOOD_REQUEST_API}/urgent`);
  return data;
}
