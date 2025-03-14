import axios from "axios"
import type { AxiosRequestConfig } from "axios"
import { isMockEnabled } from "../utils/config"
import Cookies from "js-cookie"
import { getMockResponse } from "./mock-service"

// Define the standard API response format
export interface ApiResponse<T = any> {
  data: T
  status: string
  message: string
  errors?: Record<string, string[]>
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
})

// Add a request interceptor to include the JWT token in requests
apiClient.interceptors.request.use(
  (config) => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      // Get token from localStorage or cookie
      const token = localStorage.getItem("access_token") || Cookies.get("access_token")

      // If token exists, add it to the headers
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  (error) => Promise.reject(error),
)

// Add a response interceptor to handle mock data
apiClient.interceptors.request.use(
  (config) => {
    // If mock data is enabled, intercept the request and return mock data
    if (isMockEnabled()) {
      return Promise.resolve({
        ...config,
        adapter: (config: AxiosRequestConfig) => {
          const mockResponse = getMockResponse(config)
          return Promise.resolve({
            data: mockResponse,
            status: 200,
            statusText: "OK",
            headers: {},
            config,
          })
        },
      })
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Add a response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with a status code outside of 2xx
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token")
          // Only redirect if we're not already on the login page
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login"
          }
        }
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
