"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck, MapPin, Building, Calendar, Clock, Briefcase } from "lucide-react"
import { saveJob, unsaveJob } from "@/app/actions/job-actions"
import { formatDistanceToNow } from "date-fns"
import { QuickApplyButton } from "./quick-apply-button"

interface JobCardProps {
  job: {
    id: string
    title: string
    company: {
      id: string
      name: string
      logo?: string
    }
    location: string
    type: string
    salary?: string
    description: string
    requirements?: string[]
    postedAt: string
    deadline?: string
    isSaved?: boolean
    isQuickApply?: boolean
    tags?: string[]
  }
  showActions?: boolean
  showDescription?: boolean
  showCompanyLink?: boolean
  className?: string
}

export function JobCard({
  job,
  showActions = true,
  showDescription = true,
  showCompanyLink = true,
  className = "",
}: JobCardProps) {
  const [isSaved, setIsSaved] = useState(job.isSaved || false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveToggle = async () => {
    setIsLoading(true)
    try {
      if (isSaved) {
        await unsaveJob(job.id)
        setIsSaved(false)
      } else {
        await saveJob(job.id)
        setIsSaved(true)
      }
    } catch (error) {
      console.error("Error toggling save status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const postedTimeAgo = formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">
              <Link href={`/jobs/${job.id}`} className="hover:text-primary transition-colors">
                {job.title}
              </Link>
            </CardTitle>
            <CardDescription className="flex items-center mt-1">
              {showCompanyLink ? (
                <Link
                  href={`/companies/${job.company.id}`}
                  className="flex items-center hover:text-primary transition-colors"
                >
                  <Building className="h-4 w-4 mr-1" />
                  {job.company.name}
                </Link>
              ) : (
                <span className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  {job.company.name}
                </span>
              )}
              <span className="mx-2">•</span>
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {job.location}
              </span>
            </CardDescription>
          </div>
          {showActions && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSaveToggle}
              disabled={isLoading}
              aria-label={isSaved ? "Unsave job" : "Save job"}
            >
              {isSaved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        {showDescription && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{job.description}</p>}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="flex items-center">
            <Briefcase className="h-3 w-3 mr-1" />
            {job.type}
          </Badge>
          {job.salary && (
            <Badge variant="outline" className="flex items-center">
              ${job.salary}
            </Badge>
          )}
          {job.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          Posted {postedTimeAgo}
          {job.deadline && (
            <>
              <span className="mx-2">•</span>
              <Calendar className="h-3 w-3 mr-1" />
              Deadline: {new Date(job.deadline).toLocaleDateString()}
            </>
          )}
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="pt-0">
          <div className="flex gap-2 w-full">
            <Button asChild className="flex-1">
              <Link href={`/jobs/${job.id}`}>View Details</Link>
            </Button>
            {job.isQuickApply && <QuickApplyButton jobId={job.id} className="flex-1" />}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
