import apiClient from "./client"
import type { ApiResponse } from "./client"
import { isMockEnabled } from "@/lib/utils/config"

export interface AdminSettings {
  siteName: string
  supportEmail: string
  maintenanceMode: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  twoFactorAuth: boolean
  passwordExpiry: boolean
  smtpServer: string
  smtpPort: string
}

export interface UserCreateData {
  name: string
  email: string
  password: string
  role: string
  university?: string
  company?: string
  sendWelcomeEmail?: boolean
  activateImmediately?: boolean
}

export interface BulkImportResult {
  success: number
  failed: number
  errors?: Array<{
    email: string
    error: string
  }>
}

export const adminApi = {
  // User management
  getUsers: async (): Promise<ApiResponse<any[]>> => {
    if (isMockEnabled()) {
      // Return mock data
      const { mockAdminUsers } = await import("@/lib/mock-data/admin")
      return {
        status: "success",
        message: "Users retrieved successfully",
        data: mockAdminUsers,
      }
    }

    const response = await apiClient.get<ApiResponse<any[]>>("/admin/users/")
    return response.data
  },

  getUser: async (id: string): Promise<ApiResponse<any>> => {
    if (isMockEnabled()) {
      // Return mock data
      const { mockAdminUsers } = await import("@/lib/mock-data/admin")
      const user = mockAdminUsers.find((user) => user.id === id)
      return {
        status: "success",
        message: "User retrieved successfully",
        data: user,
      }
    }

    const response = await apiClient.get<ApiResponse<any>>(`/admin/users/${id}/`)
    return response.data
  },

  createUser: async (data: UserCreateData): Promise<ApiResponse<any>> => {
    if (isMockEnabled()) {
      // Return mock data with a delay to simulate network request
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            status: "success",
            message: "User created successfully",
            data: {
              id: `user-${Math.random().toString(36).substr(2, 9)}`,
              ...data,
              createdAt: new Date().toISOString(),
            },
          })
        }, 1000)
      })
    }

    const response = await apiClient.post<ApiResponse<any>>("/admin/users/", data)
    return response.data
  },

  bulkCreateUsers: async (users: UserCreateData[]): Promise<ApiResponse<BulkImportResult>> => {
    if (isMockEnabled()) {
      // Simulate processing with random success/failure
      return new Promise((resolve) => {
        setTimeout(() => {
          const errors: Array<{ email: string; error: string }> = []
          let successCount = 0
          let failedCount = 0

          users.forEach((user) => {
            // Simulate some random failures (about 10%)
            if (Math.random() > 0.9) {
              failedCount++
              errors.push({
                email: user.email,
                error: "Email already exists",
              })
            } else {
              successCount++
            }
          })

          resolve({
            status: "success",
            message: `Created ${successCount} users successfully. ${failedCount} failed.`,
            data: {
              success: successCount,
              failed: failedCount,
              errors: errors.length > 0 ? errors : undefined,
            },
          })
        }, 2000) // Longer delay for bulk operations
      })
    }

    const response = await apiClient.post<ApiResponse<BulkImportResult>>("/admin/users/bulk/", { users })
    return response.data
  },

  updateUser: async (id: string, data: any): Promise<ApiResponse<any>> => {
    if (isMockEnabled()) {
      // Return mock data
      return {
        status: "success",
        message: "User updated successfully",
        data: { id, ...data },
      }
    }

    const response = await apiClient.put<ApiResponse<any>>(`/admin/users/${id}/`, data)
    return response
  },

  deleteUser: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    if (isMockEnabled()) {
      // Return mock data
      return {
        status: "success",
        message: "User deleted successfully",
        data: { success: true },
      }
    }

    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/admin/users/${id}/`)
    return response
  },

  // User management (moved from users.ts)
  getAllUsers: async (): Promise<ApiResponse<any[]>> => {
    if (isMockEnabled()) {
      // Return mock data
      const { mockAdminUsers } = await import("@/lib/mock-data/admin")
      return {
        status: "success",
        message: "Users retrieved successfully",
        data: mockAdminUsers,
      }
    }

    const response = await apiClient.get<ApiResponse<any[]>>("/admin/users/")
    return response.data
  },

  getUserDetails: async (id: string): Promise<ApiResponse<any>> => {
    if (isMockEnabled()) {
      // Return mock data
      const { mockAdminUsers } = await import("@/lib/mock-data/admin")
      const user = mockAdminUsers.find((user) => user.id === id)
      return {
        status: "success",
        message: "User retrieved successfully",
        data: user,
      }
    }

    const response = await apiClient.get<ApiResponse<any>>(`/admin/users/${id}/`)
    return response.data
  },

  // Job management
  getJobs: async (): Promise<ApiResponse<any[]>> => {
    if (isMockEnabled()) {
      // Return mock data
      const { mockAdminJobs } = await import("@/lib/mock-data/admin")
      return {
        status: "success",
        message: "Jobs retrieved successfully",
        data: mockAdminJobs,
      }
    }

    const response = await apiClient.get<ApiResponse<any[]>>("/admin/jobs/")
    return {
      status: "success",
      message: "Jobs retrieved successfully",
      data: response.data.data,
    }
  },

  getJob: async (id: string): Promise<ApiResponse<any>> => {
    if (isMockEnabled()) {
      // Return mock data
      const { mockAdminJobs } = await import("@/lib/mock-data/admin")
      const job = mockAdminJobs.find((job) => job.id === id) || {}
      return {
        status: "success",
        message: "Job retrieved successfully",
        data: job,
      }
    }

    const response = await apiClient.get<ApiResponse<any>>(`/admin/jobs/${id}/`)
    return response.data
  },

  createJob: async (data: any): Promise<ApiResponse<any>> => {
    if (isMockEnabled()) {
      // Return mock data
      return {
        status: "success",
        message: "Job created successfully",
        data: { id: "new-id", ...data },
      }
    }

    const response = await apiClient.post<ApiResponse<any>>("/admin/jobs/", data)
    return response.data
  },

  update: async (id: string, data: any): Promise<ApiResponse<any>> => {
    if (isMockEnabled()) {
      // Return mock data
      return {
        status: "success",
        message: "Job updated successfully",
        data: { id, ...data },
      }
    }

    const response = await apiClient.put<ApiResponse<any>>(`/admin/jobs/${id}/`, data)
    return response
  },

  deleteJob: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    if (isMockEnabled()) {
      // Return mock data
      return {
        status: "success",
        message: "Job deleted successfully",
        data: { success: true },
      }
    }

    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/admin/jobs/${id}/`)
    return response
  },

  // Company management
  getCompanies: async (): Promise<ApiResponse<any[]>> => {
    if (isMockEnabled()) {
      // Return mock data
      const { mockAdminCompanies } = await import("@/lib/mock-data/admin")
      return {
        status: "success",
        message: "Companies retrieved successfully",
        data: mockAdminCompanies,
      }
    }

    const response = await apiClient.get<ApiResponse<any[]>>("/admin/companies/")
    return {
      status: "success",
      message: "Companies retrieved successfully",
      data: response.data.data,
    }
  },

  getCompany: async (id: string): Promise<ApiResponse<any>> => {
    if (isMockEnabled()) {
      // Return mock data
      const { mockAdminCompanies } = await import("@/lib/mock-data/admin")
      const company = mockAdminCompanies.find((company) => company.id === id) || {}
      return {
        status: "success",
        message: "Company retrieved successfully",
        data: company,
      }
    }

    const response = await apiClient.get<ApiResponse<any>>(`/admin/companies/${id}/`)
    return response.data
  },

  createCompany: async (data: any): Promise<ApiResponse<any>> => {
    if (isMockEnabled()) {
      // Return mock data
      return {
        status: "success",
        message: "Company created successfully",
        data: { id: "new-id", ...data },
      }
    }

    const response = await apiClient.post<ApiResponse<any>>("/admin/companies/", data)
    return response.data
  },

  updateCompany: async (id: string, data: any): Promise<ApiResponse<any>> => {
    if (isMockEnabled()) {
      // Return mock data
      return {
        status: "success",
        message: "Company updated successfully",
        data: { id, ...data },
      }
    }

    const response = await apiClient.put<ApiResponse<any>>(`/admin/companies/${id}/`, data)
    return response
  },

  deleteCompany: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    if (isMockEnabled()) {
      // Return mock data
      return {
        status: "success",
        message: "Company deleted successfully",
        data: { success: true },
      }
    }

    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/admin/companies/${id}/`)
    return response
  },

  // Analytics
  getAnalytics: async (): Promise<ApiResponse<any>> => {
    if (isMockEnabled()) {
      // Return mock data
      const { mockAdminAnalytics, mockAdminStats } = await import("@/lib/mock-data/admin")
      return {
        status: "success",
        message: "Analytics retrieved successfully",
        data: {
          analytics: mockAdminAnalytics,
          stats: mockAdminStats,
        },
      }
    }

    const response = await apiClient.get<ApiResponse<any>>("/admin/analytics/")
    return response.data
  },

  // Settings
  getSettings: async (): Promise<ApiResponse<AdminSettings>> => {
    if (isMockEnabled()) {
      // Return mock data
      const { mockAdminSettings } = await import("@/lib/mock-data/admin")
      return {
        status: "success",
        message: "Settings retrieved successfully",
        data: mockAdminSettings,
      }
    }

    const response = await apiClient.get<ApiResponse<AdminSettings>>("/admin/settings/")
    return response.data
  },

  updateSettings: async (data: AdminSettings): Promise<ApiResponse<AdminSettings>> => {
    if (isMockEnabled()) {
      // Return mock data
      return {
        status: "success",
        message: "Settings updated successfully",
        data: data,
      }
    }

    const response = await apiClient.put<ApiResponse<AdminSettings>>("/admin/settings/", data)
    return response
  },
}
