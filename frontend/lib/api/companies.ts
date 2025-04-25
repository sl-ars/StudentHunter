import axios from "axios"
import type { AxiosResponse } from "axios"
import apiClient from "./client"
import type { ApiResponse } from "./client"
import type { Company } from "@/lib/types"
import { isMockEnabled } from "@/lib/utils/config"

// Define the standard API response format for axios direct calls
export interface AxiosApiResponse<T = any> {
  data: T
  status: string
  message: string
  errors?: Record<string, string[]>
}

export interface CompanyFilters {
  search?: string
  industry?: string
  location?: string
  size?: string
  page?: number
  page_size?: number
  limit?: number
}

export interface CompanyListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Company[]
}

export interface CompaniesResponse {
  companies: Company[]
  currentPage: number
  totalPages: number
  totalCount: number
}

// Legacy API using axios directly
export const companiesApi = {
  getCompanies: async (filters: CompanyFilters = {}): Promise<AxiosResponse<AxiosApiResponse<CompanyListResponse>>> => {
    const response = await axios.get<AxiosApiResponse<CompanyListResponse>>("/company/", { params: filters })
    return response
  },

  getCompany: async (id: string): Promise<AxiosResponse<AxiosApiResponse<Company>>> => {
    const response = await axios.get<AxiosApiResponse<Company>>(`/company/${id}/`)
    return response
  },

  createCompany: async (companyData: Partial<Company>): Promise<AxiosResponse<AxiosApiResponse<Company>>> => {
    const response = await axios.post<AxiosApiResponse<Company>>("/company/", companyData)
    return response
  },

  updateCompany: async (
    id: string,
    companyData: Partial<Company>,
  ): Promise<AxiosResponse<AxiosApiResponse<Company>>> => {
    const response = await axios.put<AxiosApiResponse<Company>>(`/company/${id}/`, companyData)
    return response
  },

  deleteCompany: async (id: string): Promise<AxiosResponse<AxiosApiResponse<{ success: boolean }>>> => {
    const response = await axios.delete<AxiosApiResponse<{ success: boolean }>>(`/company/${id}/`)
    return response
  },

  // Company logo
  uploadLogo: async (id: string, file: File): Promise<AxiosResponse<AxiosApiResponse<{ url: string }>>> => {
    const formData = new FormData()
    formData.append("logo", file)

    const response = await axios.post<AxiosApiResponse<{ url: string }>>(`/company/${id}/logo/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response
  },

  // Company verification
  verifyCompany: async (id: string): Promise<AxiosResponse<AxiosApiResponse<{ success: boolean }>>> => {
    const response = await axios.post<AxiosApiResponse<{ success: boolean }>>(`/company/${id}/verify/`, {})
    return response
  },

  // Company jobs
  // getCompanyJobs: async (id: string): Promise<AxiosResponse<AxiosApiResponse<JobListResponse>>> => {
  //   const response = await axios.get<AxiosApiResponse<JobListResponse>>(`/companies/${id}/jobs/`)
  //   return response
  // },

  // Company stats
  getCompanyStats: async (
    id: string,
  ): Promise<
    AxiosResponse<
      AxiosApiResponse<{
        views: number
        applications: number
        followers: number
        hires: number
      }>
    >
  > => {
    const response = await axios.get<
      AxiosApiResponse<{
        views: number
        applications: number
        followers: number
        hires: number
      }>
    >(`/company/${id}/stats/`)
    return response
  },
}

// Modern API using apiClient with error handling
export const companyApi = {
  getAll: async (filters: CompanyFilters = {}): Promise<ApiResponse<CompaniesResponse>> => {
    try {
      const pageSize = filters.page_size ?? 20;
      const response = await apiClient.get<ApiResponse<CompanyListResponse>>("/company", { params: filters })

      // Check if the response has the expected structure
      if (response.data && response.data.data && Array.isArray(response.data.data.results)) {
        const { count, next, previous, results } = response.data.data

        return {
          status: "success",
          message: "Companies retrieved successfully",
          data: {
            companies: results,
            currentPage: filters.page || 1,
            totalPages: Math.ceil(count / pageSize),
            totalCount: count,
          },
        }
      } else if (response.data && typeof response.data === 'object' && 'results' in response.data) {
        // Handle direct API response format (from backend)
        const directResponse = response.data as unknown as CompanyListResponse
        const { count, next, previous, results } = directResponse

        return {
          status: "success",
          message: "Companies retrieved successfully",
          data: {
            companies: results,
            currentPage: filters.page || 1,
            totalPages: Math.ceil(count / pageSize),
            totalCount: count,
          },
        }
      } else {
        // Handle unexpected response structure
        console.error("Unexpected API response structure:", response)
        return {
          status: "error",
          message: "Invalid response format from server",
          data: {
            companies: [],
            currentPage: 1,
            totalPages: 0,
            totalCount: 0,
          },
        }
      }
    } catch (error: any) {
      console.error("Error fetching companies:", error)
      return {
        status: "error",
        message: error.message || "Failed to retrieve companies",
        data: {
          companies: [],
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
        },
      }
    }
  },

  getById: async (id: string): Promise<ApiResponse<Company>> => {
    try {
      const response = await apiClient.get<ApiResponse<Company>>(`/company/${id}`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to retrieve company",
        data: null as any,
      }
    }
  },

  create: async (data: Partial<Company>): Promise<ApiResponse<Company>> => {
    try {
      const response = await apiClient.post<ApiResponse<Company>>("/company", data)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to create company",
        data: null as any,
      }
    }
  },

  update: async (id: string, data: Partial<Company>): Promise<ApiResponse<Company>> => {
    try {
      const response = await apiClient.put<ApiResponse<Company>>(`/company/${id}`, data)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to update company",
        data: null as any,
      }
    }
  },

  delete: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/company/${id}`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to delete company",
        data: { success: false },
      }
    }
  },

  // Company logo
  uploadLogo: async (id: string, file: File): Promise<ApiResponse<{ url: string }>> => {
    try {
      const formData = new FormData()
      formData.append("logo", file)

      const response = await apiClient.post<ApiResponse<{ url: string }>>(`/company/${id}/logo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to upload company logo",
        data: { url: "" },
      }
    }
  },

  // Company verification
  verifyCompany: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ success: boolean }>>(`/company/${id}/verify`, {})
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to verify company",
        data: { success: false },
      }
    }
  },

  // Company jobs
  // getCompanyJobs: async (id: string): Promise<ApiResponse<JobListResponse>> => {
  //   try {
  //     const response = await apiClient.get<ApiResponse<JobListResponse>>(`/companies/${id}/jobs`)
  //     return response.data
  //   } catch (error: any) {
  //     return {
  //       status: "error",
  //       message: error.message || "Failed to retrieve company jobs",
  //       data: null as any,
  //     }
  //   }
  // },

  // Company stats
  getCompanyStats: async (
    id: string,
  ): Promise<
    ApiResponse<{
      views: number
      applications: number
      followers: number
      hires: number
    }>
  > => {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          views: number
          applications: number
          followers: number
          hires: number
        }>
      >(`/company/${id}/stats/`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to retrieve company stats",
        data: {
          views: 0,
          applications: 0,
          followers: 0,
          hires: 0,
        },
      }
    }
  },
}