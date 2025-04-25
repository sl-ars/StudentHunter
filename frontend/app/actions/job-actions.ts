"use server"

import { jobApi } from "@/lib/api/jobs"
import { revalidatePath } from "next/cache"

export async function saveJob(jobId: string) {
  try {
    await jobApi.saveJob(jobId)
    revalidatePath("/jobs")
    revalidatePath("/student/saved-jobs")
    return { success: true }
  } catch (error) {
    console.error("Error saving job:", error)
    return { success: false, error: "Failed to save job" }
  }
}

export async function unsaveJob(jobId: string) {
  try {
    await jobApi.unsaveJob(jobId)
    revalidatePath("/jobs")
    revalidatePath("/student/saved-jobs")
    return { success: true }
  } catch (error) {
    console.error("Error unsaving job:", error)
    return { success: false, error: "Failed to unsave job" }
  }
}

export async function applyToJob(jobId: string, applicationData: any) {
  try {
    // Call the API to submit the application
    const response = await fetch(`/api/job/${jobId}/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(applicationData),
    })

    if (!response.ok) {
      throw new Error("Failed to submit application")
    }

    revalidatePath("/jobs")
    revalidatePath("/student/applications")
    return { success: true }
  } catch (error) {
    console.error("Error applying to job:", error)
    return { success: false, error: "Failed to submit application" }
  }
}
