"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUp, File, Trash2, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ResumeUploadProps {
  onUpload: (file: File) => Promise<void>
  currentResume?: string
}

// Change from export default to named export
export function ResumeUpload({ onUpload, currentResume }: ResumeUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        })
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      await onUpload(selectedFile)
      toast({
        title: "Resume uploaded",
        description: "Your resume has been successfully uploaded",
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currentResume && (
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div className="flex items-center space-x-2">
                <File className="h-4 w-4" />
                <span>Current Resume</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Input type="file" accept=".pdf" onChange={handleFileSelect} className="flex-1" />
            <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
              {uploading ? (
                "Uploading..."
              ) : (
                <>
                  <FileUp className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">Maximum file size: 5MB. Accepted format: PDF</p>
        </div>
      </CardContent>
    </Card>
  )
}

