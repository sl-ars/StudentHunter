"use client"

import { useEffect, useState } from "react"
import type { Resource } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, User, Download, BookOpen, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { mockResources } from "@/lib/mock-data"

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-300 rounded-md mb-2"></div>
    <div className="h-4 bg-gray-300 rounded-md mb-2"></div>
    <div className="h-4 bg-gray-300 rounded-md mb-2"></div>
  </div>
)

const ErrorState = ({ message }: { message: string }) => <div className="text-red-500">Error: {message}</div>

export default function ResourceDetailPage({ params }: { params: { id: string } }) {
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const mockResource = mockResources[params.id]
      if (mockResource) {
        setResource(mockResource)
      } else {
        setError("Resource not found")
      }
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [params.id])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error || !resource) {
    return <ErrorState message={error || "Resource not found"} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted to-background">
      <div className="container mx-auto px-4 py-12">
        <Link href="/resources" className="inline-flex items-center text-vibrant-blue hover:text-vibrant-purple mb-6">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Resources
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="h-32 bg-gradient-to-r from-vibrant-blue to-vibrant-purple relative">
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
              <CardHeader className="-mt-16 relative z-10">
                <div className="bg-white dark:bg-card p-6 rounded-lg shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-vibrant-blue to-vibrant-purple text-white"
                    >
                      {resource.type}
                    </Badge>
                    <Badge variant="outline">{resource.category}</Badge>
                  </div>
                  <CardTitle className="text-3xl mb-4 bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
                    {resource.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-vibrant-blue" />
                      {resource.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-vibrant-green" />
                      {resource.publishedAt}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-vibrant-orange" />
                      {resource.estimatedTime}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold mb-3 text-vibrant-blue">Overview</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{resource.description}</p>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold mb-3 text-vibrant-green">Content</h2>
                  <div className="prose max-w-none">{resource.content}</div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="hover:bg-gradient-to-r hover:from-vibrant-blue hover:to-vibrant-purple hover:text-white transition-colors duration-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <Button
                  className="w-full mb-4 bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue transition-all duration-300"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Resource
                </Button>
                <Button
                  variant="outline"
                  className="w-full hover:bg-gradient-to-r hover:from-vibrant-green hover:to-vibrant-blue hover:text-white transition-all duration-300"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Start Learning
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-vibrant-purple">Related Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((_, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-md transition-all duration-300 hover:bg-muted/50 cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-1">Related Resource {index + 1}</h3>
                      <p className="text-sm text-muted-foreground">Short description goes here...</p>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

