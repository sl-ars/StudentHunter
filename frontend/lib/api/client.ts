import axios, { type AxiosError, type AxiosRequestConfig } from "axios"

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include the JWT token in requests
apiClient.interceptors.request.use(
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
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem("refresh_token")
        if (!refreshToken) {
          throw new Error("No refresh token available")
        }

        const response = await axios.post(`${apiClient.defaults.baseURL}/auth/token/refresh/`, {
          refresh: refreshToken,
        })

        const { access } = response.data
        localStorage.setItem("access_token", access)

        // Update the original request with the new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`
        }

        // Retry the original request
        return apiClient(originalRequest)
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

export default apiClient

