"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, Clock, Briefcase } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { quickApply } from "@/app/actions/job-actions"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/contexts/notification-context"
import Link from "next/link"

interface JobCardProps {
  job: {
    id: string
    title: string
    company: string
    location: string
    salary: string
    type: string
    postedAt: string
  }
}

export function JobCard({ job }: JobCardProps) {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const { toast } = useToast()
  const [isApplying, setIsApplying] = useState(false)

  const handleQuickApply = async () => {
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
      const result = await quickApply(job.id, user.id)

      toast({
        title: "Application submitted!",
        description: "Your application has been successfully submitted.",
      })

      addNotification({
        userId: user.id,
        type: "application",
        title: "Application Submitted",
        message: `Your application for ${job.title} at ${job.company} has been submitted.`,
        read: false,
        link: "/student/applications",
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

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-vibrant-blue to-vibrant-purple opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
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
            <Clock className="w-4 h-4 mr-1" /> Posted {job.postedAt}
          </span>
          <span className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1" /> {job.salary}
          </span>
        </div>
        <div className="flex justify-between items-center mt-4">
          <Link href={`/jobs/${job.id}`}>
            <Button
              variant="outline"
              className="group-hover:bg-vibrant-blue group-hover:text-white transition-colors duration-300"
            >
              View Details
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="text-vibrant-purple hover:text-vibrant-blue transition-colors duration-300"
            onClick={handleQuickApply}
            disabled={isApplying}
          >
            {isApplying ? "Applying..." : "Quick Apply"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

