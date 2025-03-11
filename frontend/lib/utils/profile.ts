import type { UserProfile } from "@/lib/types"

export function calculateProfileCompletion(profile: UserProfile): {
  percentage: number
  missingFields: string[]
} {
  const requiredFields = [
    { name: "name", label: "Full Name" },
    { name: "email", label: "Email" },
    { name: "education", label: "Education Details" },
    { name: "skills", label: "Skills" },
    { name: "resume", label: "Resume" },
    { name: "bio", label: "Professional Summary" },
  ]

  const completedFields = requiredFields.filter((field) => Boolean(profile[field.name as keyof UserProfile]))

  const percentage = Math.round((completedFields.length / requiredFields.length) * 100)
  const missingFields = requiredFields
    .filter((field) => !profile[field.name as keyof UserProfile])
    .map((field) => field.label)

  return { percentage, missingFields }
}

