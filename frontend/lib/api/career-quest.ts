import apiClient from "./client"
import type { GamificationProgress } from "@/lib/types"

export interface Quest {
  id: string
  title: string
  description: string
  exp: number
  completed: boolean
  progress?: number
}

export interface QuestCompleteResponse {
  success: boolean
  exp: number
  newAchievements: {
    id: string
    title: string
    description: string
    points: number
    icon: string
  }[]
}

export const careerQuestApi = {
  getProgress: async () => {
    const response = await apiClient.get<GamificationProgress>("/career-quest/progress/")
    return response.data
  },

  getQuests: async () => {
    const response = await apiClient.get<Quest[]>("/career-quest/quests/")
    return response.data
  },

  completeQuest: async (id: string) => {
    const response = await apiClient.post<QuestCompleteResponse>(`/career-quest/quests/${id}/complete/`)
    return response.data
  },
}

