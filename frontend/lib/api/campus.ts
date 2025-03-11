import apiClient from "./client"

export interface Student {
  id: string
  name: string
  email: string
  major: string
  graduationYear: string
  status: string
}

export interface CampusEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  attendees: number
  companies: string[]
  type: string
}

export interface CampusReport {
  id: string
  name: string
  description: string
  lastUpdated: string
  url: string
}

export interface StudentListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Student[]
}

export interface EventListResponse {
  count: number
  next: string | null
  previous: string | null
  results: CampusEvent[]
}

export interface ReportListResponse {
  count: number
  next: string | null
  previous: string | null
  results: CampusReport[]
}

export const campusApi = {
  getStudents: async (filters: { search?: string; major?: string; status?: string } = {}) => {
    const response = await apiClient.get<StudentListResponse>("/campus/students/", {
      params: filters,
    })
    return response.data
  },

  getStudent: async (id: string) => {
    const response = await apiClient.get<Student>(`/campus/students/${id}/`)
    return response.data
  },

  createStudent: async (data: Partial<Student>) => {
    const response = await apiClient.post<Student>("/campus/students/", data)
    return response.data
  },

  updateStudent: async (id: string, data: Partial<Student>) => {
    const response = await apiClient.patch<Student>(`/campus/students/${id}/`, data)
    return response.data
  },

  getEvents: async (filters: { type?: string; date_from?: string; date_to?: string } = {}) => {
    const response = await apiClient.get<EventListResponse>("/campus/events/", {
      params: filters,
    })
    return response.data
  },

  getEvent: async (id: string) => {
    const response = await apiClient.get<CampusEvent>(`/campus/events/${id}/`)
    return response.data
  },

  createEvent: async (data: Partial<CampusEvent>) => {
    const response = await apiClient.post<CampusEvent>("/campus/events/", data)
    return response.data
  },

  updateEvent: async (id: string, data: Partial<CampusEvent>) => {
    const response = await apiClient.patch<CampusEvent>(`/campus/events/${id}/`, data)
    return response.data
  },

  deleteEvent: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean }>(`/campus/events/${id}/`)
    return response.data
  },

  getReports: async () => {
    const response = await apiClient.get<ReportListResponse>("/campus/reports/")
    return response.data
  },

  getReport: async (id: string) => {
    const response = await apiClient.get<CampusReport>(`/campus/reports/${id}/`)
    return response.data
  },
}

