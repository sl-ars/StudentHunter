"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { Notification } from "@/lib/types"
import { useAuth } from "./auth-context"

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (user) {
      // In a real app, fetch notifications from API
      // For now, we'll use mock data
      setNotifications([
        {
          id: "1",
          userId: user.id,
          type: "application",
          title: "Application Reviewed",
          message: "Your application for Frontend Developer at TechCorp has been reviewed.",
          read: false,
          createdAt: new Date().toISOString(),
          link: "/student/applications",
        },
        // Add more mock notifications...
      ])
    }
  }, [user])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const addNotification = (notification: Omit<Notification, "id" | "createdAt">) => {
    setNotifications((prev) => [
      {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

