"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { JobApplicationForm } from "./job-application-form"
import type { Job } from "@/lib/types"

interface QuickApplyButtonProps {
  job: Job
  onSuccess?: () => void
  variant?: "default" | "outline" | "ghost"
  className?: string
}

export function QuickApplyButton({ job, onSuccess, variant = "default", className }: QuickApplyButtonProps) {
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const { user, applyToJob } = useAuth()
  const { toast } = useToast()

  // Add campus-specific questions
  const campusQuestions = [
    {
      id: "campus-1",
      type: "text" as const,
      question: "What is your current GPA?",
      required: true,
    },
    {
      id: "campus-2",
      type: "singleChoice" as const,
      question: "Are you eligible for work in this location?",
      required: true,
      options: ["Yes", "No", "Need Visa Sponsorship"],
    },
    {
      id: "campus-3",
      type: "multipleChoice" as const,
      question: "Which career services have you utilized?",
      required: false,
      options: ["Resume Review", "Mock Interviews", "Career Counseling", "Career Fairs", "Networking Events"],
    },
  ]

  // Combine job questions with campus questions
  const allQuestions = [...(job.applicationQuestions || []), ...campusQuestions]

  const handleQuickApply = () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to apply for jobs",
        variant: "destructive",
      })
      return
    }

    if (user.role !== "student") {
      toast({
        title: "Not allowed",
        description: "Only students can apply for jobs",
        variant: "destructive",
      })
      return
    }

    setShowApplicationForm(true)
  }

  const handleApplicationSubmit = async (data: any) => {
    setIsApplying(true)
    try {
      // Validate required fields
      const missingFields = []
      if (!data.resumeId && !data.newResume) {
        missingFields.push("Resume")
      }

      const unansweredRequired = allQuestions.filter((q) => q.required && !data.answers[q.id]).map((q) => q.question)

      if (unansweredRequired.length > 0) {
        missingFields.push(...unansweredRequired)
      }

      if (missingFields.length > 0) {
        toast({
          title: "Missing required fields",
          description: `Please complete the following: ${missingFields.join(", ")}`,
          variant: "destructive",
        })
        return
      }

      // Submit application
      const formData = new FormData()
      formData.append("jobId", job.id)
      formData.append("userId", user.id)
      if (data.newResume) {
        formData.append("resume", data.newResume)
      }
      if (data.resumeId) {
        formData.append("resumeId", data.resumeId)
      }
      formData.append("answers", JSON.stringify(data.answers))

      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      applyToJob(job.id)
      toast({
        title: "Application submitted!",
        description: "Your application has been successfully submitted.",
      })
      setShowApplicationForm(false)
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsApplying(false)
    }
  }

  const mockExistingResumes = [
    { id: "1", name: "Software Engineer Resume.pdf", url: "/resumes/1.pdf" },
    { id: "2", name: "Technical Resume.pdf", url: "/resumes/2.pdf" },
  ]

  return (
    <>
      <Button
        variant={variant}
        className={`${className} relative overflow-hidden transition-all duration-300 hover:scale-105`}
        onClick={handleQuickApply}
        disabled={isApplying}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-vibrant-blue to-vibrant-purple opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        {isApplying ? "Applying..." : "Quick Apply"}
      </Button>

      {showApplicationForm && (
        <JobApplicationForm
          job={{
            ...job,
            applicationQuestions: allQuestions,
          }}
          isOpen={showApplicationForm}
          onClose={() => setShowApplicationForm(false)}
          onSubmit={handleApplicationSubmit}
          existingResumes={mockExistingResumes}
        />
      )}
    </>
  )
}

