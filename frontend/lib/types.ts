export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: string
  salary: string
  description: string
  requirements: string[]
  responsibilities: string[]
  benefits: string[]
  postedAt: string
  companyId: string
  applicationQuestions: ApplicationQuestion[] // Add this
}

export interface Company {
  id: string
  name: string
  description: string
  industry: string
  location: string
  size: string
  founded: string
  website: string
  logo: string
  benefits: string[]
  culture: string
  jobs: Job[]
}

export interface Resource {
  id: string
  title: string
  type: string
  description: string
  content: string
  author: string
  publishedAt: string
  estimatedTime: string
  category: string
  tags: string[]
}

export type UserRole = "admin" | "campus" | "student" | "manager"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  savedJobs?: string[]
  appliedJobs?: string[]
  followedCompanies?: string[]
}

export type NotificationType = "application" | "message" | "interview" | "achievement"

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
  data?: Record<string, any>
}

export interface Achievement {
  id: string
  title: string
  description: string
  points: number
  icon: string
  unlockedAt?: string
}

export interface GamificationProgress {
  level: number
  currentPoints: number
  pointsToNextLevel: number
  achievements: Achievement[]
  recentActivity: {
    type: "application" | "profile" | "interview" | "resume"
    description: string
    points: number
    date: string
  }[]
}

export interface UserProfile extends User {
  achievements: Achievement[]
  points: number
  level: number
  applications: {
    id: string
    jobId: string
    status: "pending" | "reviewed" | "interview" | "accepted" | "rejected"
    appliedAt: string
    lastUpdated: string
  }[]
}

// Add these new types
export type QuestionType = "text" | "multipleChoice" | "singleChoice"

export interface ApplicationQuestion {
  id: string
  type: QuestionType
  question: string
  required: boolean
  options?: string[] // For multiple/single choice questions
}

// Add this new interface
export interface JobApplication {
  id: string
  jobId: string
  userId: string
  resumeUrl: string
  answers: {
    questionId: string
    answer: string
  }[]
  status: "pending" | "reviewing" | "accepted" | "rejected"
  appliedAt: string
  updatedAt: string
}

