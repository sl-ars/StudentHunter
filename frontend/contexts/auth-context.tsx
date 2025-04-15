"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { User, UserRole } from "@/lib/types"
import { toast } from "sonner"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, redirectPath?: string) => Promise<boolean>
  logout: () => void
  register: (userData: any, redirectPath?: string) => Promise<boolean>
  hasRole: (roles: string | string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isUserRole = (role: string): role is UserRole => {
    return role === 'admin' || role === 'employer' || role === 'campus' || role === 'student'
  }

  const checkAuth = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('access_token')
      console.log('Checking auth with token:', token ? 'exists' : 'missing')
      
      if (!token) {
        setUser(null)
        if (pathname !== '/login') {
          router.push('/login')
        }
        return
      }

      const response = await authApi.verifyToken(token)
      console.log('Auth verification response:', response)
      
      if (response.status === 'success' && response.data?.isValid && response.data?.user) {
        const userData = response.data.user
        const role = userData.role
        if (role !== 'admin' && role !== 'employer' && role !== 'campus' && role !== 'student') {
          console.error('Invalid role:', role)
          setUser(null)
          localStorage.removeItem('access_token')
          router.push('/login')
          return
        }
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          avatar: userData.avatar,
          company: userData.company,
          company_id: userData.company_id,
          createdAt: new Date().toISOString(),
          isActive: true
        })

        // Redirect to appropriate page if on login
        if (pathname === '/login') {
          redirectBasedOnRole(userData.role)
        }
      } else {
        setUser(null)
        localStorage.removeItem('access_token')
        if (pathname !== '/login') {
          router.push('/login')
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
      localStorage.removeItem('access_token')
      if (pathname !== '/login') {
        router.push('/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email: string, password: string, redirectPath?: string): Promise<boolean> => {
    try {
      const response = await authApi.login({ email, password })
      
      if (response.access) {
        localStorage.setItem('access_token', response.access)
        localStorage.setItem('refresh_token', response.refresh)
        
        setUser({
          ...response.user,
          createdAt: new Date().toISOString(),
          isActive: true
        })
        
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
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    router.push('/login')
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
          localStorage.setItem('access_token', loginResponse.access)
          localStorage.setItem('refresh_token', loginResponse.refresh)
          
          setUser({
            ...loginResponse.user,
            createdAt: new Date().toISOString(),
            isActive: true
          })
          
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
      console.error('Registration error:', error)
      return false
    }
  }

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false
    return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles
  }

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case "admin":
        router.push("/admin")
        break
      case "employer":
        router.push("/employer")
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

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
