import apiClient from "./client"
import type { UserProfile } from "@/lib/types"

export const usersApi = {
  getProfile: async () => {
    const response = await apiClient.get<UserProfile>("/users/profile/")
    return response.data
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const response = await apiClient.patch<UserProfile>("/users/profile/", data)
    return response.data
  },

  uploadResume: async (file: File) => {
    const formData = new FormData()
    formData.append("resume", file)

    const response = await apiClient.post<{ url: string }>("/users/resume/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  },

  saveJob: async (jobId: string) => {
    const response = await apiClient.post<{ success: boolean }>(`/users/saved-jobs/${jobId}/`)
    return response.data
  },

  unsaveJob: async (jobId: string) => {
    const response = await apiClient.delete<{ success: boolean }>(`/users/saved-jobs/${jobId}/`)
    return response.data
  },

  getSavedJobs: async () => {
    const response = await apiClient.get<{ jobs: any[] }>("/users/saved-jobs/")
    return response.data
  },

  followCompany: async (companyId: string) => {
    const response = await apiClient.post<{ success: boolean }>(`/users/followed-companies/${companyId}/`)
    return response.data
  },

  unfollowCompany: async (companyId: string) => {
    const response = await apiClient.delete<{ success: boolean }>(`/users/followed-companies/${companyId}/`)
    return response.data
  },

  getFollowedCompanies: async () => {
    const response = await apiClient.get<{ companies: any[] }>("/users/followed-companies/")
    return response.data
  },

  getApplications: async () => {
    const response = await apiClient.get<{ applications: any[] }>("/users/applications/")
    return response.data
  },
}

