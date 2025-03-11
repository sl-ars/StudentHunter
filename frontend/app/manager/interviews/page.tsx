"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, User } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

export default function InterviewsPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push("/login")
  }, [user, router])

  return (
    <ProtectedRoute roles="manager">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Interview Schedule</h1>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent>
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
                {[
                  { name: "Alice Johnson", position: "Frontend Developer", date: "2025-03-05", time: "10:00 AM" },
                  { name: "Bob Smith", position: "UX Designer", date: "2025-03-06", time: "2:00 PM" },
                  { name: "Carol Davis", position: "Data Analyst", date: "2025-03-07", time: "11:30 AM" },
                ].map((interview, index) => (
                  <TableRow key={index}>
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
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}

