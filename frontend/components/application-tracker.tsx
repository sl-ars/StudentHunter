"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, MessageSquare, ExternalLink } from "lucide-react"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewing: "bg-blue-100 text-blue-800",
  interview: "bg-purple-100 text-purple-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
}

export function ApplicationTracker() {
  const [activeTab, setActiveTab] = useState("all")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {[
              {
                id: "1",
                company: "TechCorp Inc.",
                position: "Senior Frontend Developer",
                status: "interview",
                appliedDate: "2024-02-25",
                lastUpdate: "2024-02-28",
                nextStep: "Technical Interview on March 5th",
              },
              {
                id: "2",
                company: "DesignPro",
                position: "UX Designer",
                status: "reviewing",
                appliedDate: "2024-02-24",
                lastUpdate: "2024-02-26",
                nextStep: "Application under review",
              },
              // Add more applications...
            ].map((application) => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{application.position}</h3>
                      <p className="text-muted-foreground">{application.company}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Applied: {application.appliedDate}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Updated: {application.lastUpdate}
                        </span>
                      </div>
                    </div>
                    <Badge className={`${statusColors[application.status as keyof typeof statusColors]} capitalize`}>
                      {application.status}
                    </Badge>
                  </div>

                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Next Step:</p>
                    <p className="text-sm text-muted-foreground">{application.nextStep}</p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Add content for other tabs */}
        </Tabs>
      </CardContent>
    </Card>
  )
}

