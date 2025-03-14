"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Book, Video, FileText, Users, Calendar, Download, ArrowLeft, Loader2, Lock } from "lucide-react"
import Link from "next/link"
import { resourcesApi } from "@/lib/api/resources"
import type { Resource } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"

// Resource type icons mapping
const resourceIcons = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  video: Video,
  mp4: Video,
  webinar: Users,
  ebook: Book,
  epub: Book,
  article: FileText,
  workshop: Calendar,
  default: FileText,
}

export default function ResourceDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true)
        const response = await resourcesApi.getResource(id as string)

        if (response.status === "success" && response.data) {
          // Check if non-logged in user is trying to access a non-demo resource
          if (!isAuthenticated && !response.data.isDemo) {
            router.push("/login?redirect=" + encodeURIComponent(`/resources/${id}`))
            return
          }

          setResource(response.data)
        } else {
          setError("Failed to load resource")
        }
      } catch (err) {
        console.error("Error fetching resource:", err)
        setError("An error occurred while fetching the resource")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchResource()
    }
  }, [id, isAuthenticated, router])

  const handleDownload = async () => {
    if (!resource) return

    // If not logged in and not a demo resource, redirect to login
    if (!isAuthenticated && !resource.isDemo) {
      router.push("/login?redirect=" + encodeURIComponent(`/resources/${id}`))
      return
    }

    try {
      setDownloadLoading(true)
      setDownloadError(null)

      const response = await resourcesApi.downloadResource(resource.id)

      if (response.status === "success" && response.data) {
        // Handle single link
        if (response.data.link) {
          if (response.data.openInNewTab) {
            window.open(response.data.link, "_blank")
          } else {
            window.location.href = response.data.link
          }
        }

        // Handle multiple files
        if (response.data.files && response.data.files.length > 0) {
          // If there's only one file, open it directly
          if (response.data.files.length === 1) {
            const file = response.data.files[0]
            if (file.openInNewTab) {
              window.open(file.url, "_blank")
            } else {
              window.location.href = file.url
            }
          }
          // Multiple files are handled in the UI with individual download buttons
        }
      } else {
        setDownloadError("Failed to generate download link")
      }
    } catch (err) {
      console.error("Error downloading resource:", err)
      setDownloadError("An error occurred while downloading the resource")
    } finally {
      setDownloadLoading(false)
    }
  }

  // Get icon for file type
  const getFileIcon = (type: string) => {
    const fileType = type.toLowerCase()
    return resourceIcons[fileType as keyof typeof resourceIcons] || resourceIcons.default
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p>{error || "Resource not found"}</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/resources")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Resources
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back button */}
        <Button variant="ghost" className="mb-6" onClick={() => router.push("/resources")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Resources
        </Button>

        {/* Login notice for non-authenticated users */}
        {!isAuthenticated && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-2">
              <Lock className="h-5 w-5 text-blue-500 dark:text-blue-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You're viewing a demo resource.{" "}
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/resources/${id}`)}`}
                  className="font-medium underline"
                >
                  Log in
                </Link>{" "}
                to access all resources.
              </p>
            </div>
          </div>
        )}

        {/* Resource card */}
        <Card className="overflow-hidden border-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300">
                  {resource.type}
                </Badge>
                {resource.isDemo && (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                  >
                    Demo
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Published: {new Date(resource.publishedAt).toLocaleDateString()}
              </div>
            </div>
            <CardTitle className="text-2xl mt-2">{resource.title}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Calendar className="w-4 h-4 mr-1" /> {resource.estimatedTime} • By {resource.author}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="prose dark:prose-invert max-w-none">
              <p>{resource.description}</p>
              <div dangerouslySetInnerHTML={{ __html: resource.content }} />
            </div>

            {/* Resource files list */}
            {resource.links && resource.links.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Resource Files</h3>
                <div className="space-y-3">
                  {resource.links.map((link) => {
                    const FileIcon = getFileIcon(link.type)
                    return (
                      <div
                        key={link.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <FileIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium">{link.title}</p>
                            <p className="text-xs text-muted-foreground">{link.size}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900"
                          onClick={() => {
                            if (link.openInNewTab) {
                              window.open(link.url, "_blank")
                            } else {
                              window.location.href = link.url
                            }
                          }}
                        >
                          <Download className="w-4 h-4 mr-1" /> Download
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="mt-8">
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Download error */}
            {downloadError && (
              <div className="mt-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg">
                {downloadError}
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-2">
            <Button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              onClick={handleDownload}
              disabled={downloadLoading}
            >
              {downloadLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Download Link...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" /> Access Resource
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
