"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, User, Calendar, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ProtectedRoute from "@/components/protected-route"

export default function ApplicationsPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push("/login")
  }, [user, router])

  return (
    <ProtectedRoute roles="manager">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Manage Applications</h1>
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "John Doe", position: "Frontend Developer", date: "2025-03-01", status: "New" },
                  { name: "Jane Smith", position: "UX Designer", date: "2025-02-28", status: "In Review" },
                  { name: "Bob Johnson", position: "Data Analyst", date: "2025-02-27", status: "Interviewed" },
                ].map((application, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        {application.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        {application.position}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        {application.date}
                      </div>
                    </TableCell>
                    <TableCell>{application.status}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Schedule Interview</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Reject</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}

