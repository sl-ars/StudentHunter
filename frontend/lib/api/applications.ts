import apiClient from "./client"
import type { ApiResponse } from "./client"
import type { JobApplication } from "../types"
import { mockApplications } from "../mock-data/applications"
import { isMockEnabled } from "../utils/config"

export interface ApplicationFilters {
  status?: string
  job_id?: string
  company_id?: string
  search?: string
  page?: number
  page_size?: number
  sort_by?: string
  sort_order?: string
}

// Define the application API
export const applicationApi = {
  // Get all applications (for employers/admins)
  getApplications: async (filters: ApplicationFilters = {}): Promise<ApiResponse<JobApplication[]>> => {
    if (isMockEnabled()) {
      // Mock implementation
      return {
        status: "success",
        data: mockApplications,
        message: "Applications retrieved successfully",
      }
    }

    // Real API implementation
    const response = await apiClient.get<ApiResponse<JobApplication[]>>("/applications/", { params: filters })
    return response.data
  },

  // Get applications for the current user (for students)
  getMyApplications: async (filters: ApplicationFilters = {}): Promise<ApiResponse<JobApplication[]>> => {
    if (isMockEnabled()) {
      // Mock implementation
      return {
        count: mockApplications.length,
        next: null,
        previous: null,
        results: mockApplications,
      }
    }

    // Real API implementation
    const response = await apiClient.get<ApiResponse<JobApplication[]>>("/applications/me", { params: filters })
    return response.data
  },

  // Get a specific application
  getApplication: async (id: string) => {
    if (isMockEnabled()) {
      // Mock implementation
      const application = mockApplications.find((app) => app.id === id)
      if (application) {
        return {
          status: "success",
          data: application,
          message: "Application retrieved successfully",
        }
      }
      return {
        status: "error",
        message: "Application not found",
        data: null,
      }
    }

    // Real API implementation
    const response = await apiClient.get<ApiResponse<JobApplication>>(`/applications/${id}`)
    return response.data
  },

  // Update application status
  updateApplicationStatus: async (
    applicationId: string,
    status: string,
    comments?: string,
  ): Promise<ApiResponse<JobApplication>> => {
    if (isMockEnabled()) {
      // Mock implementation
      const applicationIndex = mockApplications.findIndex((app) => app.id === applicationId)
      if (applicationIndex !== -1) {
        const updatedApplication = {
          ...mockApplications[applicationIndex],
          status,
          comments: comments || mockApplications[applicationIndex].comments,
          updatedAt: new Date().toISOString(),
        }

        // In a real implementation, we would update the mock data
        // For now, just return the updated application
        return {
          status: "success",
          data: updatedApplication,
          message: "Application status updated successfully",
        }
      }
      return {
        status: "error",
        message: "Application not found",
        data: null,
      }
    }

    // Real API implementation
    const response = await apiClient.patch<ApiResponse<JobApplication>>(`/applications/${applicationId}/status`, {
      status,
      comments,
    })
    return response.data
  },

  // Apply for a job
  applyForJob: async (jobId: string, data: any): Promise<ApiResponse<JobApplication>> => {
    if (isMockEnabled()) {
      // Mock implementation
      const newApplication = {
        id: `app-${Date.now()}`,
        jobId,
        status: "pending",
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return {
        status: "success",
        data: newApplication,
        message: "Application submitted successfully",
      }
    }

    // Real API implementation
    const response = await apiClient.post<ApiResponse<JobApplication>>(`/applications/apply`, {
      job_id: jobId,
      ...data,
    })
    return response.data
  },

  // Quick apply for a job
  quickApply: async (jobId: string): Promise<ApiResponse<JobApplication>> => {
    if (isMockEnabled()) {
      // Mock implementation
      const newApplication = {
        id: `app-${Date.now()}`,
        jobId,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return {
        status: "success",
        data: newApplication,
        message: "Application submitted successfully",
      }
    }

    // Real API implementation
    const response = await apiClient.post<ApiResponse<JobApplication>>(`/applications/quick-apply`, {
      job_id: jobId,
    })
    return response.data
  },
}
