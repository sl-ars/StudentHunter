"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User, UserRole } from "@/lib/types"
import { useRouter } from "next/navigation"
import { authApi, userApi } from "@/lib/api"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  hasRole: (roles: UserRole | UserRole[]) => boolean
  saveJob: (jobId: string) => void
  unsaveJob: (jobId: string) => void
  applyToJob: (jobId: string) => void
  followCompany: (companyId: string) => void
  unfollowCompany: (companyId: string) => void
  hasSavedJob: (jobId: string) => boolean
  hasAppliedToJob: (jobId: string) => boolean
  hasFollowedCompany: (companyId: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a token
        const token = localStorage.getItem("access_token")
        if (!token) {
          setLoading(false)
          return
        }

        // Verify the token and get user data
        const response = await authApi.getMe()
        setUser(response.data)
      } catch (error) {
        // If token is invalid, clear it
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password)
      setUser(response.user)
      return true
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
    router.push("/login")
  }

  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!user) return false
    if (Array.isArray(roles)) {
      return roles.includes(user.role)
    }
    return user.role === roles
  }

  const saveJob = async (jobId: string) => {
    if (!user) return
    try {
      await userApi.saveJob(jobId)
      setUser({
        ...user,
        savedJobs: [...(user.savedJobs || []), jobId],
      })
    } catch (error) {
      console.error("Failed to save job:", error)
    }
  }

  const unsaveJob = async (jobId: string) => {
    if (!user) return
    try {
      await userApi.unsaveJob(jobId)
      setUser({
        ...user,
        savedJobs: (user.savedJobs || []).filter((id) => id !== jobId),
      })
    } catch (error) {
      console.error("Failed to unsave job:", error)
    }
  }

  const applyToJob = (jobId: string) => {
    if (!user) return
    setUser({
      ...user,
      appliedJobs: [...(user.appliedJobs || []), jobId],
    })
  }

  const followCompany = async (companyId: string) => {
    if (!user) return
    try {
      await userApi.followCompany(companyId)
      setUser({
        ...user,
        followedCompanies: [...(user.followedCompanies || []), companyId],
      })
    } catch (error) {
      console.error("Failed to follow company:", error)
    }
  }

  const unfollowCompany = async (companyId: string) => {
    if (!user) return
    try {
      await userApi.unfollowCompany(companyId)
      setUser({
        ...user,
        followedCompanies: (user.followedCompanies || []).filter((id) => id !== companyId),
      })
    } catch (error) {
      console.error("Failed to unfollow company:", error)
    }
  }

  const hasSavedJob = (jobId: string) => {
    return user?.savedJobs?.includes(jobId) || false
  }

  const hasAppliedToJob = (jobId: string) => {
    return user?.appliedJobs?.includes(jobId) || false
  }

  const hasFollowedCompany = (companyId: string) => {
    return user?.followedCompanies?.includes(companyId) || false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
        saveJob,
        unsaveJob,
        applyToJob,
        followCompany,
        unfollowCompany,
        hasSavedJob,
        hasAppliedToJob,
        hasFollowedCompany,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

