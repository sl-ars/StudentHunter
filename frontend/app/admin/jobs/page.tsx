"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ProtectedRoute from "@/components/protected-route"

export default function JobListingsPage() {
  return (
    <ProtectedRoute roles="admin">
      <div className="min-h-screen bg-gradient-to-b from-background via-muted to-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
            Job Listings
          </h1>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input type="text" placeholder="Search jobs" className="pl-10" />
                </div>
                <Button className="bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue transition-all duration-300">
                  <Plus className="w-4 h-4 mr-2" /> Add New Job
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      title: "Frontend Developer",
                      company: "TechCorp",
                      location: "San Francisco, CA",
                      status: "Active",
                    },
                    { title: "UX Designer", company: "DesignPro", location: "New York, NY", status: "Pending" },
                    { title: "Data Scientist", company: "DataTech", location: "Boston, MA", status: "Active" },
                    { title: "Product Manager", company: "InnovateCo", location: "Austin, TX", status: "Closed" },
                    { title: "Marketing Specialist", company: "GrowthHub", location: "Chicago, IL", status: "Active" },
                  ].map((job, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.company}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            job.status === "Active"
                              ? "bg-vibrant-green text-white"
                              : job.status === "Pending"
                                ? "bg-vibrant-yellow text-black"
                                : "bg-vibrant-pink text-white"
                          }`}
                        >
                          {job.status}
                        </span>
                      </TableCell>
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
                            <DropdownMenuItem>Edit Job</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-vibrant-pink">Remove Job</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-between items-center">
            <p className="text-muted-foreground">Showing 1-5 of 50 results</p>
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

