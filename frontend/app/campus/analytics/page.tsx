"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { BarChart, LineChart, PieChart, Download } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

export default function CampusAnalyticsPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push("/login")
  }, [user, router])

  return (
    <ProtectedRoute roles="campus">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Placement Analytics</h1>
            <div className="flex gap-4">
              <Select defaultValue="2024">
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </Select>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { title: "Total Placements", value: "856", change: "+12%", color: "vibrant-blue" },
              { title: "Average Package", value: "$85,000", change: "+8%", color: "vibrant-green" },
              { title: "Companies Visited", value: "45", change: "+15%", color: "vibrant-orange" },
              { title: "Placement Rate", value: "92%", change: "+5%", color: "vibrant-pink" },
            ].map((stat, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={`text-xs text-${stat.color}`}>{stat.change} from last year</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Placement Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-muted rounded-md flex items-center justify-center">
                  <LineChart className="w-16 h-16 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Placement by Industry</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                  <PieChart className="w-16 h-16 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Package Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                  <BarChart className="w-16 h-16 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

