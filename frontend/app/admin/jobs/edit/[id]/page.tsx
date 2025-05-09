"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { jobsApi } from "@/lib/api/jobs"
import { JobPostingForm } from "@/components/job-posting-form"
import { useToast } from "@/hooks/use-toast"

export default function AdminEditJobPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const jobId = params.id

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true)
      try {
        const response = await jobsApi.getJobById(jobId)
        setJob(response.data)
      } catch (error) {
        console.error("Error fetching job:", error)
        toast({
          title: "Error",
          description: "Failed to load job details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (jobId) {
      fetchJob()
    }
  }, [jobId, toast])

  const handleSubmit = async (formData: any) => {
    setIsSaving(true)
    try {
      await jobsApi.updateJob(jobId, formData)
      toast({
        title: "Success",
        description: "Job posting updated successfully",
      })
      router.push("/admin/jobs")
    } catch (error) {
      console.error("Error updating job:", error)
      toast({
        title: "Error",
        description: "Failed to update job posting",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin: Edit Job Posting</h1>
          <p className="text-muted-foreground">Update the details of this job posting</p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>Make changes to the job posting below</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="flex gap-2 mt-6">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          ) : job ? (
            <JobPostingForm
              initialData={job}
              onSubmit={handleSubmit}
              isLoading={isSaving}
              submitLabel="Update Job"
              isAdmin={true}
            />
          ) : (
            <div className="text-center py-6">
              <p>Job not found or you don't have permission to edit it.</p>
              <Button onClick={handleCancel} className="mt-4">
                Go Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
