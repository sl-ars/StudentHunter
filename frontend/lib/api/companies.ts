import axios from "axios"
import type { AxiosResponse } from "axios"
import apiClient from "./client"
import type { ApiResponse } from "./client"
import type { Company } from "@/lib/types"
import type { JobListResponse } from "./jobs"
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
    const response = await axios.get<AxiosApiResponse<CompanyListResponse>>("/companies/", { params: filters })
    return response
  },

  getCompany: async (id: string): Promise<AxiosResponse<AxiosApiResponse<Company>>> => {
    const response = await axios.get<AxiosApiResponse<Company>>(`/companies/${id}/`)
    return response
  },

  createCompany: async (companyData: Partial<Company>): Promise<AxiosResponse<AxiosApiResponse<Company>>> => {
    const response = await axios.post<AxiosApiResponse<Company>>("/companies/", companyData)
    return response
  },

  updateCompany: async (
    id: string,
    companyData: Partial<Company>,
  ): Promise<AxiosResponse<AxiosApiResponse<Company>>> => {
    const response = await axios.put<AxiosApiResponse<Company>>(`/companies/${id}/`, companyData)
    return response
  },

  deleteCompany: async (id: string): Promise<AxiosResponse<AxiosApiResponse<{ success: boolean }>>> => {
    const response = await axios.delete<AxiosApiResponse<{ success: boolean }>>(`/companies/${id}/`)
    return response
  },

  // Company logo
  uploadLogo: async (id: string, file: File): Promise<AxiosResponse<AxiosApiResponse<{ url: string }>>> => {
    const formData = new FormData()
    formData.append("logo", file)

    const response = await axios.post<AxiosApiResponse<{ url: string }>>(`/companies/${id}/logo/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response
  },

  // Company verification
  verifyCompany: async (id: string): Promise<AxiosResponse<AxiosApiResponse<{ success: boolean }>>> => {
    const response = await axios.post<AxiosApiResponse<{ success: boolean }>>(`/companies/${id}/verify/`, {})
    return response
  },

  // Company jobs
  getCompanyJobs: async (id: string): Promise<AxiosResponse<AxiosApiResponse<JobListResponse>>> => {
    const response = await axios.get<AxiosApiResponse<JobListResponse>>(`/companies/${id}/jobs/`)
    return response
  },

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
    >(`/companies/${id}/stats/`)
    return response
  },
}

// Modern API using apiClient with error handling
export const companyApi = {
  getAll: async (filters: CompanyFilters = {}): Promise<ApiResponse<CompaniesResponse>> => {
    try {
      if (isMockEnabled()) {
        const mockData = await getMockCompanies(filters, true)
        return {
          status: "success",
          message: "Companies retrieved successfully (mocked)",
          data: mockData,
        }
      }

      const response = await apiClient.get<ApiResponse<CompanyListResponse>>("/companies", { params: filters })
      return {
        status: "success",
        message: "Companies retrieved successfully",
        data: {
          companies: response.data.data.companies,
          currentPage: response.data.data.currentPage,
          totalPages: response.data.data.totalPages,
          totalCount: response.data.data.totalCount,
        },
      }
    } catch (error: any) {
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
      const response = await apiClient.get<ApiResponse<Company>>(`/companies/${id}`)
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
      const response = await apiClient.post<ApiResponse<Company>>("/companies", data)
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
      const response = await apiClient.put<ApiResponse<Company>>(`/companies/${id}`, data)
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
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/companies/${id}`)
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

      const response = await apiClient.post<ApiResponse<{ url: string }>>(`/companies/${id}/logo`, formData, {
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
      const response = await apiClient.post<ApiResponse<{ success: boolean }>>(`/companies/${id}/verify`, {})
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
  getCompanyJobs: async (id: string): Promise<ApiResponse<JobListResponse>> => {
    try {
      const response = await apiClient.get<ApiResponse<JobListResponse>>(`/companies/${id}/jobs`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to retrieve company jobs",
        data: null as any,
      }
    }
  },

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
      >(`/companies/${id}/stats/`)
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

export async function getMockCompanies(
  filters: CompanyFilters = {},
  isAuthenticated = false,
): Promise<CompaniesResponse> {
  // In a real app, this would be an API call
  // For now, we'll simulate with a delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const { mockCompanies } = await import("@/lib/mock-data/companies")

  // Filter companies based on search criteria
  let filteredCompanies = [...mockCompanies]

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filteredCompanies = filteredCompanies.filter(
      (company) =>
        company.name.toLowerCase().includes(searchLower) ||
        company.industry.toLowerCase().includes(searchLower) ||
        company.description.toLowerCase().includes(searchLower),
    )
  }

  if (filters.location) {
    const locationLower = filters.location.toLowerCase()
    filteredCompanies = filteredCompanies.filter((company) => company.location.toLowerCase().includes(locationLower))
  }

  if (filters.industry) {
    const industryLower = filters.industry.toLowerCase()
    filteredCompanies = filteredCompanies.filter((company) => company.industry.toLowerCase() === industryLower)
  }

  // Pagination
  const page = filters.page || 1
  const limit = isAuthenticated ? filters.limit || 6 : 3 // Limit to 3 for non-authenticated users
  const totalCount = filteredCompanies.length
  const totalPages = Math.ceil(totalCount / limit)
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit

  const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex)

  return {
    companies: paginatedCompanies,
    currentPage: page,
    totalPages,
    totalCount,
  }
}
