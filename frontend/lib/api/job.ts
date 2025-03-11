import axios from "axios"
import type { Job } from "../types"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
})

export const jobApi = {
  getAll: () => api.get<Job[]>("/jobs"),
  getById: (id: string) => api.get<Job>(`/jobs/${id}`),
  create: (data: Partial<Job>) => api.post<Job>("/jobs", data),
  update: (id: string, data: Partial<Job>) => api.put<Job>(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`),
  apply: (jobId: string, applicationData: any) => api.post(`/jobs/${jobId}/apply`, applicationData),
}

