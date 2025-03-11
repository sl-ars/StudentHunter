import apiClient from "./client"
import type { Resource } from "@/lib/types"

export interface ResourceFilters {
  category?: string
  type?: string
  search?: string
  page?: number
  page_size?: number
}

export interface ResourceListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Resource[]
}

export const resourcesApi = {
  getResources: async (filters: ResourceFilters = {}) => {
    const response = await apiClient.get<ResourceListResponse>("/resources/", {
      params: filters,
    })
    return response.data
  },

  getResource: async (id: string) => {
    const response = await apiClient.get<Resource>(`/resources/${id}/`)
    return response.data
  },

  createResource: async (data: Partial<Resource>) => {
    const response = await apiClient.post<Resource>("/resources/", data)
    return response.data
  },

  updateResource: async (id: string, data: Partial<Resource>) => {
    const response = await apiClient.patch<Resource>(`/resources/${id}/`, data)
    return response.data
  },

  deleteResource: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean }>(`/resources/${id}/`)
    return response.data
  },
}

