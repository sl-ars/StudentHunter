import apiClient from "./client"
import type { ApiResponse } from "./client"
import type { User, UserProfile } from "@/lib/types"

interface AuthResponse {
  user: User
}

export const userApi = {
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ user: User; token: string }>>("/auth/token/", {
        email,
        password,
      })
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Login failed",
        data: { user: null as any, token: "" },
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

      localStorage.setItem("access_token", response.data.access)

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

  getMe: async (): Promise<ApiResponse<AuthResponse["user"]>> => {
    try {
      const response = await apiClient.get<ApiResponse<AuthResponse["user"]>>("/auth/me/")
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to get user profile",
        data: null as any,
      }
    }
  },

  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    try {
      const response = await apiClient.get<ApiResponse<UserProfile>>("/user/profile/")
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to get profile",
        data: null as any,
      }
    }
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> => {
    try {
      const response = await apiClient.put<ApiResponse<UserProfile>>("/user/profile/", data)
      return response.data
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
      formData.append("resume", file)

      const response = await apiClient.post<ApiResponse<{ id: string; url: string }>>("/user/resume", formData, {
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
      const response =
        await apiClient.get<ApiResponse<{ id: string; name: string; url: string; created_at: string }[]>>(
          "/user/resumes",
        )
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
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/user/resume/${id}`)
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
}
