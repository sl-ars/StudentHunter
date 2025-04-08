"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Filter, X } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import type { Job } from "@/lib/types"
import { JobCard } from "@/components/job-card"
import { getAll } from "@/lib/api/jobs"

export function JobSearch() {
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [jobsData, setJobsData] = useState<{
    jobs: Job[]
    currentPage: number
    totalPages: number
    totalJobs: number
  } | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [jobType, setJobType] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Active filters tracking
  const [activeFilters, setActiveFilters] = useState<{
    search: string
    location: string
    jobType: string
  }>({
    search: "",
    location: "",
    jobType: "",
  })

  // Load jobs on initial render and when filters change
  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true)
      try {
        const filters = {
          search: activeFilters.search,
          location: activeFilters.location,
          jobType: activeFilters.jobType,
          page: currentPage,
        }

        const response = await getAll(filters)
        console.log("Processed data:", response.data)
        
        // Check if response.data exists and has the expected structure
        if (response && response.data) {
          // Handle the API response structure
          if (response.data.results) {
            // Format the data to match our component's expected structure
            setJobsData({
              jobs: response.data.results,
              currentPage: currentPage,
              totalPages: Math.ceil(response.data.count / 10),
              totalJobs: response.data.count
            })
          } else if (response.data.jobs) {
            // If the API already returns the data in our expected format
            setJobsData(response.data)
          } else {
            // Fallback for unexpected data structure
            setJobsData({
              jobs: [],
              currentPage: 1,
              totalPages: 0,
              totalJobs: 0
            })
          }
        } else {
          // Handle empty response
          setJobsData({
            jobs: [],
            currentPage: 1,
            totalPages: 0,
            totalJobs: 0
          })
        }
      } catch (error) {
        console.error("Error loading jobs:", error)
        toast({
          title: "Error",
          description: "Failed to load jobs. Please try again later.",
          variant: "destructive",
        })
        // Set empty data on error
        setJobsData({
          jobs: [],
          currentPage: 1,
          totalPages: 0,
          totalJobs: 0
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadJobs()
  }, [activeFilters, currentPage, toast])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveFilters({
      ...activeFilters,
      search: searchQuery,
    })
    setCurrentPage(1)
  }

  const clearFilter = (filterName: keyof typeof activeFilters) => {
    setActiveFilters({
      ...activeFilters,
      [filterName]: "",
    })
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setActiveFilters({
      search: "",
      location: "",
      jobType: "",
    })
    setSearchQuery("")
    setLocation("")
    setJobType("")
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search jobs..."
              className="pl-10 h-12 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Location"
              className="pl-10 h-12 rounded-xl"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <select
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-input bg-background"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <Button type="submit" className="h-12 px-6 rounded-xl">
            Search
          </Button>
        </div>
      </form>

      {/* Active Filters */}
      {(activeFilters.search || activeFilters.location || activeFilters.jobType) && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.search && (
            <div className="flex items-center bg-muted px-3 py-1 rounded-full text-sm">
              <span className="mr-2">Search: {activeFilters.search}</span>
              <button
                onClick={() => clearFilter("search")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {activeFilters.location && (
            <div className="flex items-center bg-muted px-3 py-1 rounded-full text-sm">
              <span className="mr-2">Location: {activeFilters.location}</span>
              <button
                onClick={() => clearFilter("location")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {activeFilters.jobType && (
            <div className="flex items-center bg-muted px-3 py-1 rounded-full text-sm">
              <span className="mr-2">Type: {activeFilters.jobType}</span>
              <button
                onClick={() => clearFilter("jobType")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-[#2C2C2E] rounded-xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="h-12 w-12 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded-full w-3/4 mb-2"></div>
                    <div className="h-4 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded-full w-1/2"></div>
                  </div>
                  <div className="h-8 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded-full w-24"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && jobsData && jobsData.jobs && jobsData.jobs.length === 0 && (
          <div className="bg-white dark:bg-[#2C2C2E] rounded-xl shadow-sm p-8 text-center">
            <h3 className="text-xl font-semibold text-[#1C1C1E] dark:text-white mb-2">No jobs found</h3>
            <p className="text-[#8E8E93] mb-4">Try adjusting your search filters or try a different search term.</p>
            <Button
              onClick={clearAllFilters}
              className="bg-[#007AFF] dark:bg-[#0A84FF] hover:bg-[#0071E3] dark:hover:bg-[#0A84FF]/90 text-white rounded-xl"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Job List */}
        {!isLoading && jobsData && jobsData.jobs && jobsData.jobs.length > 0 && (
          <div className="space-y-4">
            {jobsData.jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && jobsData && jobsData.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: jobsData.totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="w-10 h-10 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, jobsData.totalPages))}
                disabled={currentPage === jobsData.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
