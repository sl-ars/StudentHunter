import axios from "axios"
import type { Company } from "../types"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
})

export const companyApi = {
  getAll: () => api.get<Company[]>("/companies"),
  getById: (id: string) => api.get<Company>(`/companies/${id}`),
  create: (data: Partial<Company>) => api.post<Company>("/companies", data),
  update: (id: string, data: Partial<Company>) => api.put<Company>(`/companies/${id}`, data),
  delete: (id: string) => api.delete(`/companies/${id}`),
}

