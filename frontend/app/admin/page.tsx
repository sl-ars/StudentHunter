"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Users, BarChart, FileText, Briefcase, Building, Settings } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

export default function AdminDashboard() {
  return (
    <ProtectedRoute roles="admin">
      <div className="min-h-screen bg-gradient-to-b from-background via-muted to-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
            Admin Dashboard
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { title: "Total Users", icon: Users, value: "1,234", change: "+20%", color: "vibrant-blue" },
              { title: "Active Jobs", icon: Briefcase, value: "567", change: "+5%", color: "vibrant-green" },
              { title: "New Applications", icon: FileText, value: "892", change: "+12%", color: "vibrant-orange" },
              { title: "New Users", icon: UserPlus, value: "45", change: "+8%", color: "vibrant-pink" },
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
                  <p className={`text-xs text-${stat.color}`}>{stat.change} from last month</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "User Management",
                icon: Users,
                description: "Manage user accounts, roles, and permissions.",
                link: "/admin/users",
                color: "vibrant-blue",
              },
              {
                title: "Job Listings",
                icon: Briefcase,
                description: "Review, approve, or remove job listings.",
                link: "/admin/jobs",
                color: "vibrant-green",
              },
              {
                title: "Company Profiles",
                icon: Building,
                description: "Manage and verify company profiles.",
                link: "/admin/companies",
                color: "vibrant-orange",
              },
              {
                title: "Analytics",
                icon: BarChart,
                description: "View detailed platform analytics and reports.",
                link: "/admin/analytics",
                color: "vibrant-pink",
              },
              {
                title: "Account Registration",
                icon: UserPlus,
                description: "Create new user accounts for the platform.",
                link: "/admin/register",
                color: "vibrant-purple",
              },
              {
                title: "System Settings",
                icon: Settings,
                description: "Configure platform settings and preferences.",
                link: "/admin/settings",
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
                      Manage
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

