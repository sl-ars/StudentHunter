"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { employerApi } from "@/lib/api/employer"
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  LineChart,
  Line
} from "recharts"
import ProtectedRoute from "@/components/protected-route"

// Цветовая схема, согласованная с темой приложения
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"]

// Кастомный компонент для стилизованного тултипа
const CustomTooltip = ({ active, payload, label, className }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-md shadow-md p-2 text-sm">
        <p className="font-medium text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mt-1">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-foreground">{entry.name}: </span>
            <span className="font-medium text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Define interface for analytics data
interface AnalyticsData {
  stats?: {
    jobs: {
      total: number;
      active: number;
      filled: number;
      draft: number;
      views?: number;
    };
    applications: {
      total: number;
      pending: number;
      reviewing: number;
      accepted: number;
      rejected: number;
    };
    clicks: {
      total: number;
      applied: number;
      applyRate: number;
    };
    interviews: {
      scheduled: number;
      completed: number;
      canceled: number;
    };
  };
  analytics?: {
    jobViews: any[];
    applicationStats: any[];
    applicationStatuses: any[];
    jobStatusesData: any[];
    popularJobs: any[];
  };
  data?: {
    stats: any;
    analytics: any;
  };
}

export default function EmployerAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        
        // Use real API only
        console.log("Fetching employer analytics data...")
        const response = await employerApi.getAnalytics({ period: 'month' })
        console.log("Response received:", response)
        
        if (response.status === 'success') {
          console.log("Analytics data structure:", response.data);
          
          // Handle multiple possible response formats 
          let analyticsData = response.data as AnalyticsData;
          
          // Case 1: The API returns { data: { stats, analytics } }
          if (analyticsData?.data?.stats && analyticsData?.data?.analytics) {
            console.log("Data format 1: nested data structure");
            setStats(analyticsData.data.stats);
            setAnalytics(analyticsData.data.analytics);
          } 
          // Case 2: The API returns { stats, analytics } directly
          else if (analyticsData?.stats && analyticsData?.analytics) {
            console.log("Data format 2: direct stats and analytics");
            setStats(analyticsData.stats);
            setAnalytics(analyticsData.analytics);
          }
          // If neither format matches, show an error
          else {
            console.error("Invalid analytics data structure:", analyticsData);
            throw new Error('Invalid analytics data structure. Expected stats and analytics properties.');
          }
          
          setLoading(false);
        } else {
          console.error("API returned error or no data:", response)
          throw new Error(response.message || 'Failed to load analytics data')
        }
      } catch (err) {
        console.error("Error fetching analytics:", err)
        setError(`Could not load data from API: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again later.`)
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  // Добавляем глобальные CSS стили для Recharts
  useEffect(() => {
    // Стили для корректного отображения в темной теме
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .recharts-rectangle.recharts-bar-rectangle:hover {
        stroke: var(--background) !important;
        stroke-width: 2px;
      }
      
      .recharts-active-dot {
        stroke: var(--background) !important;
      }
      
      .recharts-area-dot {
        stroke: var(--background) !important;
      }
      
      .recharts-sector:hover {
        stroke: var(--background) !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Job Analytics</CardTitle>
            <CardDescription>Loading analytics data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="h-24 animate-pulse">
                    <CardContent className="p-6"></CardContent>
                  </Card>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="h-80 animate-pulse">
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
            <CardTitle>Job Analytics</CardTitle>
            <CardDescription>Error loading analytics data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-red-500">
              {error}
            </div>
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
            <CardTitle>Job Analytics</CardTitle>
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
    <ProtectedRoute roles="employer">
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Job Analytics</CardTitle>
            <CardDescription>View insights about your job postings and applications</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Jobs</div>
                  <div className="text-3xl font-bold mt-1">{stats.jobs.total || 0}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {stats.jobs.active || 0} active, {stats.jobs.filled || 0} filled, {stats.jobs.draft || 0} draft
                  </div>
                  <div className="w-full h-1 bg-blue-100 dark:bg-blue-900/50 mt-4 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 dark:bg-blue-400 rounded-full" 
                      style={{ width: `${stats.jobs.total ? (stats.jobs.active / stats.jobs.total * 100) : 0}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stats.jobs.active || 0} active jobs ({Math.round(stats.jobs.total ? (stats.jobs.active / stats.jobs.total * 100) : 0)}%)
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-green-600 dark:text-green-400">Applications</div>
                  <div className="text-3xl font-bold mt-1">{stats.applications.total || 0}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {stats.applications.pending || 0} pending, {stats.applications.accepted || 0} accepted
                  </div>
                  <div className="w-full h-1 bg-green-100 dark:bg-green-900/50 mt-4 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 dark:bg-green-400 rounded-full" 
                      style={{ width: `${stats.applications.total ? (stats.applications.accepted / stats.applications.total * 100) : 0}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stats.applications.accepted || 0} accepted ({Math.round(stats.applications.total ? (stats.applications.accepted / stats.applications.total * 100) : 0)}%)
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-amber-600 dark:text-amber-400">Job Views</div>
                  <div className="text-3xl font-bold mt-1">{stats.clicks.total || 0}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {stats.applications.total || 0} applications received
                  </div>
                  <div className="w-full h-1 bg-amber-100 dark:bg-amber-900/50 mt-4 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 dark:bg-amber-400 rounded-full" 
                      style={{ width: `${stats.clicks.total ? (stats.applications.total / stats.clicks.total * 100) : 0}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stats.clicks.applyRate || 0}% application rate
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Interviews</div>
                  <div className="text-3xl font-bold mt-1">{stats.interviews.scheduled || 0}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {stats.interviews.completed || 0} completed, {stats.interviews.canceled || 0} canceled
                  </div>
                  <div className="w-full h-1 bg-purple-100 dark:bg-purple-900/50 mt-4 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 dark:bg-purple-400 rounded-full" 
                      style={{ width: `${stats.interviews.scheduled ? (stats.interviews.completed / stats.interviews.scheduled * 100) : 0}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stats.interviews.completed || 0} completed ({Math.round(stats.interviews.scheduled ? (stats.interviews.completed / stats.interviews.scheduled * 100) : 0)}%)
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="jobs">Job Status</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="popular">Popular Jobs</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Job View Trends</CardTitle>
                      <CardDescription>Daily view trends for your job postings</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="w-full h-[350px]">
                        {analytics.jobViews && analytics.jobViews.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart 
                              data={analytics.jobViews}
                              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border opacity-50" />
                              <XAxis dataKey="date" className="text-foreground" />
                              <YAxis className="text-foreground" />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="views" 
                                name="Job Views" 
                                stroke="#3B82F6" 
                                activeDot={{ r: 8 }} 
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex flex-col h-full items-center justify-center p-6 text-center">
                            <p className="text-gray-500 dark:text-gray-400 mb-2">No job view data recorded yet</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">View data will appear here once users view your job postings</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Application Trends</CardTitle>
                      <CardDescription>Daily application submissions</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="w-full h-[350px]">
                        {analytics.applicationStats && analytics.applicationStats.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart 
                              data={analytics.applicationStats}
                              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border opacity-50" />
                              <XAxis dataKey="date" className="text-foreground" />
                              <YAxis className="text-foreground" />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend />
                              <Area 
                                type="monotone" 
                                dataKey="applications" 
                                name="Applications" 
                                stroke="#10B981" 
                                fill="#10B981" 
                                fillOpacity={0.2} 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex flex-col h-full items-center justify-center p-6 text-center">
                            <p className="text-gray-500 dark:text-gray-400 mb-2">No applications received yet</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">Application data will appear here once candidates apply to your jobs</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="jobs">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Status Distribution</CardTitle>
                    <CardDescription>Breakdown of your job postings by status</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="w-full h-[400px]">
                      {analytics.jobStatusesData && analytics.jobStatusesData.length > 0 && 
                       analytics.jobStatusesData.some((item: any) => item.value > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analytics.jobStatusesData}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              outerRadius={130}
                              innerRadius={60}
                              fill="#8884d8"
                              dataKey="value"
                              paddingAngle={3}
                              label={({ name, value, percent }) => 
                                `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                              }
                            >
                              {analytics.jobStatusesData.map((entry: any, index: number) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={COLORS[index % COLORS.length]} 
                                  stroke="var(--background)"
                                  strokeWidth={2}
                                />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex flex-col h-full items-center justify-center p-6 text-center">
                          <p className="text-gray-500 dark:text-gray-400 mb-2">No job status data available</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500">This chart will display your job distribution as you create jobs with different statuses</p>
                        </div>
                      )}
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
                  <CardContent className="p-6">
                    <div className="w-full h-[400px]">
                      {analytics.applicationStatuses && analytics.applicationStatuses.length > 0 && 
                       analytics.applicationStatuses.some((item: any) => item.value > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analytics.applicationStatuses}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              outerRadius={130}
                              innerRadius={60}
                              fill="#8884d8"
                              dataKey="value"
                              paddingAngle={3}
                              label={({ name, value, percent }) => 
                                `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                              }
                            >
                              {analytics.applicationStatuses.map((entry: any, index: number) => (
                                <Cell 
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                  stroke="var(--background)"
                                  strokeWidth={2}
                                />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex flex-col h-full items-center justify-center p-6 text-center">
                          <p className="text-gray-500 dark:text-gray-400 mb-2">No application status data available</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500">This chart will display application statuses as candidates apply to your jobs</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="popular">
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Jobs</CardTitle>
                    <CardDescription>Your most viewed and applied-to job postings</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {analytics.popularJobs && analytics.popularJobs.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-3 px-4">Job Title</th>
                              <th className="text-right py-3 px-4">Views</th>
                              <th className="text-right py-3 px-4">Applications</th>
                              <th className="text-right py-3 px-4">Conversion Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analytics.popularJobs.map((job: any, index: number) => (
                              <tr key={job.id} className="border-b border-border">
                                <td className="py-3 px-4">{job.title}</td>
                                <td className="text-right py-3 px-4">{job.views}</td>
                                <td className="text-right py-3 px-4">{job.applications}</td>
                                <td className="text-right py-3 px-4">{job.conversionRate}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="flex flex-col h-[300px] items-center justify-center p-6 text-center">
                        <p className="text-gray-500 dark:text-gray-400 mb-2">No popular jobs data available</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Job popularity data will appear here once jobs receive views and applications</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
} 