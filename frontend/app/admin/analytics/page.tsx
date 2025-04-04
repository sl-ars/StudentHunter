"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adminApi } from "@/lib/api/admin"
import { isMockEnabled } from "@/lib/utils/config"
import { mockAdminAnalytics, mockAdminStats } from "@/lib/mock-data/admin"
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        if (isMockEnabled()) {
          // Use mock data
          setAnalytics(mockAdminAnalytics)
          setStats(mockAdminStats)
          setLoading(false)
          return
        }

        // Use real API
        const response = await adminApi.getAnalytics()
        setAnalytics(response.data.data.analytics)
        setStats(response.data.data.stats)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching analytics:", err)
        setError("Failed to load analytics. Please try again later.")
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Platform Analytics</CardTitle>
            <CardDescription>Loading analytics data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="h-24 animate-pulse bg-gray-100">
                    <CardContent className="p-6"></CardContent>
                  </Card>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="h-80 animate-pulse bg-gray-100">
                    <CardContent className="p-6"></CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Platform Analytics</CardTitle>
            <CardDescription>Error loading analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analytics || !stats) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Platform Analytics</CardTitle>
            <CardDescription>No analytics data available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              No analytics data is currently available. Please check back later.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Platform Analytics</CardTitle>
          <CardDescription>Comprehensive analytics and statistics for the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-gray-500">Total Users</div>
                <div className="text-3xl font-bold mt-1">{stats.users.total}</div>
                <div className="text-xs text-gray-500 mt-2">
                  {stats.users.students} students, {stats.users.employers} employers
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-gray-500">Total Jobs</div>
                <div className="text-3xl font-bold mt-1">{stats.jobs.total}</div>
                <div className="text-xs text-gray-500 mt-2">
                  {stats.jobs.active} active, {stats.jobs.filled} filled
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-gray-500">Applications</div>
                <div className="text-3xl font-bold mt-1">{stats.applications.total}</div>
                <div className="text-xs text-gray-500 mt-2">
                  {stats.applications.pending} pending, {stats.applications.accepted} accepted
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-gray-500">Companies</div>
                <div className="text-3xl font-bold mt-1">{stats.companies.total}</div>
                <div className="text-xs text-gray-500 mt-2">{stats.companies.verified} verified</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="growth">
            <TabsList className="mb-4">
              <TabsTrigger value="growth">User Growth</TabsTrigger>
              <TabsTrigger value="jobs">Job Statistics</TabsTrigger>
              <TabsTrigger value="distribution">User Distribution</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
            </TabsList>

            <TabsContent value="growth">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Monthly user registration trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ChartContainer
                      config={{
                        count: {
                          label: "User Count",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics.userGrowth}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Line type="monotone" dataKey="count" stroke="var(--color-count)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jobs">
              <Card>
                <CardHeader>
                  <CardTitle>Job Statistics</CardTitle>
                  <CardDescription>Monthly job posting and filling trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ChartContainer
                      config={{
                        posted: {
                          label: "Jobs Posted",
                          color: "hsl(var(--chart-1))",
                        },
                        filled: {
                          label: "Jobs Filled",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.jobStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar dataKey="posted" fill="var(--color-posted)" />
                          <Bar dataKey="filled" fill="var(--color-filled)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="distribution">
              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>Distribution of users by role</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.userDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {analytics.userDistribution.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} users`, "Count"]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <CardTitle>Application Status</CardTitle>
                  <CardDescription>Distribution of applications by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Pending", value: stats.applications.pending },
                            { name: "Reviewing", value: stats.applications.reviewing },
                            { name: "Accepted", value: stats.applications.accepted },
                            { name: "Rejected", value: stats.applications.rejected },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#FFBB28" />
                          <Cell fill="#0088FE" />
                          <Cell fill="#00C49F" />
                          <Cell fill="#FF8042" />
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} applications`, "Count"]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
