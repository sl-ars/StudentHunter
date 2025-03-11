"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building, ExternalLink } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"

export default function ApplicationsPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push("/login")
  }, [user, router])

  return (
    <ProtectedRoute roles="student">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Applications</h1>
            <Link href="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      id: "1",
                      position: "Senior Frontend Developer",
                      company: "TechCorp Inc.",
                      appliedDate: "2024-02-25",
                      status: "Under Review",
                    },
                    {
                      id: "2",
                      position: "UX Designer",
                      company: "DesignPro",
                      appliedDate: "2024-02-24",
                      status: "Interview Scheduled",
                    },
                  ].map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.position}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2" />
                          {application.company}
                        </div>
                      </TableCell>
                      <TableCell>{application.appliedDate}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            application.status === "Interview Scheduled"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {application.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link href={`/jobs/${application.id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
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

