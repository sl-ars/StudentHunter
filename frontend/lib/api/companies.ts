import apiClient from "./client"
import type { Company } from "@/lib/types"

export interface CompanyFilters {
  search?: string
  industry?: string
  location?: string
  size?: string
  page?: number
  page_size?: number
}

export interface CompanyListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Company[]
}

export const companiesApi = {
  getCompanies: async (filters: CompanyFilters = {}) => {
    const response = await apiClient.get<CompanyListResponse>("/companies/", {
      params: filters,
    })
    return response.data
  },

  getCompany: async (id: string) => {
    const response = await apiClient.get<Company>(`/companies/${id}/`)
    return response.data
  },

  createCompany: async (data: Partial<Company>) => {
    const response = await apiClient.post<Company>("/companies/", data)
    return response.data
  },

  updateCompany: async (id: string, data: Partial<Company>) => {
    const response = await apiClient.patch<Company>(`/companies/${id}/`, data)
    return response.data
  },

  deleteCompany: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean }>(`/companies/${id}/`)
    return response.data
  },

  uploadLogo: async (id: string, file: File) => {
    const formData = new FormData()
    formData.append("logo", file)

    const response = await apiClient.post<{ url: string }>(`/companies/${id}/logo/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  },

  getCompanyJobs: async (id: string) => {
    const response = await apiClient.get<{ jobs: any[] }>(`/companies/${id}/jobs/`)
    return response.data
  },
}

