"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Book, Video, FileText, Users, Download, Search, Loader2, Lock } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { resourcesApi, type ResourceFilters } from "@/lib/api/resources"
import type { Resource } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"

// Resource type icons mapping
const resourceIcons = {
  Guide: FileText,
  "Video Course": Video,
  Webinar: Users,
  "E-book": Book,
  Article: FileText,
  Workshop: Video,
}

// Resource style variations
const resourceStyles = [
  { color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950" },
  { color: "text-green-500", bg: "bg-green-50 dark:bg-green-950" },
  { color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950" },
  { color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950" },
  { color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950" },
]

export default function ResourcesPage() {
  const { isAuthenticated } = useAuth()
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [resources, setResources] = useState<Resource[]>([])
  const [categories, setCategories] = useState<string[]>(["All"])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch resources and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch categories first
        const categoriesResponse = await resourcesApi.getCategories()
        if (categoriesResponse.status === "success" && categoriesResponse.data) {
          setCategories(["All", ...categoriesResponse.data])
        }

        // Prepare filters based on active category and search query
        const filters: ResourceFilters = {}
        if (activeCategory !== "All") {
          filters.category = activeCategory
        }
        if (searchQuery) {
          filters.search = searchQuery
        }

        // Fetch resources with filters, passing authentication status
        const resourcesResponse = await resourcesApi.getResources(filters, isAuthenticated)
        if (resourcesResponse.status === "success" && resourcesResponse.data) {
          setResources(resourcesResponse.data.results)
        } else {
          setError("Failed to load resources")
        }
      } catch (err) {
        console.error("Error fetching resources:", err)
        setError("An error occurred while fetching resources")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeCategory, searchQuery, isAuthenticated])

  // Handle search with debounce
  const handleSearch = (value: string) => {
    setSearchQuery(value)
  }

  // Get icon for resource type
  const getResourceIcon = (type: string) => {
    return resourceIcons[type as keyof typeof resourceIcons] || FileText
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* iOS-style header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Resources</h1>
          <p className="text-center text-muted-foreground">Discover tools to boost your career journey</p>
        </div>

        {/* Login notice for non-authenticated users */}
        {!isAuthenticated && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-2">
              <Lock className="h-5 w-5 text-blue-500 dark:text-blue-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You're viewing demo resources.{" "}
                <Link href="/login" className="font-medium underline">
                  Log in
                </Link>{" "}
                to access all resources.
              </p>
            </div>
          </div>
        )}

        {/* iOS-style search bar */}
        <div className="relative mb-6 max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder="Search resources..."
            className="pl-10 bg-white dark:bg-gray-800 rounded-full border-none shadow-sm"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* iOS-style category pills */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 pb-2 px-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === category
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-white dark:bg-gray-800 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6">{error}</div>
        )}

        {/* Empty state */}
        {!loading && !error && resources.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No resources found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
            {!isAuthenticated && (
              <p className="mt-4 text-sm text-muted-foreground">
                <Link href="/login" className="text-blue-500 hover:underline">
                  Log in
                </Link>{" "}
                to see more resources
              </p>
            )}
          </div>
        )}

        {/* iOS-style cards grid */}
        {!loading && !error && resources.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, index) => {
              const ResourceIcon = getResourceIcon(resource.type)
              const styleIndex = index % resourceStyles.length
              const style = resourceStyles[styleIndex]

              return (
                <Link key={resource.id} href={`/resources/${resource.id}`} className="block">
                  <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-md border-0 bg-white dark:bg-gray-800 rounded-xl">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-12 h-12 rounded-xl ${style.bg} ${style.color} flex items-center justify-center`}
                        >
                          <ResourceIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-lg">{resource.title}</h3>
                            {resource.isDemo && (
                              <Badge
                                variant="outline"
                                className="ml-2 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                              >
                                Demo
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{resource.type}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                              {resource.estimatedTime}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 p-0"
                            >
                              <Download className="w-4 h-4 mr-1" /> Access
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}

        {/* iOS-style featured section */}
        <div className="mt-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Need Personalized Guidance?</h2>
            <p className="mb-6 opacity-90">Book a session with our career advisors for tailored advice.</p>
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300 rounded-full px-8"
            >
              Schedule Consultation
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
