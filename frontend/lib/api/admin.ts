import apiClient from "./client"
import type { User } from "@/lib/types"

export interface UserFilters {
  role?: string
  search?: string
  page?: number
  page_size?: number
}

export interface UserListResponse {
  count: number
  next: string | null
  previous: string | null
  results: User[]
}

export interface AdminStats {
  users: {
    total: number
    students: number
    employers: number
    campus: number
    admins: number
  }
  jobs: {
    total: number
    active: number
    filled: number
  }
  applications: {
    total: number
    pending: number
    reviewing: number
    accepted: number
    rejected: number
  }
  companies: {
    total: number
    verified: number
  }
}

export const adminApi = {
  getUsers: async (filters: UserFilters = {}) => {
    const response = await apiClient.get<UserListResponse>("/admin/users/", {
      params: filters,
    })
    return response.data
  },

  getUser: async (id: string) => {
    const response = await apiClient.get<User>(`/admin/users/${id}/`)
    return response.data
  },

  createUser: async (data: Partial<User> & { password: string }) => {
    const response = await apiClient.post<User>("/admin/users/", data)
    return response.data
  },

  updateUser: async (id: string, data: Partial<User>) => {
    const response = await apiClient.patch<User>(`/admin/users/${id}/`, data)
    return response.data
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean }>(`/admin/users/${id}/`)
    return response.data
  },

  getStats: async () => {
    const response = await apiClient.get<AdminStats>("/admin/stats/")
    return response.data
  },
}

