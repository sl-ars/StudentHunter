import apiClient from "./client"
import type { ApiResponse } from "./client"
import type { Job } from "@/lib/types"
import { isMockEnabled } from "@/lib/utils/config"

// Combine all interfaces from both files
export interface JobFilters {
  keyword?: string
  location?: string
  type?: string
  industry?: string
  experience?: string
  salary_min?: number
  salary_max?: number
  page?: number
  page_size?: number
  sortBy?: string
}

export interface JobsResponse {
  jobs: Job[]
  totalCount: number
  currentPage: number
  totalPages: number
}

export interface JobApplicationData {
  resumeId?: string
  newResume?: File
  answers: Record<string, string | string[]>
}

// Get jobs with optional filters
export const getJobs = async (
  filters: JobFilters = {},
  isAuthenticated = false,
): Promise<ApiResponse<JobsResponse>> => {
  try {
    // Build query parameters
    const params = new URLSearchParams()
    if (filters.keyword) params.append("keyword", filters.keyword)
    if (filters.location) params.append("location", filters.location)
    if (filters.type) params.append("type", filters.type)
    if (filters.page) params.append("page", filters.page.toString())
    if (filters.sortBy) params.append("sortBy", filters.sortBy)

    // Add authentication status for API to know what data to return
    params.append("authenticated", isAuthenticated ? "true" : "false")

    const response = await apiClient.get<ApiResponse<JobsResponse>>(`/jobs/?${params.toString()}`)
    return response.data
  } catch (error: any) {
    console.error("Error fetching jobs:", error)

    // Fallback to mock data if API call fails or if mock is enabled
    if (isMockEnabled()) {
      const { mockJobs } = await import("@/lib/mock-data/jobs")
      // Create a paginated response from mock data
      const page = filters.page || 1
      const pageSize = 10
      const filteredJobs = mockJobs
        .filter((job) => {
          if (
            filters.keyword &&
            !job.title.toLowerCase().includes(filters.keyword.toLowerCase()) &&
            !job.company.toLowerCase().includes(filters.keyword.toLowerCase())
          ) {
            return false
          }
          if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
            return false
          }
          if (filters.type && filters.type !== "all" && job.type !== filters.type) {
            return false
          }
          return true
        })
        .sort((a, b) => {
          if (filters.sortBy === "date") {
            return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
          }
          if (filters.sortBy === "salary") {
            // Simple salary comparison (in a real app, would parse salary ranges)
            return b.salary.localeCompare(a.salary)
          }
          // Default: relevance (no specific sorting)
          return 0
        })

      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedJobs = filteredJobs.slice(startIndex, endIndex)

      return {
        status: "success",
        message: "Jobs retrieved successfully",
        data: {
          jobs: paginatedJobs,
          totalCount: filteredJobs.length,
          currentPage: page,
          totalPages: Math.ceil(filteredJobs.length / pageSize),
        },
      }
    }

    return {
      status: "error",
      message: error.message || "Failed to retrieve jobs",
      data: {
        jobs: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
      },
    }
  }
}

// Get job by ID
export const getJobById = async (id: string): Promise<Job | null> => {
  try {
    const response = await apiClient.get<ApiResponse<Job>>(`/jobs/${id}/`)
    return response.data.data
  } catch (error: any) {
    console.error(`Error fetching job with ID ${id}:`, error)

    // Fallback to mock data if API call fails or if mock is enabled
    if (isMockEnabled()) {
      const { mockJobs } = await import("@/lib/mock-data/jobs")
      const job = mockJobs.find((job) => job.id === id)
      return job || null
    }

    return null
  }
}

// Get similar jobs
export const getSimilarJobs = async (jobId: string): Promise<Job[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Job[]>>(`/jobs/${jobId}/similar/`)
    return response.data.data
  } catch (error: any) {
    console.error(`Error fetching similar jobs for job ID ${jobId}:`, error)

    // Fallback to mock data if API call fails or if mock is enabled
    if (isMockEnabled()) {
      const { mockJobs } = await import("@/lib/mock-data/jobs")
      const currentJob = mockJobs.find((job) => job.id === jobId)
      if (!currentJob) return []

      // Find jobs with similar title or company
      const similarJobs = mockJobs
        .filter(
          (job) =>
            job.id !== jobId &&
            (job.title.includes(currentJob.title.split(" ")[0]) || job.company === currentJob.company),
        )
        .slice(0, 3)

      return similarJobs
    }

    return []
  }
}

// Save a job
export const saveJob = async (jobId: string): Promise<ApiResponse<void>> => {
  try {
    await apiClient.post<ApiResponse<void>>(`/jobs/${jobId}/save/`)
    return {
      status: "success",
      message: "Job saved successfully",
      data: undefined,
    }
  } catch (error: any) {
    console.error(`Error saving job with ID ${jobId}:`, error)

    // If mock is enabled, just return success
    if (isMockEnabled()) {
      return {
        status: "success",
        message: "Job saved successfully (mocked)",
        data: undefined,
      }
    }

    return {
      status: "error",
      message: error.message || "Failed to save job",
      data: undefined,
    }
  }
}

// Unsave a job
export const unsaveJob = async (jobId: string): Promise<ApiResponse<void>> => {
  try {
    await apiClient.delete<ApiResponse<void>>(`/jobs/${jobId}/save/`)
    return {
      status: "success",
      message: "Job unsaved successfully",
      data: undefined,
    }
  } catch (error: any) {
    console.error(`Error unsaving job with ID ${jobId}:`, error)

    // If mock is enabled, just return success
    if (isMockEnabled()) {
      return {
        status: "success",
        message: "Job unsaved successfully (mocked)",
        data: undefined,
      }
    }

    return {
      status: "error",
      message: error.message || "Failed to unsave job",
      data: undefined,
    }
  }
}

