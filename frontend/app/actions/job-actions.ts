"use server"

import { revalidatePath } from "next/cache"
import { calculateProfileCompletion } from "@/lib/utils/profile"
import type { UserProfile } from "@/lib/types"
import { jobsApi } from "@/lib/api"

export async function quickApply(jobId: string, userProfile: UserProfile) {
  try {
    const { percentage, missingFields } = calculateProfileCompletion(userProfile)

    if (percentage < 70) {
      return {
        success: false,
        error: "Profile Incomplete",
        message: `Please complete your profile (${percentage}%). Missing: ${missingFields.join(", ")}`,
      }
    }

    // Call the API to submit the application
    const response = await jobsApi.apply(jobId, {
      userId: userProfile.id,
      // Add any other required fields
    })

    revalidatePath("/jobs")
    revalidatePath("/student/applications")

    return {
      success: true,
      applicationId: response.data.application_id,
      status: "pending",
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Failed to submit application:", error)
    throw new Error("Failed to submit application")
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: "accepted" | "rejected",
  comments?: string,
) {
  try {
    // Call the API to update the application status
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications/${applicationId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_SECRET_KEY}`, // Server-side API key
      },
      body: JSON.stringify({ status, comments }),
    })

    revalidatePath("/manager/applications")
    return {
      success: true,
      applicationId,
      status,
      comments,
      updatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Failed to update application:", error)
    throw new Error("Failed to update application")
  }
}

