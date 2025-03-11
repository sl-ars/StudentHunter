"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Building2, BookMarked, Send, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"
import { ResumeUpload } from "@/components/resume-upload" // Update this import
// Add this import
import { GamificationDashboard } from "@/components/gamification-dashboard"

// Define the GamificationProgress type
type GamificationProgress = {
  level: number
  currentPoints: number
  pointsToNextLevel: number
  achievements: {
    id: string
    title: string
    description: string
    points: number
    icon: string
    unlockedAt?: string
  }[]
  recentActivity: {
    type: string
    description: string
    points: number
    date: string
  }[]
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  // Add this mock data inside the component
  const mockProgress: GamificationProgress = {
    level: 3,
    currentPoints: 750,
    pointsToNextLevel: 1000,
    achievements: [
      {
        id: "1",
        title: "Profile Perfectionist",
        description: "Complete your profile to 100%",
        points: 100,
        icon: "user",
        unlockedAt: "2024-02-20",
      },
      {
        id: "2",
        title: "Application Master",
        description: "Submit 10 job applications",
        points: 200,
        icon: "send",
      },
      {
        id: "3",
        title: "Interview Ready",
        description: "Complete 5 mock interviews",
        points: 300,
        icon: "video",
      },
    ],
    recentActivity: [
      {
        type: "application",
        description: "Applied to Frontend Developer at TechCorp",
        points: 50,
        date: "2024-02-28",
      },
      {
        type: "profile",
        description: "Updated your resume",
        points: 25,
        date: "2024-02-27",
      },
      {
        type: "interview",
        description: "Completed mock interview",
        points: 75,
        date: "2024-02-26",
      },
    ],
  }

  useEffect(() => {
    if (!user) router.push("/login")
  }, [user, router])

  return (
    <ProtectedRoute roles="student">
      <div className="min-h-screen bg-gradient-to-b from-background via-muted to-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
            Student Dashboard
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { title: "Applied Jobs", icon: Send, value: "12", change: "+3 this week", color: "vibrant-blue" },
              { title: "Saved Jobs", icon: BookMarked, value: "24", change: "+5 this week", color: "vibrant-green" },
              {
                title: "Interview Invites",
                icon: Clock,
                value: "3",
                change: "2 pending",
                color: "vibrant-orange",
              },
              {
                title: "Application Status",
                icon: CheckCircle,
                value: "8/12",
                change: "66% success rate",
                color: "vibrant-pink",
              },
            ].map((stat, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 hover:bg-muted/50 overflow-hidden"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 text-${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={`text-xs text-${stat.color}`}>{stat.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Recent Applications */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" /> Recent Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      role: "Frontend Developer",
                      company: "TechCorp",
                      status: "Under Review",
                      date: "2024-02-25",
                    },
                    {
                      role: "UX Designer",
                      company: "DesignPro",
                      status: "Interviewed",
                      date: "2024-02-23",
                    },
                    {
                      role: "Software Engineer",
                      company: "StartupX",
                      status: "Rejected",
                      date: "2024-02-20",
                    },
                  ].map((application, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{application.role}</h3>
                        <p className="text-sm text-muted-foreground">{application.company}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            application.status === "Rejected"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {application.status}
                        </span>
                        <span className="text-sm text-muted-foreground">{application.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/jobs">
                  <Button className="w-full" variant="outline">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Browse Jobs
                  </Button>
                </Link>
                <Link href="/companies">
                  <Button className="w-full" variant="outline">
                    <Building2 className="w-4 h-4 mr-2" />
                    Explore Companies
                  </Button>
                </Link>
                <Link href="/account">
                  <Button className="w-full" variant="outline">
                    Update Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Upcoming Interviews */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Interviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      company: "TechCorp",
                      role: "Frontend Developer",
                      date: "2024-03-01",
                      time: "10:00 AM",
                    },
                    {
                      company: "DesignPro",
                      role: "UX Designer",
                      date: "2024-03-03",
                      time: "2:30 PM",
                    },
                  ].map((interview, index) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/50">
                      <h3 className="font-semibold">{interview.company}</h3>
                      <p className="text-sm text-muted-foreground">{interview.role}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Clock className="w-4 h-4" />
                        {interview.date} at {interview.time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Application Status */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Application Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Under Review</span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-vibrant-blue" />
                      <span>4</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Interviewed</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-vibrant-green" />
                      <span>3</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rejected</span>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-destructive" />
                      <span>2</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add this section to the student dashboard grid */}
            <Card>
              <CardHeader>
                <CardTitle>Resume & Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <ResumeUpload
                  onUpload={async (file) => {
                    // Implement resume upload logic
                    console.log("Uploading resume:", file)
                  }}
                  currentResume="/path/to/current/resume.pdf"
                />
              </CardContent>
            </Card>
            {/* Add this to the grid layout in the JSX */}
            <div className="lg:col-span-2">
              <GamificationDashboard progress={mockProgress} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

