import apiClient from "./client"
import type { JobApplication } from "@/lib/types"

export interface ApplicationFilters {
  status?: string
  page?: number
  page_size?: number
}

export interface ApplicationListResponse {
  count: number
  next: string | null
  previous: string | null
  results: JobApplication[]
}

export const applicationsApi = {
  getApplications: async (filters: ApplicationFilters = {}) => {
    const response = await apiClient.get<ApplicationListResponse>("/applications/", {
      params: filters,
    })
    return response.data
  },

  getApplication: async (id: string) => {
    const response = await apiClient.get<JobApplication>(`/applications/${id}/`)
    return response.data
  },

  updateApplicationStatus: async (id: string, status: string, comments?: string) => {
    const response = await apiClient.patch<JobApplication>(`/applications/${id}/`, {
      status,
      comments,
    })
    return response.data
  },

  // For employers/managers
  getJobApplications: async (jobId: string, filters: ApplicationFilters = {}) => {
    const response = await apiClient.get<ApplicationListResponse>(`/jobs/${jobId}/applications/`, {
      params: filters,
    })
    return response.data
  },
}

