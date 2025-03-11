"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, User, GraduationCap, ExternalLink } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"

export default function CampusStudentsPage() {
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
            <h1 className="text-3xl font-bold">Student Directory</h1>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input type="text" placeholder="Search students" className="pl-10" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Major</TableHead>
                    <TableHead>Graduation Year</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      name: "John Doe",
                      major: "Computer Science",
                      graduationYear: "2025",
                      status: "Active",
                    },
                    {
                      name: "Jane Smith",
                      major: "Business Administration",
                      graduationYear: "2024",
                      status: "Placed",
                    },
                  ].map((student) => (
                    <TableRow key={student.name}>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          {student.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <GraduationCap className="w-4 h-4 mr-2" />
                          {student.major}
                        </div>
                      </TableCell>
                      <TableCell>{student.graduationYear}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            student.status === "Active" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {student.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Link href={`/students/${student.name}`}>
                            <Button size="icon" variant="ghost">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
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

