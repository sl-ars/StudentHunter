import axios from "axios"
import type { User } from "../types"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
})

export const userApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User; token: string }>("/auth/login", { email, password }),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get<User>("/user/profile"),
  updateProfile: (data: Partial<User>) => api.put<User>("/user/profile", data),
  saveJob: (jobId: string) => api.post(`/user/saved-jobs/${jobId}`),
  unsaveJob: (jobId: string) => api.delete(`/user/saved-jobs/${jobId}`),
  followCompany: (companyId: string) => api.post(`/user/followed-companies/${companyId}`),
  unfollowCompany: (companyId: string) => api.delete(`/user/followed-companies/${companyId}`),
}

