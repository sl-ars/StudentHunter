"use client"

import { useEffect, useState } from "react"
import type { Job } from "@/lib/types"
import { mockJobs } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Building, Clock, DollarSign, Briefcase, CheckCircle, BookmarkPlus, Share2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { quickApply } from "@/app/actions/job-actions"
import { JobApplicationForm } from "@/components/job-application-form"

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)

  const { user, applyToJob, saveJob, unsaveJob, hasSavedJob, hasAppliedToJob } = useAuth()
  const { toast } = useToast()
  const [canApply, setCanApply] = useState(false)
  const [canSave, setCanSave] = useState(false)

  useEffect(() => {
    // Simulate API call with setTimeout
    const timer = setTimeout(() => {
      const mockJob = mockJobs[params.id]
      if (mockJob) {
        setJob(mockJob)
      } else {
        setError("Job not found")
      }
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [params.id])

  useEffect(() => {
    if (job && user?.role === "student") {
      setCanApply(!hasAppliedToJob(job.id))
      setCanSave(!hasSavedJob(job.id))
    } else {
      setCanApply(false)
      setCanSave(false)
    }
  }, [job, user, hasAppliedToJob, hasSavedJob])

  const handleQuickApply = async () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to apply for jobs",
        variant: "destructive",
      })
      return
    }

    setShowApplicationForm(true)
  }

  const handleApplicationSubmit = async (data: any) => {
    try {
      const result = await quickApply(job!.id, {
        ...data,
        userId: user!.id,
      })

      if (!result.success) {
        throw new Error(result.message)
      }

      applyToJob(job!.id)
      setCanApply(false)
      setShowApplicationForm(false)
    } catch (error) {
      throw error
    }
  }

  const mockExistingResumes = [
    { id: "1", name: "Software Engineer Resume.pdf", url: "/resumes/1.pdf" },
    { id: "2", name: "Technical Resume.pdf", url: "/resumes/2.pdf" },
  ]

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error || !job) {
    return <ErrorState message={error || "Job not found"} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted to-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-vibrant-blue to-vibrant-purple relative">
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
              <CardHeader className="-mt-16 relative z-10">
                <div className="bg-white dark:bg-card p-6 rounded-lg shadow-lg">
                  <CardTitle className="text-3xl bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
                    {job.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-4 text-muted-foreground mt-4">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-vibrant-blue" />
                      <Link href={`/companies/${job.companyId}`} className="hover:text-vibrant-blue transition-colors">
                        {job.company}
                      </Link>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-vibrant-green" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-vibrant-orange" />
                      {job.type}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-vibrant-pink" />
                      {job.salary}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-vibrant-purple" />
                      Posted {job.postedAt}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold mb-3 text-vibrant-blue">Description</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{job.description}</p>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold mb-3 text-vibrant-green">Requirements</h2>
                  <ul className="space-y-2">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-2 text-vibrant-green flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold mb-3 text-vibrant-orange">Responsibilities</h2>
                  <ul className="space-y-2">
                    {job.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-2 text-vibrant-orange flex-shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold mb-3 text-vibrant-pink">Benefits</h2>
                  <ul className="space-y-2">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-2 text-vibrant-pink flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                {user?.role === "student" ? (
                  <>
                    <Button
                      className="w-full mb-4 bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue transition-all duration-300"
                      size="lg"
                      onClick={handleQuickApply}
                      disabled={!canApply || isApplying}
                    >
                      {isApplying ? "Applying..." : !canApply ? "Applied" : "Quick Apply"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => (canSave ? saveJob(job.id) : unsaveJob(job.id))}
                    >
                      <BookmarkPlus className="w-4 h-4 mr-2" />
                      {canSave ? "Save Job" : "Unsave Job"}
                    </Button>
                  </>
                ) : user?.role === "manager" ? (
                  <div className="space-y-4">
                    <Button className="w-full" variant="outline">
                      Edit Job
                    </Button>
                    <Button className="w-full" variant="outline">
                      View Applications
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    {user ? "Only students can apply for jobs" : "Please login to apply"}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t">
                  <Button variant="ghost" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Job
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-vibrant-purple">Similar Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add similar jobs here */}
                <p className="text-muted-foreground">Loading similar jobs...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {showApplicationForm && (
        <JobApplicationForm
          job={job}
          isOpen={showApplicationForm}
          onClose={() => setShowApplicationForm(false)}
          onSubmit={handleApplicationSubmit}
          existingResumes={mockExistingResumes}
        />
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-2/3" />
              <div className="flex flex-wrap gap-4 mt-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-32" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-11 w-full mb-4" />
              <Skeleton className="h-11 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card>
        <CardContent className="pt-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{message}</p>
          <Link href="/jobs">
            <Button>Back to Jobs</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

