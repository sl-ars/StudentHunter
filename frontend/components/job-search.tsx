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

        // Check if mock data is enabled
        const mockEnabled = process.env.NEXT_PUBLIC_MOCK_ENABLED === "true"

        let data
        if (mockEnabled) {
          // Use mock data
          const response = await import("@/lib/mock-data/jobs").then((module) => {
            // Convert mockJobs object to array
            const jobsArray = Object.values(module.mockJobs)

            // Simulate API response format
            return {
              jobs: jobsArray,
              currentPage: currentPage,
              totalPages: Math.ceil(jobsArray.length / 10),
              totalJobs: jobsArray.length,
            }
          })
          data = response
        } else {
          // Use real API
          const response = await getAll(filters)
          data = {
            jobs: response.data.jobs,
            currentPage: response.data.currentPage,
            totalPages: response.data.totalPages,
            totalJobs: response.data.totalCount,
          }
        }

        setJobsData(data)
      } catch (error) {
        console.error("Failed to load jobs:", error)
        toast({
          title: "Error",
          description: "Failed to load jobs. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadJobs()
  }, [activeFilters, currentPage, isAuthenticated, toast])

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveFilters({
      ...activeFilters,
      search: searchQuery,
      location,
    })
    setCurrentPage(1)
  }

  // Clear a specific filter
  const clearFilter = (filterName: keyof typeof activeFilters) => {
    setActiveFilters({
      ...activeFilters,
      [filterName]: "",
    })

    // Also reset the corresponding input
    if (filterName === "search") setSearchQuery("")
    if (filterName === "location") setLocation("")
    if (filterName === "jobType") setJobType("")

    setCurrentPage(1)
  }

  // Clear all filters
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
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#1C1C1E]">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-3 text-[#007AFF] dark:text-[#0A84FF]">Find Your Dream Job</h1>
          <p className="text-base text-[#8E8E93] dark:text-[#AEAEB2] max-w-2xl mx-auto">
            Discover opportunities that match your skills and career goals
          </p>
        </div>

        {/* Search Form - iOS Style */}
        <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-[#2C2C2E] rounded-xl shadow-sm mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8E8E93]" size={18} />
              <Input
                type="text"
                placeholder="Search jobs"
                className="pl-10 bg-[#F2F2F7] dark:bg-[#3A3A3C] border-0 rounded-xl h-12 text-[#1C1C1E] dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-grow relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8E8E93]" size={18} />
              <Input
                type="text"
                placeholder="Location"
                className="pl-10 bg-[#F2F2F7] dark:bg-[#3A3A3C] border-0 rounded-xl h-12 text-[#1C1C1E] dark:text-white"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="h-12 px-6 bg-[#007AFF] dark:bg-[#0A84FF] hover:bg-[#0071E3] dark:hover:bg-[#0A84FF]/90 text-white rounded-xl"
            >
              Search
            </Button>
          </div>
        </form>

        {/* Active Filters */}
        {(activeFilters.search || activeFilters.location || activeFilters.jobType) && (
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="bg-[#E5F6FF] dark:bg-[#0A84FF]/20 text-[#007AFF] dark:text-[#0A84FF] px-3 py-1 rounded-full text-sm flex items-center">
              <Filter size={14} className="mr-1" /> Filters:
            </div>

            {activeFilters.search && (
              <div className="bg-[#F2F2F7] dark:bg-[#3A3A3C] px-3 py-1 rounded-full text-sm flex items-center text-[#1C1C1E] dark:text-white">
                Search: {activeFilters.search}
                <button
                  onClick={() => clearFilter("search")}
                  className="ml-1 text-[#8E8E93] hover:text-[#FF3B30] dark:hover:text-[#FF453A]"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {activeFilters.location && (
              <div className="bg-[#F2F2F7] dark:bg-[#3A3A3C] px-3 py-1 rounded-full text-sm flex items-center text-[#1C1C1E] dark:text-white">
                Location: {activeFilters.location}
                <button
                  onClick={() => clearFilter("location")}
                  className="ml-1 text-[#8E8E93] hover:text-[#FF3B30] dark:hover:text-[#FF453A]"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {activeFilters.jobType && (
              <div className="bg-[#F2F2F7] dark:bg-[#3A3A3C] px-3 py-1 rounded-full text-sm flex items-center text-[#1C1C1E] dark:text-white">
                Job Type: {activeFilters.jobType}
                <button
                  onClick={() => clearFilter("jobType")}
                  className="ml-1 text-[#8E8E93] hover:text-[#FF3B30] dark:hover:text-[#FF453A]"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <button onClick={clearAllFilters} className="text-[#FF3B30] dark:text-[#FF453A] text-sm hover:underline">
              Clear All
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white dark:bg-[#2C2C2E] rounded-xl shadow-sm animate-pulse p-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-[#F2F2F7] dark:bg-[#3A3A3C] mr-3"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded w-3/4"></div>
                    <div className="h-4 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded w-1/2"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="h-4 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded"></div>
                  <div className="h-4 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded"></div>
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="h-8 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded-full w-24"></div>
                  <div className="h-8 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded-full w-24"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && jobsData?.jobs.length === 0 && (
          <div className="bg-white dark:bg-[#2C2C2E] rounded-xl shadow-sm p-8 text-center">
            <h3 className="text-xl font-semibold text-[#1C1C1E] dark:text-white mb-2">No jobs found</h3>
            <p className="text-[#8E8E93] mb-4">Try adjusting your search filters or try a different search term.</p>
            <Button
              onClick={clearAllFilters}
              className="bg-[#007AFF] dark:bg-[#0A84FF] hover:bg-[#0071E3] dark:hover:bg-[#0A84FF]/90 text-white rounded-xl"
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Job Cards */}
        {!isLoading && jobsData?.jobs.length > 0 && (
          <div className="space-y-4">
            {jobsData.jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* Login Prompt for Unregistered Users */}
        {!isAuthenticated && (
          <div className="bg-[#E5F6FF] dark:bg-[#0A84FF]/10 rounded-xl p-5 mt-6">
            <h3 className="text-lg font-semibold text-[#007AFF] dark:text-[#0A84FF] mb-2">
              Want to see more job opportunities?
            </h3>
            <p className="text-[#1C1C1E] dark:text-white mb-4">
              Sign in or create an account to access all available jobs and apply directly.
            </p>
            <div className="flex gap-3">
              <Link href="/login">
                <Button className="bg-[#007AFF] dark:bg-[#0A84FF] hover:bg-[#0071E3] dark:hover:bg-[#0A84FF]/90 text-white rounded-xl">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  className="border-[#007AFF] dark:border-[#0A84FF] text-[#007AFF] dark:text-[#0A84FF] hover:bg-[#007AFF] dark:hover:bg-[#0A84FF] hover:text-white rounded-xl"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Pagination - Only show for authenticated users */}
        {!isLoading && isAuthenticated && jobsData && jobsData.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              className="mr-2 rounded-xl border border-[#007AFF] dark:border-[#0A84FF] text-[#007AFF] dark:text-[#0A84FF] hover:bg-[#007AFF] dark:hover:bg-[#0A84FF] hover:text-white transition-colors"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center mx-2">
              <span className="text-[#8E8E93] dark:text-[#AEAEB2]">
                Page {jobsData.currentPage} of {jobsData.totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              className="rounded-xl border border-[#007AFF] dark:border-[#0A84FF] text-[#007AFF] dark:text-[#0A84FF] hover:bg-[#007AFF] dark:hover:bg-[#0A84FF] hover:text-white transition-colors"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, jobsData.totalPages))}
              disabled={currentPage === jobsData.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
