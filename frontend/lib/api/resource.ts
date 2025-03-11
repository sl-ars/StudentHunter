import axios from "axios"
import type { Resource } from "../types"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
})

export const resourceApi = {
  getAll: () => api.get<Resource[]>("/resources"),
  getById: (id: string) => api.get<Resource>(`/resources/${id}`),
  create: (data: Partial<Resource>) => api.post<Resource>("/resources", data),
  update: (id: string, data: Partial<Resource>) => api.put<Resource>(`/resources/${id}`, data),
  delete: (id: string) => api.delete(`/resources/${id}`),
}

