"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { updateApplicationStatus } from "@/app/actions/job-actions"
import { useToast } from "@/components/ui/use-toast"

interface ApplicationManagerProps {
  application: {
    id: string
    jobTitle: string
    applicantName: string
    appliedDate: string
    status: string
    resume?: string
  }
}

export function ApplicationManager({ application }: ApplicationManagerProps) {
  const [comments, setComments] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleStatusUpdate = async (status: "accepted" | "rejected") => {
    setIsUpdating(true)
    try {
      await updateApplicationStatus(application.id, status, comments)
      toast({
        title: "Application Updated",
        description: `Application ${status} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{application.jobTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <p className="text-sm font-medium">Applicant</p>
            <p className="text-sm text-muted-foreground">{application.applicantName}</p>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-medium">Applied Date</p>
            <p className="text-sm text-muted-foreground">{application.appliedDate}</p>
          </div>

          {application.resume && (
            <Button variant="outline" className="w-full" asChild>
              <a href={application.resume} target="_blank" rel="noopener noreferrer">
                View Resume
              </a>
            </Button>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">Review Application</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Review Application</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Add comments (optional)"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="destructive" onClick={() => handleStatusUpdate("rejected")} disabled={isUpdating}>
                    Reject
                  </Button>
                  <Button onClick={() => handleStatusUpdate("accepted")} disabled={isUpdating}>
                    Accept
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}

