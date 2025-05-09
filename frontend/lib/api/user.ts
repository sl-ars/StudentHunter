import apiClient from "./client"
import type { ApiResponse } from "./client"
import type { User, UserProfile, Education, Experience } from "@/lib/types"
import { USER_ROLES, UserRole } from "@/lib/constants/roles"

interface AuthResponse {
  user: User
  token: string
}

// Interface for the public user profile data
export interface PublicUserProfileData {
  id: string | number;
  full_name: string;
  role: UserRole;
  avatar?: string; // URL to avatar
  location?: string;
  description?: string;
}

export const userApi = {
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; access: string; refresh: string }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ user: User; access: string; refresh: string }>>("/auth/login/", {
        email,
        password,
      })
      
      // If login is successful and tokens are present, store them
      if (response.data && response.data.status === "success" && response.data.data) {
        const { access, refresh } = response.data.data;
        if (typeof access === 'string' && access) {
          localStorage.setItem("access_token", access);
        }
        if (typeof refresh === 'string' && refresh) {
          localStorage.setItem("refresh_token", refresh);
        }
      }
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Login failed",
        data: { user: null as any, access: "", refresh: "" }, // Adjusted to match new type
      }
    }
  },

  logout: async (): Promise<ApiResponse<null>> => {
    try {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")

      return {
        status: "success",
        message: "Logged out successfully",
        data: null,
      }
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Logout failed",
        data: null,
      }
    }
  },

  register: async (userData: any): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>(
        "/auth/register/",
        userData,
      )
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Registration failed",
        data: { success: false, message: error.message },
      }
    }
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ access: string }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ access: string }>>("/auth/token/refresh/", {
        refresh: refreshToken,
      })

      // Corrected access based on ApiResponse structure which typically wraps data
      if (response.data && response.data.data && typeof response.data.data.access === 'string') {
        localStorage.setItem("access_token", response.data.data.access)
      } else if (response.data && typeof (response.data as any).access === 'string') {
        // Fallback if structure is flatter, though less likely given other examples
        localStorage.setItem("access_token", (response.data as any).access);
      }

      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to refresh token",
        data: { access: "" },
      }
    }
  },

  verifyToken: async (token: string): Promise<ApiResponse<{ detail: string }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ detail: string }>>("/auth/token/verify/", {
        token,
      })

      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to verify token",
        data: { detail: "" },
      }
    }
  },

  getMyProfile: async (): Promise<ApiResponse<UserProfile>> => {
      try {
        const response = await apiClient.get<ApiResponse<UserProfile>>("/user/profile/me/")
        return response.data
      } catch (error: any) {
        return {
          status: "error",
          message: error.message || "Failed to get your profile",
          data: null as any,
        }
      }
    },

  getPublicUserProfile: async (userId: string | number): Promise<ApiResponse<PublicUserProfileData>> => {
    try {
      const response = await apiClient.get<ApiResponse<PublicUserProfileData>>(`/user/profile/${userId}/`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to get public user profile",
        data: null as any,
      }
    }
  },

  updateProfile: async (
      data: Partial<UserProfile> & { avatar?: File | string | null }
    ): Promise<ApiResponse<UserProfile>> => {
      try {
        const formData = new FormData();

        Object.keys(data).forEach(key => {
          const typedKey = key as keyof typeof data;
          const value = data[typedKey];
          const stringKey = String(key); // Ensure the key is a string for FormData

          if (typedKey === 'avatar') {
            if (value instanceof File) {
              formData.append(stringKey, value);
            }
            // If avatar is a string (URL) or null, we don't append it for FormData.
          } else if (value !== undefined && value !== null) {
            // Handle non-avatar fields
            if (Array.isArray(value) || 
                (typeof value === 'object' && value !== null && !((value as any) instanceof File)) ) {
              // If value is an object (and not null) and not a File, or if it's an array, stringify it.
              formData.append(stringKey, JSON.stringify(value));
            } else if (!(value instanceof File)) {
              // Primitives (string, number, boolean) should not be Files. Stringify them.
              // This also handles if `value` was somehow a File and didn't meet the condition above.
              formData.append(stringKey, String(value));
            } 
            // If value is a File and made it here (i.e., it wasn't an object or array that got stringified),
            // it means it's a non-avatar File that we are choosing to stringify (becomes "[object File]") or skip.
            // The `else if (!(value instanceof File))` will stringify it if it's not a file.
            // If it *is* a file, it falls through and is currently skipped. This is probably safest for non-avatar files.
          }
        });
        
        // No explicit Content-Type header needed when sending FormData, 
        // the browser/client will set it to multipart/form-data with the correct boundary.
        const response = await apiClient.patch<ApiResponse<UserProfile>>("/user/profile/me/", formData);
        return response.data;
      } catch (error: any) {
        return {
          status: "error",
          message: error.message || "Failed to update profile",
          data: null as any,
        }
      }
    },

  uploadResume: async (file: File): Promise<ApiResponse<{ id: string; url: string }>> => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await apiClient.post<ApiResponse<{ id: string; url: string }>>("/user/resumes/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to upload resume",
        data: { id: "", url: "" },
      }
    }
  },

  getResumes: async (): Promise<ApiResponse<{ id: string; name: string; url: string; created_at: string }[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<{ id: string; name: string; url: string; created_at: string }[]>>("/user/resumes/")
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to get resumes",
        data: [],
      }
    }
  },

  deleteResume: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/user/resumes/${id}/`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to delete resume",
        data: { success: false },
      }
    }
  },

  saveJob: async (jobId: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ success: boolean }>>(`/user/saved-jobs/${jobId}/`, {})
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to save job",
        data: { success: false },
      }
    }
  },

  unsaveJob: async (jobId: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/user/saved-jobs/${jobId}/`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to unsave job",
        data: { success: false },
      }
    }
  },

  getSavedJobs: async (): Promise<ApiResponse<{ jobs: string[] }>> => {
    try {
      const response = await apiClient.get<ApiResponse<{ jobs: string[] }>>("/user/saved-jobs/")
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to get saved jobs",
        data: { jobs: [] },
      }
    }
  },

  followCompany: async (companyId: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
        `/user/followed-companies/${companyId}/`,
        {},
      )
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to follow company",
        data: { success: false },
      }
    }
  },

  unfollowCompany: async (companyId: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
        `/user/followed-companies/${companyId}/`,
      )
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to unfollow company",
        data: { success: false },
      }
    }
  },

  getFollowedCompanies: async (): Promise<ApiResponse<{ companies: string[] }>> => {
    try {
      const response = await apiClient.get<ApiResponse<{ companies: string[] }>>("/user/followed-companies/")
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to get followed companies",
        data: { companies: [] },
      }
    }
  },

  // Education operations
  addEducation: async (role: UserRole, education: Omit<Education, "id">) => {
    const response = await apiClient.post<ApiResponse<UserProfile>>(
      `/api/${role}/profile/education/`,
      education
    )
    return response.data.data
  },

  removeEducation: async (role: UserRole, educationId: string) => {
    const response = await apiClient.delete<ApiResponse<UserProfile>>(
      `/api/${role}/profile/education/${educationId}/`
    )
    return response.data.data
  },

  // Experience operations
  addExperience: async (role: UserRole, experience: Omit<Experience, "id">) => {
    const response = await apiClient.post<ApiResponse<UserProfile>>(
      `/api/${role}/profile/experience/`,
      experience
    )
    return response.data.data
  },

  removeExperience: async (role: UserRole, experienceId: string) => {
    const response = await apiClient.delete<ApiResponse<UserProfile>>(
      `/api/${role}/profile/experience/${experienceId}/`
    )
    return response.data.data
  },
}
