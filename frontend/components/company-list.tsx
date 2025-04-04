"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Users, Star, Building2, Briefcase, Globe, Filter, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import type { CompanyFilters } from "@/lib/api/companies"
import { companyApi } from "@/lib/api/companies"
import type { Company } from "@/lib/types"

export function CompanyList() {
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [companiesData, setCompaniesData] = useState<{
    companies: Company[]
    currentPage: number
    totalPages: number
    totalCompanies: number
  } | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [industry, setIndustry] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Active filters tracking
  const [activeFilters, setActiveFilters] = useState<{
    search: string
    location: string
    industry: string
  }>({
    search: "",
    location: "",
    industry: "",
  })

  // Load companies on initial render and when filters change
  useEffect(() => {
    const loadCompanies = async () => {
      setIsLoading(true)
      try {
        const filters: CompanyFilters = {
          search: activeFilters.search,
          location: activeFilters.location,
          industry: activeFilters.industry,
          page: currentPage,
        }

        // Check if mock data is enabled
        const mockEnabled = process.env.NEXT_PUBLIC_MOCK_ENABLED === "true"

        let data
        if (mockEnabled) {
          // Use mock data
          const response = await import("@/lib/mock-data/companies").then((module) => {
            // Convert mockCompanies object to array
            const companiesArray = Object.values(module.mockCompanies)

            // Simulate API response format
            return {
              companies: companiesArray,
              currentPage: currentPage,
              totalPages: Math.ceil(companiesArray.length / 10),
              totalCompanies: companiesArray.length,
            }
          })
          data = response
        } else {
          // Use real API
          const response = await companyApi.getAll(filters)
          data = {
            companies: response.data.companies,
            currentPage: response.data.currentPage,
            totalPages: response.data.totalPages,
            totalCompanies: response.data.totalCount,
          }
        }

        setCompaniesData(data)
      } catch (error) {
        console.error("Failed to load companies:", error)
        toast({
          title: "Error",
          description: "Failed to load companies. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadCompanies()
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
    if (filterName === "industry") setIndustry("")

    setCurrentPage(1)
  }

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({
      search: "",
      location: "",
      industry: "",
    })
    setSearchQuery("")
    setLocation("")
    setIndustry("")
    setCurrentPage(1)
  }

  // Get color for company card accent
  const getCompanyAccentColor = (index: number) => {
    const colors = [
      "bg-[#007AFF] dark:bg-[#0A84FF]", // Blue
      "bg-[#34C759] dark:bg-[#30D158]", // Green
      "bg-[#FF9500] dark:bg-[#FF9F0A]", // Orange
      "bg-[#FF2D55] dark:bg-[#FF375F]", // Pink
      "bg-[#AF52DE] dark:bg-[#BF5AF2]", // Purple
      "bg-[#FFCC00] dark:bg-[#FFD60A]", // Yellow
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#1C1C1E]">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-3 text-[#007AFF] dark:text-[#0A84FF]">Explore Top Companies</h1>
          <p className="text-base text-[#8E8E93] dark:text-[#AEAEB2] max-w-2xl mx-auto">
            Discover innovative companies looking for talented students like you
          </p>
        </div>

        {/* Search Form - iOS Style */}
        <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-[#2C2C2E] rounded-xl shadow-sm mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8E8E93]" size={18} />
              <Input
                type="text"
                placeholder="Search companies"
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
        {(activeFilters.search || activeFilters.location || activeFilters.industry) && (
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

            {activeFilters.industry && (
              <div className="bg-[#F2F2F7] dark:bg-[#3A3A3C] px-3 py-1 rounded-full text-sm flex items-center text-[#1C1C1E] dark:text-white">
                Industry: {activeFilters.industry}
                <button
                  onClick={() => clearFilter("industry")}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-[#2C2C2E] rounded-xl shadow-sm animate-pulse overflow-hidden">
                <div className="h-2 w-full bg-[#F2F2F7] dark:bg-[#3A3A3C]"></div>
                <div className="p-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-[#F2F2F7] dark:bg-[#3A3A3C] mr-3"></div>
                    <div className="space-y-2">
                      <div className="h-5 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded w-32"></div>
                      <div className="h-4 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded w-20"></div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="h-4 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded"></div>
                    <div className="h-4 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded"></div>
                    <div className="h-4 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded"></div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div className="h-9 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded-xl w-28"></div>
                    <div className="h-9 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded-full w-9"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && companiesData?.companies.length === 0 && (
          <div className="bg-white dark:bg-[#2C2C2E] rounded-xl shadow-sm p-8 text-center">
            <h3 className="text-xl font-semibold text-[#1C1C1E] dark:text-white mb-2">No companies found</h3>
            <p className="text-[#8E8E93] mb-4">Try adjusting your search filters or try a different search term.</p>
            <Button
              onClick={clearAllFilters}
              className="bg-[#007AFF] dark:bg-[#0A84FF] hover:bg-[#0071E3] dark:hover:bg-[#0A84FF]/90 text-white rounded-xl"
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Company Cards - iOS Style */}
        {!isLoading && companiesData?.companies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companiesData.companies.map((company: Company, index: number) => (
              <div
                key={index}
                className="bg-white dark:bg-[#2C2C2E] rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <div className={`h-2 w-full ${getCompanyAccentColor(index)}`}></div>
                <div className="p-5">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 mr-3 rounded-lg overflow-hidden bg-[#F2F2F7] dark:bg-[#3A3A3C] flex items-center justify-center">
                      <Image
                        src={company.logo || "/placeholder.svg"}
                        alt={company.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#1C1C1E] dark:text-white">{company.name}</h3>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-[#FFCC00] dark:text-[#FFD60A] mr-1" fill="currentColor" />
                        <span className="text-sm font-medium text-[#1C1C1E] dark:text-white">{company.rating}</span>
                        <span className="text-xs text-[#8E8E93] ml-1">rating</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-[#8E8E93]">
                      <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{company.industry}</span>
                    </div>
                    <div className="flex items-center text-[#8E8E93]">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{company.location}</span>
                    </div>
                    <div className="flex items-center text-[#8E8E93]">
                      <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{company.employees} employees</span>
                    </div>
                    <div className="flex items-center text-[#8E8E93]">
                      <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{company.openPositions} open positions</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-3">
                    <Link href={`/companies/${company.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border border-[#007AFF] dark:border-[#0A84FF] text-[#007AFF] dark:text-[#0A84FF] hover:bg-[#007AFF] dark:hover:bg-[#0A84FF] hover:text-white transition-colors"
                      >
                        View Profile
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-[#F2F2F7] dark:hover:bg-[#3A3A3C] text-[#8E8E93]"
                      onClick={() => window.open(company.website, "_blank")}
                    >
                      <Globe className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Login Prompt for Unregistered Users */}
        {!isAuthenticated && (
          <div className="bg-[#E5F6FF] dark:bg-[#0A84FF]/10 rounded-xl p-5 mt-6">
            <h3 className="text-lg font-semibold text-[#007AFF] dark:text-[#0A84FF] mb-2">
              Want to see more companies?
            </h3>
            <p className="text-[#1C1C1E] dark:text-white mb-4">
              Sign in or create an account to access all available companies and job opportunities.
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
        {!isLoading && isAuthenticated && companiesData && companiesData.totalPages > 1 && (
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
                Page {companiesData.currentPage} of {companiesData.totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              className="rounded-xl border border-[#007AFF] dark:border-[#0A84FF] text-[#007AFF] dark:text-[#0A84FF] hover:bg-[#007AFF] dark:hover:bg-[#0A84FF] hover:text-white transition-colors"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, companiesData.totalPages))}
              disabled={currentPage === companiesData.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