// Add this method if it doesn't exist or fix it if it does
export const getAll = async (filters: any) => {
  try {
    const response = await apiClient.get("/jobs", { params: filters })
    return response
  } catch (error) {
    console.error("Error fetching jobs:", error)
    throw error
  }
}

// Unified jobApi object combining all methods from both files
export const jobApi = {
  getAll,
  getJobs,
  getJob: async (id: string): Promise<ApiResponse<Job>> => {
    try {
      const response = await apiClient.get<ApiResponse<Job>>(`/jobs/${id}/`)
      return response.data
    } catch (error: any) {
      // Fallback to mock data if API call fails or if mock is enabled
      if (isMockEnabled()) {
        const { mockJobs } = await import("@/lib/mock-data/jobs")
        const job = mockJobs.find((job) => job.id === id)
        return {
          status: "success",
          message: job ? "Job found" : "Job not found",
          data: job as Job,
        }
      }

      return {
        status: "error",
        message: error.message || "Failed to retrieve job",
        data: null as any,
      }
    }
  },

  checkApplicationStatus: async (jobId: string, userId: string): Promise<ApiResponse<{ hasApplied: boolean }>> => {
    try {
      const response = await apiClient.get<ApiResponse<{ hasApplied: boolean }>>(
        `/jobs/${jobId}/application-status/${userId}/`,
      )
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to check application status",
        data: { hasApplied: false },
      }
    }
  },

  applyForJob: async (jobId: string, userId: string, applicationData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(`/jobs/${jobId}/apply/`, { userId, ...applicationData })
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to apply for job",
        data: null,
      }
    }
  },

  createJob: async (data: Partial<Job>): Promise<ApiResponse<Job>> => {
    try {
      const response = await apiClient.post<ApiResponse<Job>>("/jobs/", data)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to create job",
        data: null as any,
      }
    }
  },

  updateJob: async (id: string, data: Partial<Job>): Promise<ApiResponse<Job>> => {
    try {
      const response = await apiClient.patch<ApiResponse<Job>>(`/jobs/${id}/`, data)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to update job",
        data: null as any,
      }
    }
  },

  deleteJob: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/jobs/${id}/`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to delete job",
        data: { success: false },
      }
    }
  },

  // Application questions
  getApplicationQuestions: async (jobId: string): Promise<ApiResponse<any[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>(`/jobs/${jobId}/questions/`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to retrieve application questions",
        data: [],
      }
    }
  },

  updateApplicationQuestions: async (jobId: string, questions: any[]): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.put<ApiResponse<{ success: boolean }>>(`/jobs/${jobId}/questions/`, {
        questions,
      })
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to update application questions",
        data: { success: false },
      }
    }
  },

  // Job applications
  applyToJob: async (
    id: string,
    data: JobApplicationData,
  ): Promise<ApiResponse<{ success: boolean; application_id: string }>> => {
    // If there's a new resume, we need to use FormData
    try {
      if (data.newResume) {
        const formData = new FormData()
        formData.append("resume", data.newResume)

        if (data.answers) {
          formData.append("answers", JSON.stringify(data.answers))
        }

        const response = await apiClient.post<ApiResponse<{ success: boolean; application_id: string }>>(
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
      const response = await apiClient.post<ApiResponse<{ success: boolean; application_id: string }>>(
        `/jobs/${id}/apply/`,
        {
          resume_id: data.resumeId,
          answers: data.answers,
        },
      )

      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to apply to job",
        data: { success: false, application_id: "" },
      }
    }
  },

  getApplications: async (jobId: string): Promise<ApiResponse<any[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>(`/jobs/${jobId}/applications/`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to retrieve applications",
        data: [],
      }
    }
  },

  getApplication: async (jobId: string, applicationId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`/jobs/${jobId}/applications/${applicationId}/`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to retrieve application",
        data: null,
      }
    }
  },

  updateApplicationStatus: async (
    jobId: string,
    applicationId: string,
    status: string,
    comments?: string,
  ): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.patch<ApiResponse<{ success: boolean }>>(
        `/jobs/${jobId}/applications/${applicationId}/`,
        {
          status,
          comments,
        },
      )
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to update application status",
        data: { success: false },
      }
    }
  },

  // Recommendations and matches
  getRecommendedJobs: async (): Promise<ApiResponse<Job[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<Job[]>>("/jobs/recommended/")
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to retrieve recommended jobs",
        data: [],
      }
    }
  },

  getJobMatches: async (): Promise<ApiResponse<{ jobs: Job[]; matches: { jobId: string; score: number }[] }>> => {
    try {
      const response =
        await apiClient.get<ApiResponse<{ jobs: Job[]; matches: { jobId: string; score: number }[] }>>("/jobs/matches/")
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to retrieve job matches",
        data: { jobs: [], matches: [] },
      }
    }
  },

  // Get saved jobs for the current user
  getSavedJobs: async (): Promise<ApiResponse<{ jobs: string[] }>> => {
    try {
      const response = await apiClient.get<ApiResponse<{ jobs: string[] }>>("/users/saved-jobs/")
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to retrieve saved jobs",
        data: { jobs: [] },
      }
    }
  },
}
