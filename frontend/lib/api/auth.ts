import apiClient from "./client"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  password2: string
  name: string
  role: string
}

export interface AuthResponse {
  access: string
  refresh: string
  user: {
    id: string
    email: string
    name: string
    role: string
    avatar?: string
  }
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<AuthResponse>("/auth/token/", credentials)

    // Store tokens in localStorage
    localStorage.setItem("access_token", response.data.access)
    localStorage.setItem("refresh_token", response.data.refresh)

    return response.data
  },

  register: async (data: RegisterData) => {
    const response = await apiClient.post<{ success: boolean; message: string }>("/auth/register/", data)
    return response.data
  },

  logout: async () => {
    // In Django REST with JWT, we typically don't need a server call to logout
    // We just remove the tokens from localStorage
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")

    return { success: true }
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post<{ access: string }>("/auth/token/refresh/", {
      refresh: refreshToken,
    })

    localStorage.setItem("access_token", response.data.access)

    return response.data
  },

  verifyToken: async (token: string) => {
    const response = await apiClient.post<{ detail: string }>("/auth/token/verify/", {
      token,
    })

    return response.data
  },

  getMe: async () => {
    const response = await apiClient.get<AuthResponse["user"]>("/auth/me/")
    return response.data
  },
}

