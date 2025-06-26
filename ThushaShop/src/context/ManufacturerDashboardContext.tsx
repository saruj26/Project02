// context/ManufacturerDashboardContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  fetchManufacturerProfile, 
  updateManufacturerProfile,
  ManufacturerProfile 
} from "@/api/manufacturer";
import { useUser } from './UserContext';

interface ManufacturerDashboardContextType {
  manufacturerProfile: ManufacturerProfile | null;
  fetchManufacturerProfile: () => Promise<void>;
  updateManufacturerProfile: (formData: FormData) => Promise<void>;
}

const ManufacturerDashboardContext = createContext<ManufacturerDashboardContextType>({
  manufacturerProfile: null,
  fetchManufacturerProfile: async () => {},
  updateManufacturerProfile: async () => {},
});

export const ManufacturerDashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const [manufacturerProfile, setManufacturerProfile] = useState<ManufacturerProfile | null>(null);
  const { user } = useUser();

  const fetchProfile = async () => {
    try {
      const profile = await fetchManufacturerProfile();
      setManufacturerProfile(profile);
    } catch (error) {
      console.error("Failed to fetch manufacturer profile:", error);
    }
  };
  
  const updateProfile = async (profileData: FormData) => {
    try {
      const updatedProfile = await updateManufacturerProfile(profileData);
      setManufacturerProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };
  
  useEffect(() => {
    if (user?.role === 'manufacturer') {
      fetchProfile();
    }
  }, [user]);

  return (
    <ManufacturerDashboardContext.Provider
      value={{
        manufacturerProfile,
        updateManufacturerProfile: updateProfile,
      }}
    >
      {children}
    </ManufacturerDashboardContext.Provider>
  );
};

export const useManufacturerDashboard = () => useContext(ManufacturerDashboardContext);