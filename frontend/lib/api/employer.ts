import apiClient from "./client"
import type { Job, JobApplication } from "@/lib/types"

interface ApiResponse<T> {
  data: T
  status: string
  message: string
  errors?: Record<string, string[]>
}

export const employerApi = {
  // Jobs
  getJobs: async () => {
    const response = await apiClient.get<ApiResponse<Job[]>>("/job/employer/jobs/")
    return response.data
  },

  getJob: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Job>>(`/job/${id}/`)
    return response.data
  },

  createJob: async (jobData: Partial<Job>) => {
    const response = await apiClient.post<ApiResponse<Job>>("/job/", jobData)
    return response.data
  },

  updateJob: async (id: string, jobData: Partial<Job>) => {
    try {
      const response = await apiClient.put<ApiResponse<Job>>(`/job/employer/jobs/${id}/`, jobData)
      return response.data
    } catch (error: any) {
      console.error("Error updating job:", error)
      throw error
    }
  },

  deleteJob: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/job/${id}/`)
    return response.data
  },

  // Applications
  getApplications: async (filters?: any) => {
    const response = await apiClient.get<ApiResponse<JobApplication[]>>("/applications/", {
      params: filters,
    })
    return response.data
  },

  getApplication: async (id: string) => {
    const response = await apiClient.get<ApiResponse<JobApplication>>(`/applications/${id}/`)
    return response.data
  },

  updateApplicationStatus: async (id: string, status: string) => {
    const response = await apiClient.patch<ApiResponse<{ success: boolean }>>(`/applications/${id}/`, {
      status,
    })
    return response.data
  },

  // Students
  createStudent: async (data: any) => {
    const response = await apiClient.post<ApiResponse<any>>("/students/", data)
    return response.data
  },

  // Company Profile
  getCompanyProfile: async () => {
    const response = await apiClient.get<ApiResponse<any>>("/user/profile/employer/")
    return response.data
  },

  updateCompanyProfile: async (data: any) => {
    const response = await apiClient.patch<ApiResponse<any>>("/user/profile/employer/", data)
    return response.data
  },

  // Analytics
  getAnalytics: async (period?: string) => {
    const response = await apiClient.get<ApiResponse<any>>("/job/employer/", { params: { period } })
    return response.data
  },

  // Interviews
  getInterviews: async (filters?: any) => {
    const response = await apiClient.get<ApiResponse<any>>("/interviews/", { params: filters })
    return response.data
  },

  scheduleInterview: async (applicationId: string, data: any) => {
    const response = await apiClient.post<ApiResponse<any>>(`/applications/${applicationId}/interview/`, data)
    return response.data
  },

  // Settings
  getSettings: async () => {
    const response = await apiClient.get<ApiResponse<any>>("/settings/")
    return response.data
  },

  updateSettings: async (data: any) => {
    const response = await apiClient.put<ApiResponse<any>>("/settings/", data)
    return response.data
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await apiClient.post<ApiResponse<{ success: boolean }>>("/change-password/", data)
    return response.data
  },
} 