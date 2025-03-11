"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Mail, Briefcase, Building2, Settings, PlusCircle, BarChart } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"

export default function ManagerDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push("/login")
  }, [user, router])

  return (
    <ProtectedRoute roles="manager">
      <div className="min-h-screen bg-gradient-to-b from-background via-muted to-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
            Company Manager Dashboard
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                title: "Active Jobs",
                icon: Briefcase,
                value: "12",
                change: "+3 this month",
                color: "vibrant-blue",
              },
              {
                title: "Total Applications",
                icon: FileText,
                value: "156",
                change: "+45 this week",
                color: "vibrant-green",
              },
              {
                title: "Interviews Scheduled",
                icon: Users,
                value: "8",
                change: "Next 7 days",
                color: "vibrant-orange",
              },
              {
                title: "Response Rate",
                icon: Mail,
                value: "92%",
                change: "+5% this month",
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
            {[
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
                title: "Settings",
                icon: Settings,
                description: "Configure account and notification preferences",
                link: "/manager/settings",
                color: "vibrant-yellow",
              },
            ].map((item, index) => (
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

