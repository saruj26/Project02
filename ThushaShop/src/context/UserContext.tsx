import React, { createContext, useContext, useState, useEffect } from "react";
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";

// Types
import {
  User,
  UserContextType,
  UserRole,
  FaceShape,
  VisionProblem,
  UserPreferences,
} from "@/types/user";

// Validation
import {
  validateForm,
  loginSchema,
  registerSchema,
} from "@/utils/validation";
import { defaultUser } from "@/services/authService";
import { authClient, apiClient } from '@/lib/api-clients';


// Add to apiClient interceptors
// In your api-clients.ts
apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        
        const response = await authClient.post('/api/core/token/refresh/', {
          refresh: refreshToken
        });
        
        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/account?login=true';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Load user from localStorage on mount
 useEffect(() => {
  const initializeAuth = async () => {
    const accessToken = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');

    if (accessToken && savedUser) {
      try {
        // Verify token is still valid by making a lightweight API call
        await authClient.get('/api/core/verify-token/');
        
        // Set axios default headers
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        // Parse and set user data
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Refresh user data in background
        fetchProfile().catch(() => {
          console.warn("Background profile refresh failed");
        });
      } catch (error) {
        // Token verification failed - clear invalid auth data
        console.error("Token verification failed:", error);
        performCleanup(false); // silent cleanup
      }
    } else {
      // No valid auth data found
      setUser(defaultUser);
      setIsAuthenticated(false);
    }
  };

  initializeAuth();
}, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user && isAuthenticated) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user, isAuthenticated]);

  // Update preferences
  const setUserFaceShape = (faceShape: FaceShape) => {
    if (!user) return;
    setUser({ ...user, faceShape });
  };

  const setUserVisionProblem = (visionProblem: VisionProblem) => {
    if (!user) return;
    setUser({ ...user, visionProblem });
  };

  const updatePreferences = (preferences: Partial<UserPreferences>) => {
    if (!user || !user.preferences) return;
    setUser({
      ...user,
      preferences: { ...user.preferences, ...preferences },
    });
  };

  // Login function

const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await authClient.post("/api/core/login/", { email, password });
    const { access, refresh, user } = response.data;

    // (Optional) Use httpOnly cookies instead of localStorage
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    // Set default auth header for future requests
    authClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;

    setUser(user);
    setIsAuthenticated(true);

    // Handle fetchProfile errors
    try {
      await fetchProfile();
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast({
        title: "Profile Load Failed",
        description: "User data may be incomplete.",
        variant: "destructive",
      });
    }

      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      });

      return user;
    } catch (error: any) {
      const message = error.response?.data?.message ||
                      error.message ||
                      "Login failed";

      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      });

      throw new Error(message);
    }
  };

  // Logout function
const logout = async (showToast = true) => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  try {
    // Only attempt API logout if we have a refresh token
    if (refreshToken) {
      await authClient.post("/api/core/logout/", { 
        refresh: refreshToken 
      }, {
        timeout: 5000 // Add timeout to prevent hanging
      });
    }

    if (showToast) {
      toast({
        title: "Logged Out",
        description: "You have been successfully signed out",
      });
    }

  } catch (error: any) {
    console.error("Logout API error:", error);
    
    if (showToast) {
      toast({
        title: "Session Ended",
        description: "Your session has been cleared",
        variant: "default",
      });
    }
    
  } finally {
    await performCleanup();
  }
};

const performCleanup = async (showToast = true) => {
  // Clear all authentication data
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  // Clear any application-specific storage
  sessionStorage.clear();
  
  // Reset React state
  setUser(null);
  setIsAuthenticated(false);
  
  // Clear axios cache if needed
  apiClient.interceptors.request.clear();
  if (showToast) {
    toast({
      title: "Logged Out",
      description: "You have been successfully signed out",
    });
  }
  // Redirect with full page reload to ensure complete cleanup
  window.location.assign('/account?login=true'); // Use assign() instead of href
};
  // Register function
  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    const validation = validateForm(registerSchema, {
      name,
      email,
      password,
      confirmPassword: password,
      role,
    });

    if (!validation.success) {
      const errorMessage = validation.errors?.errors[0]?.message || "Invalid registration data";
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw new Error(errorMessage);
    }

    try {
      const response = await authClient.post("/api/core/register/", {
        name,
        email,
        password,
        confirm_password: password,
        role,
      });

      const result = response.data;

      toast({
        title: "Verification Code Sent",
        description: `We've sent a 6-digit code to ${email}`,
      });

    } catch (error: any) {
      const message = error.response?.data?.message ||
                      error.message ||
                      "Registration failed";

      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });

      throw new Error(message);
    }
  };

  // OTP Verification
  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
  try {
    const response = await authClient.post("/api/core/verify-otp/", { email, otp });
    const { access, refresh, user } = response.data; // Ensure backend returns tokens

    // Store tokens and update state
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    setUser(user);
    setIsAuthenticated(true);

    // Create profile if doesn't exist
    await createInitialProfile();

    toast({ title: "Email Verified!", description: "Account created successfully." });
    return true;
  } catch (error) {
    // Error handling
    return false;
  }
};

