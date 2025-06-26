
import { apiClient } from "@/lib/api-clients";
import { User } from "@/types/user";

export interface ManufacturerProfile {
  id: number;
  user: User;
  phone_number: string | null;
  address: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
}

const endpoint = "/api/manufacturer/profile/";

export const fetchManufacturerProfile = async (): Promise<ManufacturerProfile> => {
  const res = await apiClient.get(endpoint);
  return res.data;
};

export const updateManufacturerProfile = async (profileData: FormData): Promise<ManufacturerProfile> => {
  const res = await apiClient.put(endpoint, profileData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
};
