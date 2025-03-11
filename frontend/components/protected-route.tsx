"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { UserRole } from "@/lib/types"

export default function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode
  roles?: UserRole | UserRole[]
}) {
  const { isAuthenticated, hasRole } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("access_token")

    if (!token) {
      router.push("/login")
      return
    }

    // If we have a token but user is not authenticated yet (still loading),
    // we'll wait for the auth context to finish loading
    if (!isAuthenticated) {
      const checkInterval = setInterval(() => {
        if (isAuthenticated || !localStorage.getItem("access_token")) {
          clearInterval(checkInterval)
          setIsChecking(false)
        }
      }, 100)

      return () => clearInterval(checkInterval)
    }

    setIsChecking(false)

    // Check role permissions
    if (roles && !hasRole(roles)) {
      router.push("/unauthorized")
    }
  }, [isAuthenticated, hasRole, roles, router])

  if (isChecking) {
    return null // Or a loading spinner
  }

  if (!isAuthenticated) {
    return null
  }

  if (roles && !hasRole(roles)) {
    return null
  }

  return <>{children}</>
}

