"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus, CheckCircle, XCircle } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

export default function CompanyProfilesPage() {
  return (
    <ProtectedRoute roles="admin">
      <div className="min-h-screen bg-gradient-to-b from-background via-muted to-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
            Company Profiles
          </h1>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input type="text" placeholder="Search companies" className="pl-10" />
                </div>
                <Button className="bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue transition-all duration-300">
                  <Plus className="w-4 h-4 mr-2" /> Add New Company
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { name: "TechCorp Inc.", industry: "Technology", location: "San Francisco, CA", verified: true },
                    { name: "GreenEnergy Solutions", industry: "Energy", location: "Austin, TX", verified: false },
                    { name: "HealthTech Innovations", industry: "Healthcare", location: "Boston, MA", verified: true },
                    { name: "FinTech Frontier", industry: "Finance", location: "New York, NY", verified: false },
                    { name: "EduLearn Systems", industry: "Education", location: "Chicago, IL", verified: true },
                  ].map((company, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.industry}</TableCell>
                      <TableCell>{company.location}</TableCell>
                      <TableCell>
                        {company.verified ? (
                          <CheckCircle className="w-5 h-5 text-vibrant-green" />
                        ) : (
                          <XCircle className="w-5 h-5 text-vibrant-pink" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-vibrant-blue hover:text-white transition-colors duration-300"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-vibrant-pink hover:text-white transition-colors duration-300"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-between items-center">
            <p className="text-muted-foreground">Showing 1-5 of 25 results</p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="hover:bg-vibrant-blue hover:text-white transition-colors duration-300"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                className="hover:bg-vibrant-purple hover:text-white transition-colors duration-300"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

