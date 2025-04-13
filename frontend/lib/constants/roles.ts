export const USER_ROLES = {
  STUDENT: "student",
  EMPLOYER: "employer",
  CAMPUS: "campus",
  ADMIN: "admin",
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]