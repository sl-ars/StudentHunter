"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bookmark, ExternalLink, Building, MapPin, DollarSign } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"

export default function SavedJobsPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push("/login")
  }, [user, router])

  return (
    <ProtectedRoute roles="student">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Saved Jobs</h1>
            <Link href="/jobs">
              <Button>Browse More Jobs</Button>
            </Link>
          </div>

          <div className="grid gap-6">
            {[
              {
                id: "1",
                title: "Senior Frontend Developer",
                company: "TechCorp Inc.",
                location: "San Francisco, CA",
                salary: "$120,000 - $160,000",
                type: "Full-time",
                savedAt: "2024-02-25",
              },
              {
                id: "2",
                title: "UX Designer",
                company: "DesignPro",
                location: "Remote",
                salary: "$90,000 - $120,000",
                type: "Full-time",
                savedAt: "2024-02-24",
              },
            ].map((job) => (
              <Card key={job.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold">{job.title}</h2>
                      <div className="flex items-center text-muted-foreground">
                        <Building className="w-4 h-4 mr-2" />
                        {job.company}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {job.salary}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="icon">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                      <Link href={`/jobs/${job.id}`}>
                        <Button size="icon">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

