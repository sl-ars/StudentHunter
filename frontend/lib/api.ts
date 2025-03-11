import axios from "axios"
import type { Job, Company, Resource } from "./types"

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include the JWT token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem("refresh_token")
        if (!refreshToken) {
          throw new Error("No refresh token available")
        }

        const response = await axios.post(`${api.defaults.baseURL}/auth/token/refresh/`, {
          refresh: refreshToken,
        })

        const { access } = response.data
        localStorage.setItem("access_token", access)

        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access}`

        // Retry the original request
        return api(originalRequest)
      } catch (refreshError) {
        // If refresh fails, log out the user
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// API functions for authentication
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/token/", { email, password })

    // Store tokens in localStorage
    localStorage.setItem("access_token", response.data.access)
    localStorage.setItem("refresh_token", response.data.refresh)

    return response.data
  },

  register: async (data: any) => {
    return api.post("/auth/register/", data)
  },

  logout: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    return { success: true }
  },

  getMe: async () => {
    return api.get("/auth/me/")
  },
}

// API functions for jobs
export const jobsApi = {
  getAll: (params = {}) => api.get<{ count: number; results: Job[] }>("/jobs/", { params }),
  getById: (id: string) => api.get<Job>(`/jobs/${id}/`),
  create: (data: Partial<Job>) => api.post<Job>("/jobs/", data),
  update: (id: string, data: Partial<Job>) => api.patch<Job>(`/jobs/${id}/`, data),
  delete: (id: string) => api.delete(`/jobs/${id}/`),
  apply: (id: string, data: any) => {
    // If there's a file, use FormData
    if (data.resume instanceof File) {
      const formData = new FormData()
      formData.append("resume", data.resume)

      if (data.answers) {
        formData.append("answers", JSON.stringify(data.answers))
      }

      return api.post(`/jobs/${id}/apply/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    }

    // Otherwise, use JSON
    return api.post(`/jobs/${id}/apply/`, data)
  },
}

// API functions for companies
export const companiesApi = {
  getAll: (params = {}) => api.get<{ count: number; results: Company[] }>("/companies/", { params }),
  getById: (id: string) => api.get<Company>(`/companies/${id}/`),
  create: (data: Partial<Company>) => api.post<Company>("/companies/", data),
  update: (id: string, data: Partial<Company>) => api.patch<Company>(`/companies/${id}/`, data),
  delete: (id: string) => api.delete(`/companies/${id}/`),
  getJobs: (id: string) => api.get<{ jobs: Job[] }>(`/companies/${id}/jobs/`),
}

// API functions for resources
export const resourcesApi = {
  getAll: (params = {}) => api.get<{ count: number; results: Resource[] }>("/resources/", { params }),
  getById: (id: string) => api.get<Resource>(`/resources/${id}/`),
  create: (data: Partial<Resource>) => api.post<Resource>("/resources/", data),
  update: (id: string, data: Partial<Resource>) => api.patch<Resource>(`/resources/${id}/`, data),
  delete: (id: string) => api.delete(`/resources/${id}/`),
}

// API functions for user profile
export const userApi = {
  getProfile: () => api.get("/users/profile/"),
  updateProfile: (data: any) => api.patch("/users/profile/", data),
  saveJob: (jobId: string) => api.post(`/users/saved-jobs/${jobId}/`),
  unsaveJob: (jobId: string) => api.delete(`/users/saved-jobs/${jobId}/`),
  followCompany: (companyId: string) => api.post(`/users/followed-companies/${companyId}/`),
  unfollowCompany: (companyId: string) => api.delete(`/users/followed-companies/${companyId}/`),
  getApplications: () => api.get("/users/applications/"),
  uploadResume: (file: File) => {
    const formData = new FormData()
    formData.append("resume", file)

    return api.post("/users/resume/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },
}

// API functions for notifications
export const notificationsApi = {
  getAll: () => api.get("/notifications/"),
  markAsRead: (id: string) => api.post(`/notifications/${id}/read/`),
  markAllAsRead: () => api.post("/notifications/read-all/"),
}

// API functions for admin
export const adminApi = {
  getUsers: (params = {}) => api.get("/admin/users/", { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}/`),
  createUser: (data: any) => api.post("/admin/users/", data),
  updateUser: (id: string, data: any) => api.patch(`/admin/users/${id}/`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}/`),
  getStats: () => api.get("/admin/stats/"),
}

// API functions for campus
export const campusApi = {
  getStudents: (params = {}) => api.get("/campus/students/", { params }),
  getStudent: (id: string) => api.get(`/campus/students/${id}/`),
  createStudent: (data: any) => api.post("/campus/students/", data),
  updateStudent: (id: string, data: any) => api.patch(`/campus/students/${id}/`, data),
  getEvents: (params = {}) => api.get("/campus/events/", { params }),
  getEvent: (id: string) => api.get(`/campus/events/${id}/`),
  createEvent: (data: any) => api.post("/campus/events/", data),
  updateEvent: (id: string, data: any) => api.patch(`/campus/events/${id}/`, data),
  deleteEvent: (id: string) => api.delete(`/campus/events/${id}/`),
  getReports: () => api.get("/campus/reports/"),
}

// API functions for career quest
export const careerQuestApi = {
  getProgress: () => api.get("/career-quest/progress/"),
  getQuests: () => api.get("/career-quest/quests/"),
  completeQuest: (id: string) => api.post(`/career-quest/quests/${id}/complete/`),
}

export default api

