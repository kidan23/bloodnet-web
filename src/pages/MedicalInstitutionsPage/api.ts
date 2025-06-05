import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../state/api";
import type {
  MedicalInstitution,
  MedicalInstitutionsResponse,
  CreateMedicalInstitutionDto,
  UpdateMedicalInstitutionDto,
  MedicalInstitutionSearchParams,
} from "./types";

// Query keys
export const medicalInstitutionKeys = {
  all: ["medicalInstitutions"] as const,
  lists: () => [...medicalInstitutionKeys.all, "list"] as const,
  list: (filters: MedicalInstitutionSearchParams) =>
    [...medicalInstitutionKeys.lists(), filters] as const,
  details: () => [...medicalInstitutionKeys.all, "detail"] as const,
  detail: (id: string) => [...medicalInstitutionKeys.details(), id] as const,
  nearby: (lng: number, lat: number, radius?: number) =>
    [...medicalInstitutionKeys.all, "nearby", lng, lat, radius] as const,
  byUser: (userId: string) =>
    [...medicalInstitutionKeys.all, "user", userId] as const,
  byRegistration: (registrationNumber: string) =>
    [
      ...medicalInstitutionKeys.all,
      "registration",
      registrationNumber,
    ] as const,
};

// Get all medical institutions with filters
export const useMedicalInstitutions = (
  params?: MedicalInstitutionSearchParams
) => {
  return useQuery({
    queryKey: medicalInstitutionKeys.list(params || {}),
    queryFn: async () => {
      const { data } = await api.get<MedicalInstitutionsResponse>(
        "/medical-institutions",
        {
          params,
        }
      );
      return data;
    },
  });
};

// Get a single medical institution
export const useMedicalInstitution = (id: string) => {
  return useQuery({
    queryKey: medicalInstitutionKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<MedicalInstitution>(
        `/medical-institutions/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
};

// Get nearby medical institutions
export const useNearbyMedicalInstitutions = (
  lng: number,
  lat: number,
  radius?: number,
  params?: MedicalInstitutionSearchParams
) => {
  return useQuery({
    queryKey: medicalInstitutionKeys.nearby(lng, lat, radius),
    queryFn: async () => {
      const queryParams = {
        lng,
        lat,
        radius,
        ...params,
      };
      const { data } = await api.get<MedicalInstitutionsResponse>(
        "/medical-institutions/nearby",
        {
          params: queryParams,
        }
      );
      return data;
    },
    enabled: !!(lng && lat),
  });
};

// Get medical institutions by user
export const useMedicalInstitutionsByUser = (userId: string) => {
  return useQuery({
    queryKey: medicalInstitutionKeys.byUser(userId),
    queryFn: async () => {
      const { data } = await api.get<MedicalInstitution[]>(
        `/medical-institutions/user/${userId}`
      );
      return data;
    },
    enabled: !!userId,
  });
};

// Get medical institution by registration number
export const useMedicalInstitutionByRegistration = (
  registrationNumber: string
) => {
  return useQuery({
    queryKey: medicalInstitutionKeys.byRegistration(registrationNumber),
    queryFn: async () => {
      const { data } = await api.get<MedicalInstitution>(
        `/medical-institutions/registration/${registrationNumber}`
      );
      return data;
    },
    enabled: !!registrationNumber,
  });
};

// Create medical institution
export const useCreateMedicalInstitution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newInstitution: CreateMedicalInstitutionDto) => {
      const { data } = await api.post<MedicalInstitution>(
        "/medical-institutions",
        newInstitution
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: medicalInstitutionKeys.lists(),
      });
    },
  });
};

// Update medical institution
export const useUpdateMedicalInstitution = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: UpdateMedicalInstitutionDto) => {
      const { data } = await api.patch<MedicalInstitution>(
        `/medical-institutions/${id}`,
        updateData
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: medicalInstitutionKeys.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: medicalInstitutionKeys.lists(),
      });
    },
  });
};

// Delete medical institution
export const useDeleteMedicalInstitution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/medical-institutions/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: medicalInstitutionKeys.lists(),
      });
    },
  });
};

// Assign user to medical institution
export const assignUserToMedicalInstitution = async (
  institutionId: string,
  user: string
): Promise<MedicalInstitution> => {
  const { data } = await api.patch<MedicalInstitution>(
    `/medical-institutions/${institutionId}`,
    { user }
  );
  return data;
};

// Use assign user to medical institution hook
export const useAssignUserToMedicalInstitution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ institutionId, userId }: { institutionId: string; userId: string }) => {
      return assignUserToMedicalInstitution(institutionId, userId);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: medicalInstitutionKeys.detail(variables.institutionId),
      });
      queryClient.invalidateQueries({
        queryKey: medicalInstitutionKeys.lists(),
      });
    },
  });
};
