"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import type { User, UserRole } from "@/lib/types"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, redirectPath?: string) => Promise<boolean>
  logout: () => void
  register: (userData: any, redirectPath?: string) => Promise<boolean>
  hasRole: (roles: UserRole | UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

 useEffect(() => {
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (token) {
        const response = await authApi.verifyToken(token)

        if (response.data.isValid && response.data.user) {
          setUser(response.data.user)
        } else {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
        }
      }
    } catch (error) {
      console.error("Auth check error:", error)
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
    } finally {
      setIsLoading(false)
    }
  }

  checkAuth()
}, [])

  const login = async (email: string, password: string, redirectPath?: string): Promise<boolean> => {
    try {
      const response = await authApi.login({ email, password })

      if (response.access) {
        localStorage.setItem("access_token", response.access)
        localStorage.setItem("refresh_token", response.refresh)
        setUser(response.user)

        const redirectTo = redirectPath || sessionStorage.getItem("authRedirect")
        if (redirectTo) {
          router.push(redirectTo)
          sessionStorage.removeItem("authRedirect")
        } else {
          redirectBasedOnRole(response.user.role)
        }

        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    setUser(null)
    router.push("/login")
  }

  const register = async (userData: any, redirectPath?: string): Promise<boolean> => {
    try {
      const response = await authApi.register(userData)

      if (response.success) {
        const loginResponse = await authApi.login({
          email: userData.email,
          password: userData.password,
        })

        if (loginResponse.access) {
          localStorage.setItem("access_token", loginResponse.access)
          localStorage.setItem("refresh_token", loginResponse.refresh)
          setUser(loginResponse.user)

          const redirectTo = redirectPath || sessionStorage.getItem("authRedirect")
          if (redirectTo) {
            router.push(redirectTo)
            sessionStorage.removeItem("authRedirect")
          } else {
            redirectBasedOnRole(loginResponse.user.role)
          }

          return true
        }
      }

      return false
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false
    return Array.isArray(roles) ? roles.includes(user.role as UserRole) : user.role === roles
  }

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case "admin":
        router.push("/admin")
        break
      case "manager":
      case "employer":
        router.push("/manager")
        break
      case "campus":
        router.push("/campus")
        break
      case "student":
      default:
        router.push("/student")
        break
    }
  }

  useEffect(() => {
    if (!isLoading && !user && pathname === "/login") {
      const redirect = searchParams.get("redirect")
      if (redirect) {
        sessionStorage.setItem("authRedirect", redirect)
      }
    }
  }, [isLoading, user, pathname, searchParams])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
