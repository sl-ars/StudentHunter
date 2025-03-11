"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileText, BarChart, PieChart } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

export default function CampusReportsPage() {
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
            <h1 className="text-3xl font-bold">Reports</h1>
            <div className="flex gap-4">
              <Select defaultValue="2024">
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </Select>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Export All Reports
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Placement Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                  <PieChart className="w-16 h-16 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Salary Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                  <BarChart className="w-16 h-16 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      name: "Annual Placement Report",
                      description: "Overview of student placements for the year",
                      lastUpdated: "2024-02-28",
                    },
                    {
                      name: "Company Engagement Report",
                      description: "Analysis of company participation in campus events",
                      lastUpdated: "2024-02-25",
                    },
                    {
                      name: "Student Performance Report",
                      description: "Aggregated data on student academic and placement performance",
                      lastUpdated: "2024-02-20",
                    },
                  ].map((report) => (
                    <TableRow key={report.name}>
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          {report.name}
                        </div>
                      </TableCell>
                      <TableCell>{report.description}</TableCell>
                      <TableCell>{report.lastUpdated}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

