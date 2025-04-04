"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Mail, Briefcase, Building2, PlusCircle, BarChart, UserPlus } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"
import { managerApi } from "@/lib/api"
import { isMockEnabled } from "@/lib/utils/config"

interface DashboardStats {
  activeJobs: { value: number; change: string }
  totalApplications: { value: number; change: string }
  interviewsScheduled: { value: number; change: string }
  responseRate: { value: string; change: string }
}

export default function ManagerDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) router.push("/login")

    const fetchDashboardStats = async () => {
      try {
        setLoading(true)
        // Fetch dashboard stats from API
        const response = await managerApi.getAnalytics()

        setStats({
          activeJobs: {
            value: response.activeJobs || 0,
            change: response.jobsChange || "+0 this month",
          },
          totalApplications: {
            value: response.totalApplications || 0,
            change: response.applicationsChange || "+0 this week",
          },
          interviewsScheduled: {
            value: response.interviewsScheduled || 0,
            change: response.interviewsChange || "Next 7 days",
          },
          responseRate: {
            value: response.responseRate || "0%",
            change: response.responseRateChange || "+0% this month",
          },
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)

        // If API call fails or mock is enabled, use mock data
        if (isMockEnabled()) {
          setStats({
            activeJobs: { value: 12, change: "+3 this month" },
            totalApplications: { value: 156, change: "+45 this week" },
            interviewsScheduled: { value: 8, change: "Next 7 days" },
            responseRate: { value: "92%", change: "+5% this month" },
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [user, router])

  // Dashboard menu items - this is configuration, not mock data
  const dashboardItems = [
    {
      title: "Post New Job",
      icon: PlusCircle,
      description: "Create and publish new job listings",
      link: "/manager/jobs/new",
      color: "vibrant-blue",
    },
    {
      title: "Manage Applications",
      icon: FileText,
      description: "Review and manage candidate applications",
      link: "/manager/applications",
      color: "vibrant-green",
    },
    {
      title: "Company Profile",
      icon: Building2,
      description: "Update your company information and branding",
      link: "/manager/company",
      color: "vibrant-orange",
    },
    {
      title: "Analytics",
      icon: BarChart,
      description: "View recruitment metrics and insights",
      link: "/manager/analytics",
      color: "vibrant-pink",
    },
    {
      title: "Interview Schedule",
      icon: Users,
      description: "Manage candidate interviews and feedback",
      link: "/manager/interviews",
      color: "vibrant-purple",
    },
    {
      title: "Register Student",
      icon: UserPlus,
      description: "Create new student accounts for the platform",
      link: "/manager/register",
      color: "vibrant-yellow",
    },
  ]

  return (
    <ProtectedRoute roles="manager">
      <div className="min-h-screen bg-gradient-to-b from-background via-muted to-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
            Company Manager Dashboard
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {loading ? (
              // Loading state for stats
              Array(4)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium bg-muted h-4 w-24 rounded"></CardTitle>
                      <div className="h-4 w-4 bg-muted rounded"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded w-16"></div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:bg-muted/50 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                    <Briefcase className="h-4 w-4 text-vibrant-blue" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.activeJobs.value}</div>
                    <p className="text-xs text-vibrant-blue">{stats?.activeJobs.change}</p>
                  </CardContent>
                </Card>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:bg-muted/50 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                    <FileText className="h-4 w-4 text-vibrant-green" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalApplications.value}</div>
                    <p className="text-xs text-vibrant-green">{stats?.totalApplications.change}</p>
                  </CardContent>
                </Card>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:bg-muted/50 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Interviews Scheduled</CardTitle>
                    <Users className="h-4 w-4 text-vibrant-orange" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.interviewsScheduled.value}</div>
                    <p className="text-xs text-vibrant-orange">{stats?.interviewsScheduled.change}</p>
                  </CardContent>
                </Card>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:bg-muted/50 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                    <Mail className="h-4 w-4 text-vibrant-pink" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.responseRate.value}</div>
                    <p className="text-xs text-vibrant-pink">{stats?.responseRate.change}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardItems.map((item, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 hover:bg-muted/50 overflow-hidden"
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-full bg-${item.color} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <item.icon className="w-6 h-6" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{item.description}</p>
                  <Link href={item.link}>
                    <Button
                      className={`w-full bg-${item.color} text-white hover:bg-${item.color}/90 transition-colors duration-300`}
                    >
                      Access
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
