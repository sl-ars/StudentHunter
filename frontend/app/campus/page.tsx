"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, GraduationCap, Briefcase, BarChart, Calendar, FileText, Settings } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"

export default function CampusDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push("/login")
  }, [user, router])

  return (
    <ProtectedRoute roles="campus">
      <div className="min-h-screen bg-gradient-to-b from-background via-muted to-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
            Campus Dashboard
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { title: "Total Students", icon: Users, value: "1,234", change: "+56 this month", color: "vibrant-blue" },
              {
                title: "Partner Companies",
                icon: Building2,
                value: "89",
                change: "+12 this year",
                color: "vibrant-green",
              },
              {
                title: "Placement Rate",
                icon: GraduationCap,
                value: "76%",
                change: "+5% from last year",
                color: "vibrant-orange",
              },
              {
                title: "Active Jobs",
                icon: Briefcase,
                value: "245",
                change: "+28 this week",
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
                title: "Placement Analytics",
                icon: BarChart,
                description: "View detailed placement statistics and trends",
                link: "/campus/analytics",
                color: "vibrant-blue",
              },
              {
                title: "Event Calendar",
                icon: Calendar,
                description: "Manage campus recruitment events and schedules",
                link: "/campus/events",
                color: "vibrant-green",
              },
              {
                title: "Company Relations",
                icon: Building2,
                description: "Manage relationships with partner companies",
                link: "/campus/companies",
                color: "vibrant-orange",
              },
              {
                title: "Student Directory",
                icon: Users,
                description: "View and manage student profiles",
                link: "/campus/students",
                color: "vibrant-pink",
              },
              {
                title: "Reports",
                icon: FileText,
                description: "Generate and view placement reports",
                link: "/campus/reports",
                color: "vibrant-purple",
              },
              {
                title: "Settings",
                icon: Settings,
                description: "Configure campus portal settings",
                link: "/campus/settings",
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
                      View
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

