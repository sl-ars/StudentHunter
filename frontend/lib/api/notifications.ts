import apiClient from "./client"
import type { Notification } from "@/lib/types"

export interface NotificationListResponse {
  count: number
  unread_count: number
  results: Notification[]
}

export const notificationsApi = {
  getNotifications: async () => {
    const response = await apiClient.get<NotificationListResponse>("/notifications/")
    return response.data
  },

  markAsRead: async (id: string) => {
    const response = await apiClient.post<{ success: boolean }>(`/notifications/${id}/read/`)
    return response.data
  },

  markAllAsRead: async () => {
    const response = await apiClient.post<{ success: boolean }>("/notifications/read-all/")
    return response.data
  },
}

