"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, LineChart, PieChart } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

export default function AnalyticsPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push("/login")
  }, [user, router])

  return (
    <ProtectedRoute roles="manager">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Recruitment Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Applications Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <LineChart className="w-16 h-16 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Application Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <PieChart className="w-16 h-16 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Hiring Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <BarChart className="w-16 h-16 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

