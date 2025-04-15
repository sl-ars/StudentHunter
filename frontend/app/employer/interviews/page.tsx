"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, User } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import { employerApi } from "@/lib/api"
import { isMockEnabled } from "@/lib/utils/config"
import { toast } from "@/components/ui/use-toast"

interface Interview {
  id: string
  name: string
  position: string
  date: string
  time: string
}

export default function EmployerInterviewsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) router.push("/login")

    const fetchInterviews = async () => {
      try {
        setLoading(true)
        const response = await employerApi.getInterviews()
        setInterviews(response.data)
      } catch (error) {
        console.error("Error fetching interviews:", error)
        toast({
          title: "Error",
          description: "Failed to fetch interviews",
          variant: "destructive",
        })

        // If API call fails or mock is enabled, use mock data
        if (isMockEnabled()) {
          setInterviews([
            { id: "1", name: "Alice Johnson", position: "Frontend Developer", date: "2025-03-05", time: "10:00 AM" },
            { id: "2", name: "Bob Smith", position: "UX Designer", date: "2025-03-06", time: "2:00 PM" },
            { id: "3", name: "Carol Davis", position: "Data Analyst", date: "2025-03-07", time: "11:30 AM" },
          ])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchInterviews()
  }, [user, router])

  const handleStatusChange = async (interviewId: string, newStatus: string) => {
    try {
      await employerApi.updateInterviewStatus(interviewId, newStatus)
      fetchInterviews()
      toast({
        title: "Success",
        description: "Interview status updated successfully",
      })
    } catch (error) {
      console.error("Error updating interview status:", error)
      toast({
        title: "Error",
        description: "Failed to update interview status",
        variant: "destructive",
      })
    }
  }

  return (
    <ProtectedRoute roles="employer">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Interview Schedule</h1>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading interviews...</div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-4">No upcoming interviews scheduled</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          {interview.name}
                        </div>
                      </TableCell>
                      <TableCell>{interview.position}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          {interview.date}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          {interview.time}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
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
