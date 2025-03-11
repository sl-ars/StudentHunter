"use server"

import { revalidatePath } from "next/cache"

export async function uploadResume(formData: FormData) {
  try {
    const file = formData.get("resume") as File
    if (!file) {
      throw new Error("No file provided")
    }

    // Call the API to upload the resume
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/resume/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.API_SECRET_KEY}`, // Server-side API key
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload resume")
    }

    const data = await response.json()

    // Revalidate the profile page
    revalidatePath("/student/profile")

    return {
      success: true,
      message: "Resume uploaded successfully",
      url: data.url,
    }
  } catch (error) {
    console.error("Failed to upload resume:", error)
    throw new Error("Failed to upload resume")
  }
}

