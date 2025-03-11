"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, MapPin, DollarSign } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"

export default function JobMatchesPage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])

  useEffect(() => {
    // In a real app, you would fetch job matches from an API
    // This is just mock data for demonstration
    setMatches([
      {
        id: 1,
        title: "Frontend Developer",
        company: "TechCorp",
        location: "San Francisco, CA",
        salary: "$100k - $130k",
        matchPercentage: 95,
      },
      {
        id: 2,
        title: "UX Designer",
        company: "DesignPro",
        location: "New York, NY",
        salary: "$80k - $110k",
        matchPercentage: 88,
      },
      {
        id: 3,
        title: "Data Analyst",
        company: "DataTech",
        location: "Chicago, IL",
        salary: "$70k - $90k",
        matchPercentage: 82,
      },
    ])
  }, [])

  return (
    <ProtectedRoute roles="student">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Job Matches</h1>
        <div className="grid gap-6">
          {matches.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{job.title}</span>
                  <span className="text-vibrant-green">{job.matchPercentage}% Match</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{job.company}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" /> {job.location}
                  </span>
                  <span className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" /> {job.salary}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <Link href={`/jobs/${job.id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                  <Button>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Quick Apply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  )
}

