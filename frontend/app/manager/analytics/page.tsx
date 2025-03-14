"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, LineChart, PieChart } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import { managerApi } from "@/lib/api"
import { isMockEnabled } from "@/lib/utils/config"

interface AnalyticsData {
  applicationTrend: any[]
  applicationSources: any[]
  hiringFunnel: any[]
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) router.push("/login")

    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await managerApi.getAnalytics()

        setAnalyticsData({
          applicationTrend: response.applicationTrend || [],
          applicationSources: response.applicationSources || [],
          hiringFunnel: response.hiringFunnel || [],
        })
      } catch (error) {
        console.error("Error fetching analytics:", error)

        // If API call fails or mock is enabled, use mock data
        if (isMockEnabled()) {
          setAnalyticsData({
            applicationTrend: [],
            applicationSources: [],
            hiringFunnel: [],
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
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
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <LineChart className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Application Sources</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <PieChart className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Hiring Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <BarChart className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
