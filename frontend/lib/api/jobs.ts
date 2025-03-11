import apiClient from "./client"
import type { Job } from "@/lib/types"

export interface JobFilters {
  search?: string
  location?: string
  type?: string
  industry?: string
  experience?: string
  salary_min?: number
  salary_max?: number
  page?: number
  page_size?: number
}

export interface JobListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Job[]
}

export interface JobApplicationData {
  resumeId?: string
  newResume?: File
  answers: Record<string, string | string[]>
}

export const jobsApi = {
  getJobs: async (filters: JobFilters = {}) => {
    const response = await apiClient.get<JobListResponse>("/jobs/", {
      params: filters,
    })
    return response.data
  },

  getJob: async (id: string) => {
    const response = await apiClient.get<Job>(`/jobs/${id}/`)
    return response.data
  },

  createJob: async (data: Partial<Job>) => {
    const response = await apiClient.post<Job>("/jobs/", data)
    return response.data
  },

  updateJob: async (id: string, data: Partial<Job>) => {
    const response = await apiClient.patch<Job>(`/jobs/${id}/`, data)
    return response.data
  },

  deleteJob: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean }>(`/jobs/${id}/`)
    return response.data
  },

  applyToJob: async (id: string, data: JobApplicationData) => {
    // If there's a new resume, we need to use FormData
    if (data.newResume) {
      const formData = new FormData()
      formData.append("resume", data.newResume)

      if (data.answers) {
        formData.append("answers", JSON.stringify(data.answers))
      }

      const response = await apiClient.post<{ success: boolean; application_id: string }>(
        `/jobs/${id}/apply/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      )

      return response.data
    }

    // Otherwise, use JSON
    const response = await apiClient.post<{ success: boolean; application_id: string }>(`/jobs/${id}/apply/`, {
      resume_id: data.resumeId,
      answers: data.answers,
    })

    return response.data
  },

  getRecommendedJobs: async () => {
    const response = await apiClient.get<Job[]>("/jobs/recommended/")
    return response.data
  },

  getJobMatches: async () => {
    const response = await apiClient.get<{ jobs: Job[]; matches: { jobId: string; score: number }[] }>("/jobs/matches/")
    return response.data
  },
}

