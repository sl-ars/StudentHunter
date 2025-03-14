"use client"

import type React from "react"

import { useState } from "react"
import { Upload, File, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { uploadResume } from "@/app/actions/resume-actions"

interface ResumeUploadProps {
  onUploadComplete: (url: string) => void
  value?: string
  isUploading?: boolean
  resumeName?: string
}

export function ResumeUpload({
  onUploadComplete,
  value,
  isUploading: externalIsUploading,
  resumeName,
}: ResumeUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<{
    name: string
    url: string
  } | null>(value ? { name: "Current Resume.pdf", url: value } : null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (file.type !== "application/pdf") {
      setError("Only PDF files are accepted")
      return
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB")
      return
    }

    setError(null)
    setIsUploading(true)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 5
      })
    }, 100)

    try {
      // Create FormData
      const formData = new FormData()
      formData.append("file", file)

      // Add resume name if provided
      if (resumeName) {
        formData.append("name", resumeName)
      }

      // Call the server action to upload the resume
      const result = await uploadResume(formData)

      if (result.success) {
        clearInterval(progressInterval)
        setUploadProgress(100)

        // Set the uploaded file info
        setUploadedFile({
          name: resumeName || file.name,
          url: result.url,
        })

        // Call the callback with the URL
        onUploadComplete(result.url)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error("Resume upload failed:", error)
      setError("Failed to upload resume. Please try again.")
    } finally {
      clearInterval(progressInterval)
      setIsUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setUploadProgress(0)
    onUploadComplete("")
  }

  // Use external isUploading state if provided
  const uploading = externalIsUploading !== undefined ? externalIsUploading : isUploading

  return (
    <div className="space-y-4">
      {!uploadedFile ? (
        <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
          <input
            type="file"
            id="resume-upload"
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <label htmlFor="resume-upload" className="flex flex-col items-center justify-center cursor-pointer">
            <Upload className="w-10 h-10 text-muted-foreground mb-2" />
            <p className="font-medium mb-1">{uploading ? "Uploading..." : "Upload your resume"}</p>
            <p className="font-medium mb-1">{uploading ? "Uploading..." : "Upload your resume"}</p>
            <p className="text-muted-foreground text-sm">PDF format only, max 5MB</p>

            {uploading && <Progress value={uploadProgress} className="w-full mt-4 h-2" />}

            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </label>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-muted rounded-lg p-3">
          <div className="flex items-center">
            <File className="w-5 h-5 text-primary mr-2" />
            <span className="text-sm font-medium truncate max-w-[200px]">{uploadedFile.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveFile}
            className="text-destructive hover:text-destructive hover:bg-transparent p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
