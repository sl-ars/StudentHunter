"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { jobsApi } from "@/lib/api/jobs"
import { JobCard } from "@/components/job-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchSavedJobs = async () => {
      setIsLoading(true)
      try {
        const response = await jobsApi.getSavedJobs()
        setSavedJobs(response.data.results)
      } catch (error) {
        console.error("Error fetching saved jobs:", error)
        toast({
          title: "Error",
          description: "Failed to load saved jobs",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSavedJobs()
  }, [toast])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The filtering is done client-side in the filteredJobs variable
  }

  const filteredJobs = savedJobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saved Jobs</h1>
          <p className="text-muted-foreground">Jobs you've saved for later</p>
        </div>

        <form onSubmit={handleSearch} className="flex w-full md:w-auto">
          <Input
            placeholder="Search saved jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mr-2 w-full md:w-[300px]"
          />
          <Button type="submit">Search</Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Saved Jobs</CardTitle>
          <CardDescription>You can apply to these jobs or remove them from your saved list</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={{ ...job, isSaved: true }} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No saved jobs found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery
                  ? "No saved jobs match your search criteria"
                  : "You haven't saved any jobs yet. Browse jobs and save the ones you're interested in."}
              </p>
              <Button asChild className="mt-4">
                <a href="/jobs">Browse Jobs</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
