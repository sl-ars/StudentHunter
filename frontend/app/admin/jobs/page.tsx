"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { jobsApi } from "@/lib/api/jobs"
import { useToast } from "@/hooks/use-toast"
import { MoreHorizontal, Plus, Search, RefreshCw } from "lucide-react"

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  const fetchJobs = async (page = 1, search = "") => {
    setIsLoading(true)
    try {
      const response = await jobsApi.getJobs({
        page,
        limit: 10,
        search,
      })
      setJobs(response.data.results)
      setTotalPages(Math.ceil(response.data.count / 10))
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs(currentPage, searchQuery)
  }, [currentPage, toast])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchJobs(1, searchQuery)
  }

  const handleRefresh = () => {
    fetchJobs(currentPage, searchQuery)
  }

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      try {
        await jobsApi.deleteJob(jobId)
        toast({
          title: "Success",
          description: "Job deleted successfully",
        })
        fetchJobs(currentPage, searchQuery)
      } catch (error) {
        console.error("Error deleting job:", error)
        toast({
          title: "Error",
          description: "Failed to delete job",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Jobs</h1>
          <p className="text-muted-foreground">View and manage all job postings</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild>
            <Link href="/admin/jobs/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New Job
            </Link>
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>All Jobs</CardTitle>
              <CardDescription>Manage job postings across all companies</CardDescription>
            </div>

            <form onSubmit={handleSearch} className="flex w-full md:w-auto">
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mr-2"
              />
              <Button type="submit" variant="secondary">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-[250px]" />
                <Skeleton className="h-10 w-[200px]" />
              </div>
              <div className="border rounded-lg">
                <div className="h-12 px-4 border-b flex items-center">
                  <Skeleton className="h-4 w-full" />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 px-4 border-b flex items-center">
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2">
                <Skeleton className="h-10 w-[100px]" />
                <Skeleton className="h-10 w-[100px]" />
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Posted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.length > 0 ? (
                      jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell>{job.company.name}</TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell>{job.type}</TableCell>
                          <TableCell>
                            <Badge variant={job.status === "Active" ? "success" : "secondary"}>{job.status}</Badge>
                          </TableCell>
                          <TableCell>{new Date(job.postedAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/jobs/${job.id}`}>View</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/jobs/edit/${job.id}`}>Edit</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteJob(job.id)}>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6">
                          No jobs found. Try adjusting your search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
