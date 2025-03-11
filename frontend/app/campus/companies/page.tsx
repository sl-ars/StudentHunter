"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Building2, MapPin, Users, ExternalLink } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"

export default function CampusCompaniesPage() {
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
            <h1 className="text-3xl font-bold">Partner Companies</h1>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input type="text" placeholder="Search companies" className />
                <Input type="text" placeholder="Search companies" className="pl-10" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Hiring Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      name: "TechCorp Inc.",
                      location: "San Francisco, CA",
                      size: "1000-5000",
                      status: "Active",
                    },
                    {
                      name: "DesignPro",
                      location: "New York, NY",
                      size: "100-500",
                      status: "On Hold",
                    },
                  ].map((company) => (
                    <TableRow key={company.name}>
                      <TableCell>
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-2" />
                          {company.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {company.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          {company.size}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            company.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {company.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Link href={`/companies/${company.name}`}>
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

