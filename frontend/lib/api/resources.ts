import apiClient from "./client"
import type { ApiResponse } from "./client"
import type { Resource, ResourceResponse } from "@/lib/types"
import { mockResources } from "@/lib/mock-data/resources"
import { isMockEnabled } from "@/lib/utils/config"

export interface ResourceFilters {
  category?: string
  type?: string
  search?: string
  page?: number
  page_size?: number
  isDemo?: boolean
}

export interface ResourceListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Resource[]
}

export const resourcesApi = {
  getResources: async (
    filters: ResourceFilters = {},
    isAuthenticated = true,
  ): Promise<ApiResponse<ResourceListResponse>> => {
    if (isMockEnabled()) {
      // Mock implementation
      const filteredResources = Object.values(mockResources).filter((resource) => {
        // For non-authenticated users, only show demo resources
        if (!isAuthenticated && !(resource.isDemo === true)) {
          return false
        }

        if (filters.category && filters.category !== "All" && resource.category !== filters.category) {
          return false
        }
        if (filters.type && resource.type !== filters.type) {
          return false
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          return (
            resource.title.toLowerCase().includes(searchLower) ||
            resource.description.toLowerCase().includes(searchLower) ||
            resource.tags.some((tag) => tag.toLowerCase().includes(searchLower))
          )
        }
        return true
      })

      // Pagination
      const page = filters.page || 1
      const pageSize = filters.page_size || 10
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const paginatedResources = filteredResources.slice(start, end)

      return {
        status: "success",
        data: {
          count: filteredResources.length,
          next: end < filteredResources.length ? `/resource/?page=${page + 1}` : null,
          previous: page > 1 ? `/resource/?page=${page - 1}` : null,
          results: paginatedResources,
        },
        message: "Resources retrieved successfully",
      }
    }

    // Real API implementation
    try {
      // Add isDemo filter for non-authenticated users
      if (!isAuthenticated) {
        filters.isDemo = true
      }

      const response = await apiClient.get<ApiResponse<ResourceListResponse>>("/resource/", { params: filters })
      return response.data
    } catch (error) {
      console.error("Error fetching resources:", error)
      throw error
    }
  },

  getResource: async (id: string): Promise<ApiResponse<Resource>> => {
    if (isMockEnabled()) {
      // Mock implementation
      const resource = mockResources[id]
      if (resource) {
        return {
          status: "success",
          data: resource,
          message: "Resource retrieved successfully",
        }
      }
      return {
        status: "error",
        message: "Resource not found",
        data: null,
      }
    }

    // Real API implementation
    const response = await apiClient.get<ApiResponse<Resource>>(`/resource/${id}/`)
    return response.data
  },

  getCategories: async (): Promise<ApiResponse<string[]>> => {
    if (isMockEnabled()) {
      // Extract unique categories from mock resources
      const categories = [...new Set(Object.values(mockResources).map((r) => r.category))]
      return {
        status: "success",
        data: categories,
        message: "Categories retrieved successfully",
      }
    }

    // Real API implementation
    const response = await apiClient.get<ApiResponse<string[]>>("/resource/categories/")
    return response.data
  },

  getTypes: async (): Promise<ApiResponse<string[]>> => {
    if (isMockEnabled()) {
      // Extract unique types from mock resources
      const types = [...new Set(Object.values(mockResources).map((r) => r.type))]
      return {
        status: "success",
        data: types,
        message: "Types retrieved successfully",
      }
    }

    // Real API implementation
    const response = await apiClient.get<ApiResponse<string[]>>("/resource/types/")
    return response.data
  },

  // Other methods remain the same...
  createResource: async (resourceData: Partial<Resource>) => {
    const response = await apiClient.post<ApiResponse<Resource>>("/resource/", resourceData)
    return response.data
  },

  updateResource: async (id: string, resourceData: Partial<Resource>) => {
    const response = await apiClient.put<ApiResponse<Resource>>(`/resource/${id}/`, resourceData)
    return response.data
  },

  deleteResource: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/resource/${id}/`)
    return response.data
  },

  downloadResource: async (id: string) => {
    const response = await apiClient.get<ApiResponse<ResourceResponse>>(`/resource/${id}/download/`)
    return response.data
  },

  // Add backward compatibility methods for code that might be using resourceApi
  getAll: async (filters: ResourceFilters = {}) => {
    return resourcesApi.getResources(filters)
  },

  getById: async (id: string) => {
    return resourcesApi.getResource(id)
  },

  create: async (data: Partial<Resource>) => {
    return resourcesApi.createResource(data)
  },

  update: async (id: string, data: Partial<Resource>) => {
    return resourcesApi.updateResource(id, data)
  },

  delete: async (id: string) => {
    return resourcesApi.deleteResource(id)
  },
}