const createInitialProfile = async () => {
  try {
    await apiClient.post("/api/core/profile/", {
      phone_number: "",
      address_line1: "",
      address_line2: '',
      city: '',
      state: '',
      zip_code: '',
      country: ''
    });
  } catch (error) {
    console.error("Profile creation failed:", error);
  }
};
  // Resend OTP
  const resendOTP = async (email: string): Promise<void> => {
    try {
      await authClient.post("/api/core/resend-otp/", { email });

      toast({
        title: "OTP Resent",
        description: `A new verification code has been sent to ${email}`,
      });
    } catch (error: any) {
      const message = error.response?.data?.message ||
                      error.message ||
                      "Could not resend OTP.";

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });

      throw new Error(message);
    }
  };

   // Fetch Profile Data
  const fetchProfile = async () => {
    try {
      const response = await apiClient.get("/api/core/profile/");
      const profileData = response.data;

      setUser(prev => ({
        ...prev,
        name: profileData.name || prev?.name,
        profile: {
          ...prev?.profile,
          phone_number: profileData.phone_number,
          address_line1: profileData.address_line1,
          address_line2: profileData.address_line2,
          city: profileData.city,
          state: profileData.state,
          zip_code: profileData.zip_code,
          country: profileData.country
        }
      }));
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  // Update Profile
  const updateProfile = async (profileData: {
    name?: string;
    profile?: {
      phone_number?: string;
      address_line1?: string;
      address_line2?: string;
      city?: string;
      state?: string;
      zip_code?: string;
      country?: string;
    };
  }): Promise<void> => {
    if (!profileData || (!profileData.name && !profileData.profile)) {
      throw new Error("No data provided to update");
    }

    try {
      // Flatten nested data
      const payload = {
        name: profileData.name,
        ...(profileData.profile || {})
      };

      const response = await apiClient.patch("/api/core/profile/", payload);

      const updatedUser = response.data;

      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          name: updatedUser.name || prev.name,
          profile: {
            ...prev.profile,
            phone_number: updatedUser.phone_number,
            address_line1: updatedUser.address_line1,
            address_line2: updatedUser.address_line2,
            city: updatedUser.city,
            state: updatedUser.state,
            zip_code: updatedUser.zip_code,
            country: updatedUser.country
          }
        };
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

    } catch (error: any) {
      const message = error.response?.data?.message ||
                      error.message ||
                      "Failed to update profile.";

      toast({
        title: "Update Failed",
        description: message,
        variant: "destructive",
      });

      throw new Error(message);
    }
  };

  // Change Password
  const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await apiClient.post("/api/core/change-password/", {
        currentPassword,
        newPassword,
      });

      toast({
        title: "Password Changed",
        description: "Your password has been successfully changed.",
      });
    } catch (error: any) {
      const message = error.response?.data?.message ||
                      error.message ||
                      "Password change failed.";

      toast({
        title: "Change Failed",
        description: message,
        variant: "destructive",
      });

      throw new Error(message);
    }
  };

  // Role check
  const hasRole = (requiredRoles: UserRole | UserRole[]): boolean => {
    if (!user || !isAuthenticated) return false;
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    return user.role === requiredRoles;
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUserFaceShape,
        setUserVisionProblem,
        updatePreferences,
        login,
        logout,
        register,
        isAuthenticated,
        isLoggedIn: isAuthenticated,
        validateForm,
        updateProfile,
        fetchProfile,
        updatePassword,
        hasRole,
        verifyOTP,
        resendOTP,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

function logout() {
  throw new Error("Function not implemented.");
}
