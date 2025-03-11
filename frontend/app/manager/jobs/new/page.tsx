"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"
import { JobPostingForm } from "@/components/job-posting-form"

export default function NewJobPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push("/login")
  }, [user, router])

  return (
    <ProtectedRoute roles="manager">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Post a New Job</h1>
        <JobPostingForm
          onSubmit={async (data) => {
            // Implement job posting logic
            console.log("Posting job:", data)
          }}
        />
      </div>
    </ProtectedRoute>
  )
}

