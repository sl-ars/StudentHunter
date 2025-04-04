"use server"
import { resumeApi } from "@/lib/api/resume"
import { revalidatePath } from "next/cache"

export async function uploadResume(formData: FormData) {
  try {
    const file = formData.get("file") as File
    const name = formData.get("name") as string

    if (!file) {
      return {
        success: false,
        message: "No file provided",
      }
    }

    const response = await resumeApi.uploadResume(file, name || undefined)

    if (response.status === "success") {
      revalidatePath("/student/profile")
      revalidatePath("/student/resumes")

      return {
        success: true,
        url: response.data.url,
        message: "Resume uploaded successfully",
      }
    } else {
      return {
        success: false,
        message: response.message || "Failed to upload resume",
      }
    }
  } catch (error) {
    console.error("Error uploading resume:", error)
    return {
      success: false,
      message: "Failed to upload resume",
    }
  }
}

export async function getUserResumes() {
  try {
    const response = await resumeApi.getUserResumes()

    if (response.status === "success") {
      return {
        success: true,
        data: response.data,
        message: "Resumes retrieved successfully",
      }
    } else {
      return {
        success: false,
        data: [],
        message: response.message || "Failed to retrieve resumes",
      }
    }
  } catch (error) {
    console.error("Error getting user resumes:", error)
    return {
      success: false,
      data: [],
      message: "Failed to retrieve resumes",
    }
  }
}

export async function deleteResume(resumeId: string) {
  try {
    const response = await resumeApi.deleteResume(resumeId)

    if (response.status === "success") {
      revalidatePath("/student/profile")
      revalidatePath("/student/resumes")

      return {
        success: true,
        message: "Resume deleted successfully",
      }
    } else {
      return {
        success: false,
        message: response.message || "Failed to delete resume",
      }
    }
  } catch (error) {
    console.error("Error deleting resume:", error)
    return {
      success: false,
      message: "Failed to delete resume",
    }
  }
}

export async function setDefaultResume(resumeId: string) {
  try {
    const response = await resumeApi.setDefaultResume(resumeId)

    if (response.status === "success") {
      revalidatePath("/student/profile")
      revalidatePath("/student/resumes")

      return {
        success: true,
        message: "Default resume set successfully",
      }
    } else {
      return {
        success: false,
        message: response.message || "Failed to set default resume",
      }
    }
  } catch (error) {
    console.error("Error setting default resume:", error)
    return {
      success: false,
      message: "Failed to set default resume",
    }
  }
}

export async function renameResume(resumeId: string, newName: string) {
  try {
    const response = await resumeApi.renameResume(resumeId, newName)

    if (response.status === "success") {
      revalidatePath("/student/profile")
      revalidatePath("/student/resumes")

      return {
        success: true,
        message: "Resume renamed successfully",
      }
    } else {
      return {
        success: false,
        message: response.message || "Failed to rename resume",
      }
    }
  } catch (error) {
    console.error("Error renaming resume:", error)
    return {
      success: false,
      message: "Failed to rename resume",
    }
  }
}
