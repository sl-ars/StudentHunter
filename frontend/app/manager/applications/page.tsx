"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, User, Calendar, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ProtectedRoute from "@/components/protected-route"
import { managerApi } from "@/lib/api"
import { isMockEnabled } from "@/lib/utils/config"

interface Application {
  id: string
  name: string
  position: string
  date: string
  status: string
}

export default function ApplicationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) router.push("/login")

    const fetchApplications = async () => {
      try {
        setLoading(true)
        const response = await managerApi.getApplications()

        // Transform API response to match our component's expected format
        const formattedApplications = response.results.map((app: any) => ({
          id: app.id,
          name: app.applicantName || app.userName || "Applicant",
          position: app.jobTitle || app.position || "Position",
          date: app.appliedDate || app.createdAt || "Unknown date",
          status: app.status || "New",
        }))

        setApplications(formattedApplications)
      } catch (error) {
        console.error("Error fetching applications:", error)

        // If API call fails or mock is enabled, use mock data
        if (isMockEnabled()) {
          setApplications([
            { id: "1", name: "John Doe", position: "Frontend Developer", date: "2025-03-01", status: "New" },
            { id: "2", name: "Jane Smith", position: "UX Designer", date: "2025-02-28", status: "In Review" },
            { id: "3", name: "Bob Johnson", position: "Data Analyst", date: "2025-02-27", status: "Interviewed" },
          ])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [user, router])

  return (
    <ProtectedRoute roles="manager">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Manage Applications</h1>
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="text-center py-4">No applications found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          {application.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          {application.position}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          {application.date}
                        </div>
                      </TableCell>
                      <TableCell>{application.status}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Schedule Interview</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Reject</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
