"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Building, Video } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

export default function InterviewsPage() {
  const { user } = useAuth()
  const [interviews, setInterviews] = useState([])

  useEffect(() => {
    // In a real app, you would fetch interviews from an API
    // This is just mock data for demonstration
    setInterviews([
      {
        id: 1,
        company: "TechCorp",
        position: "Frontend Developer",
        date: "2025-03-15",
        time: "10:00 AM",
        type: "Video",
      },
      { id: 2, company: "DesignPro", position: "UX Designer", date: "2025-03-18", time: "2:00 PM", type: "In-person" },
      { id: 3, company: "DataTech", position: "Data Analyst", date: "2025-03-20", time: "11:30 AM", type: "Phone" },
    ])
  }, [])

  return (
    <ProtectedRoute roles="student">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Interviews</h1>
        <div className="grid gap-6">
          {interviews.map((interview) => (
            <Card key={interview.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>
                  {interview.position} at {interview.company}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" /> {interview.date}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" /> {interview.time}
                  </span>
                  <span className="flex items-center">
                    <Building className="w-4 h-4 mr-1" /> {interview.type}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <Button variant="outline">View Details</Button>
                  {interview.type === "Video" && (
                    <Button>
                      <Video className="w-4 h-4 mr-2" />
                      Join Interview
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  )
}

