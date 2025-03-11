"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Search, MapPin, Briefcase, Clock, DollarSign } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { quickApply } from "@/app/actions/job-actions"
import { useState } from "react"
import { QuickApplyButton } from "@/components/quick-apply-button"

export default function JobsPage() {
  const { toast } = useToast()
  const user = { id: "fakeUserId" } // Replace with actual user object when authentication is implemented

  const [isApplying, setIsApplying] = useState(false)

  const handleQuickApply = async (jobId: string) => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to apply for jobs",
        variant: "destructive",
      })
      return
    }

    setIsApplying(true)
    try {
      const result = await quickApply(jobId, user)

      if (!result.success) {
        toast({
          title: result.error,
          description: result.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Application submitted!",
        description: "Your application has been successfully submitted.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsApplying(false)
    }
  }

  const jobs = [
    {
      id: "1",
      title: "Software Engineer Intern",
      company: "TechCorp Inc.",
      location: "New York, NY",
      type: "Internship",
      salary: "$25/hour",
    },
    {
      id: "2",
      title: "Marketing Specialist",
      company: "BrandBoost",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$60,000/year",
    },
    {
      id: "3",
      title: "Data Analyst",
      company: "DataDrive",
      location: "Chicago, IL",
      type: "Part-time",
      salary: "$30/hour",
    },
    {
      id: "4",
      title: "UX Designer",
      company: "DesignPro",
      location: "Austin, TX",
      type: "Full-time",
      salary: "$75,000/year",
    },
    {
      id: "5",
      title: "Content Writer",
      company: "ContentKing",
      location: "Remote",
      type: "Freelance",
      salary: "Based on project",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
          Find Your Dream Job
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-vibrant-purple">Filters</h2>
            <form className="space-y-4">
              <div>
                <Label htmlFor="keyword" className="text-vibrant-blue">
                  Keyword
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input type="text" id="keyword" placeholder="e.g. Software Engineer" className="pl-10" />
                </div>
              </div>
              <div>
                <Label htmlFor="location" className="text-vibrant-green">
                  Location
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input type="text" id="location" placeholder="e.g. New York" className="pl-10" />
                </div>
              </div>
              <div>
                <Label htmlFor="job-type" className="text-vibrant-orange">
                  Job Type
                </Label>
                <Select id="job-type">
                  <option value="">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="internship">Internship</option>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue transition-all duration-300"
              >
                Apply Filters
              </Button>
            </form>
          </div>
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-vibrant-blue">Job Listings</h2>
              <Select defaultValue="relevance" className="w-48">
                <option value="relevance">Sort by Relevance</option>
                <option value="date">Sort by Date</option>
                <option value="salary">Sort by Salary</option>
              </Select>
            </div>
            <div className="space-y-6">
              {jobs.map((job, index) => (
                <Card key={index} className="group hover:shadow-lg hover:bg-muted/50 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-vibrant-blue group-hover:text-vibrant-purple transition-colors duration-300">
                      {job.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-2">
                      {job.company} • {job.location}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-1" /> {job.type}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" /> Posted 2 days ago
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" /> {job.salary}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <Link href={`/jobs/${index + 1}`}>
                      <Button
                        variant="outline"
                        className="group-hover:bg-vibrant-blue group-hover:text-white transition-colors duration-300"
                      >
                        View Details
                      </Button>
                    </Link>
                    <QuickApplyButton
                      job={job}
                      variant="ghost"
                      className="text-vibrant-purple hover:text-vibrant-blue transition-colors duration-300"
                      onSuccess={() => {
                        // Refresh the jobs list or update UI as needed
                      }}
                    />
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                className="mr-2 hover:bg-vibrant-blue hover:text-white transition-colors duration-300"
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
    </div>
  )
}

