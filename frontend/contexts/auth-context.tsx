"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { User, UserRole } from "@/lib/types"
import { toast } from "sonner"

// Token refresh interval in milliseconds (20 minutes)
const TOKEN_REFRESH_INTERVAL = 20 * 60 * 1000;

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, redirectPath?: string) => Promise<boolean>
  logout: () => void
  register: (userData: any, redirectPath?: string) => Promise<boolean>
  hasRole: (roles: string | string[]) => boolean
  refreshUserInfo: () => Promise<void>
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

  // Function to refresh the access token
  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) return false

      const response = await authApi.refreshToken(refreshToken)
      if (response.access) {
        localStorage.setItem('access_token', response.access)
        return true
      }
      return false
    } catch (error) {
      console.error('Token refresh error:', error)
      return false
    }
  }

  const refreshUserInfo = async (): Promise<void> => {
    try {
      console.log('Refreshing user info...')
      const token = localStorage.getItem('access_token')
      if (!token) {
        console.warn('No token available to refresh user info')
        return
      }

      const response = await authApi.verifyToken(token)
      if (response.status === 'success' && response.data?.isValid && response.data?.user) {
        const userData = response.data.user
        console.log('Updated user data:', userData)

        // Update user state with refreshed data
        if (user) {
          setUser((prevUser) => prevUser ? {
            ...prevUser,
            company: userData.company,
            company_id: userData.company_id,
            name: userData.name || prevUser.name,
            avatar: userData.avatar || prevUser.avatar,
          } : null);
          console.log('User info refreshed with new company data')
        }
      } else {
        console.warn('Failed to refresh user info, invalid response:', response)
      }
    } catch (error) {
      console.error('Error refreshing user info:', error)
    }
  }

  const checkAuth = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('access_token')
      console.log('Checking auth with token:', token ? 'exists' : 'missing')
      
      if (!token) {
        // Try to use refresh token if available
        const hasRefreshed = await refreshAccessToken()
        if (!hasRefreshed) {
          setUser(null)
          if (pathname !== '/login' && !pathname.startsWith('/public/')) {
            // Store current path for redirection after login
            sessionStorage.setItem("authRedirect", pathname)
            router.push('/login')
          }
          return
        }
      }

      // Get the possibly refreshed token
      const currentToken = localStorage.getItem('access_token')
      
      try {
        const response = await authApi.verifyToken(currentToken || '')
        console.log('Auth verification response:', response)
        
        if (response.status === 'success' && response.data?.isValid && response.data?.user) {
          const userData = response.data.user
          const role = userData.role as UserRole
          if (role !== 'admin' && role !== 'employer' && role !== 'campus' && role !== 'student') {
            console.error('Invalid role:', role)
            setUser(null)
            localStorage.removeItem('access_token')
            if (pathname !== '/login' && !pathname.startsWith('/public/')) {
              router.push('/login')
            }
            return
          }
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: role,
            avatar: userData.avatar,
            company: userData.company,
            company_id: userData.company_id,
            createdAt: new Date().toISOString(),
            isActive: true
          })

          // Redirect to appropriate page if on login
          if (pathname === '/login') {
            redirectBasedOnRole(role)
          }
        } else {
          // Token invalid, try to refresh
          const hasRefreshed = await refreshAccessToken()
          if (hasRefreshed) {
            // Check auth again with new token - MODIFIED LOGIC
            const newToken = localStorage.getItem('access_token');
            if (newToken) {
              try {
                const newResponse = await authApi.verifyToken(newToken);
                if (newResponse.status === 'success' && newResponse.data?.isValid && newResponse.data?.user) {
                  const userData = newResponse.data.user;
                  const role = userData.role as UserRole;
                  if (role !== 'admin' && role !== 'employer' && role !== 'campus' && role !== 'student') {
                    console.error('Invalid role after refresh:', role);
                    setUser(null);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    if (pathname !== '/login' && !pathname.startsWith('/public/')) {
                      router.push('/login');
                    }
                  } else {
                    setUser({
                      id: userData.id,
                      email: userData.email,
                      name: userData.name,
                      role: role,
                      avatar: userData.avatar,
                      company: userData.company,
                      company_id: userData.company_id,
                      createdAt: new Date().toISOString(),
                      isActive: true
                    });
                    if (pathname === '/login') {
                      redirectBasedOnRole(role);
                    }
                  }
                } else {
                  // Verification of new token failed
                  setUser(null)
                  localStorage.removeItem('access_token')
                  localStorage.removeItem('refresh_token')
                  if (pathname !== '/login' && !pathname.startsWith('/public/')) {
                    router.push('/login')
                  }
                }
              } catch (e) {
                // Error verifying new token
                setUser(null)
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                if (pathname !== '/login' && !pathname.startsWith('/public/')) {
                  router.push('/login')
                }
              }
            } else {
                // No new token found after refresh (should not happen if hasRefreshed is true)
                setUser(null)
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                if (pathname !== '/login' && !pathname.startsWith('/public/')) {
                  router.push('/login')
                }
            }
          } else {
            setUser(null)
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            if (pathname !== '/login' && !pathname.startsWith('/public/')) {
              router.push('/login')
            }
          }
        }
      } catch (verifyError) {
        console.error('Token verification error:', verifyError)
        // Token validation failed, try to refresh
        const hasRefreshed = await refreshAccessToken()
        if (hasRefreshed) {
          // Check auth again with new token - MODIFIED LOGIC
          const newToken = localStorage.getItem('access_token');
          if (newToken) {
            try {
              const newResponse = await authApi.verifyToken(newToken);
              if (newResponse.status === 'success' && newResponse.data?.isValid && newResponse.data?.user) {
                const userData = newResponse.data.user;
                const role = userData.role as UserRole;
                if (role !== 'admin' && role !== 'employer' && role !== 'campus' && role !== 'student') {
                  console.error('Invalid role after refresh:', role);
                  setUser(null);
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('refresh_token');
                  if (pathname !== '/login' && !pathname.startsWith('/public/')) {
                    router.push('/login');
                  }
                } else {
                  setUser({
                    id: userData.id,
                    email: userData.email,
                    name: userData.name,
                    role: role,
                    avatar: userData.avatar,
                    company: userData.company,
                    company_id: userData.company_id,
                    createdAt: new Date().toISOString(),
                    isActive: true
                  });
                  if (pathname === '/login') {
                    redirectBasedOnRole(role);
                  }
                }
              } else {
                // Verification of new token failed
                setUser(null)
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                if (pathname !== '/login' && !pathname.startsWith('/public/')) {
                  router.push('/login')
                }
              }
            } catch (e) {
              // Error verifying new token
              setUser(null)
              localStorage.removeItem('access_token')
              localStorage.removeItem('refresh_token')
              if (pathname !== '/login' && !pathname.startsWith('/public/')) {
                router.push('/login')
              }
            }
          } else {
              // No new token found after refresh (should not happen if hasRefreshed is true)
              setUser(null)
              localStorage.removeItem('access_token')
              localStorage.removeItem('refresh_token')
              if (pathname !== '/login' && !pathname.startsWith('/public/')) {
                router.push('/login')
              }
          }
        } else {
          setUser(null)
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          if (pathname !== '/login' && !pathname.startsWith('/public/')) {
            router.push('/login')
          }
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      if (pathname !== '/login' && !pathname.startsWith('/public/')) {
        router.push('/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Set up automatic token refresh
  useEffect(() => {
    // Only set up refresh timer if user is authenticated
    if (user) {
      const refreshTimer = setInterval(refreshAccessToken, TOKEN_REFRESH_INTERVAL)
      return () => clearInterval(refreshTimer)
    }
  }, [user])

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
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role as UserRole,
          avatar: response.user.avatar,
          company: response.user.company,
          company_id: response.user.company_id,
          createdAt: new Date().toISOString(),
          isActive: true
        })
        
        const redirectTo = redirectPath || sessionStorage.getItem("authRedirect")
        if (redirectTo) {
          router.push(redirectTo)
          sessionStorage.removeItem("authRedirect")
        } else {
          redirectBasedOnRole(response.user.role as UserRole)
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
            id: loginResponse.user.id,
            email: loginResponse.user.email,
            name: loginResponse.user.name,
            role: loginResponse.user.role as UserRole,
            avatar: loginResponse.user.avatar,
            company: loginResponse.user.company,
            company_id: loginResponse.user.company_id,
            createdAt: new Date().toISOString(),
            isActive: true
          })
          
          const redirectTo = redirectPath || sessionStorage.getItem("authRedirect")
          if (redirectTo) {
            router.push(redirectTo)
            sessionStorage.removeItem("authRedirect")
          } else {
            redirectBasedOnRole(loginResponse.user.role as UserRole)
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
    refreshUserInfo,
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
