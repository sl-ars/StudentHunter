"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin, Filter } from "lucide-react"
import { JobCard } from "./job-card"

const jobTypes = ["Full-time", "Part-time", "Contract", "Internship"]
const experienceLevels = ["Entry Level", "Mid Level", "Senior Level", "Executive"]
const industries = ["Technology", "Finance", "Healthcare", "Education", "Manufacturing"]

export function JobSearch() {
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    type: "",
    experience: "",
    industry: "",
    salary: "",
  })

  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search logic here
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr,1fr,auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Location..."
                  className="pl-10"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full md:w-auto">
                Search Jobs
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <Button type="button" variant="ghost" onClick={() => setShowFilters(!showFilters)} className="text-sm">
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>

              {showFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setFilters({
                      search: "",
                      location: "",
                      type: "",
                      experience: "",
                      industry: "",
                      salary: "",
                    })
                  }
                  className="text-sm"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {showFilters && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.experience}
                  onValueChange={(value) => setFilters({ ...filters, experience: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Experience Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level.toLowerCase()}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.industry} onValueChange={(value) => setFilters({ ...filters, industry: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry.toLowerCase()}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.salary} onValueChange={(value) => setFilters({ ...filters, salary: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Salary Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-50000">$0 - $50,000</SelectItem>
                    <SelectItem value="50000-100000">$50,000 - $100,000</SelectItem>
                    <SelectItem value="100000-150000">$100,000 - $150,000</SelectItem>
                    <SelectItem value="150000+">$150,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {/* Render job results here using JobCard component */}
        {/* This is a placeholder for demonstration */}
        <JobCard
          job={{
            id: "1",
            title: "Senior Frontend Developer",
            company: "TechCorp Inc.",
            location: "San Francisco, CA",
            salary: "$120,000 - $160,000",
            type: "Full-time",
            postedAt: "2 days ago",
          }}
        />
      </div>
    </div>
  )
}

