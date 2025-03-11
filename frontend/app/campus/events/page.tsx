"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin, Users, Plus } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

export default function CampusEventsPage() {
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
            <h1 className="text-3xl font-bold">Campus Events</h1>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Event
            </Button>
          </div>

          <div className="grid gap-6">
            {[
              {
                title: "Tech Career Fair 2024",
                date: "2024-03-15",
                time: "10:00 AM - 4:00 PM",
                location: "Main Campus Hall",
                attendees: 500,
                companies: ["TechCorp", "DesignPro", "DataDrive"],
                type: "Career Fair",
              },
              {
                title: "Interview Skills Workshop",
                date: "2024-03-20",
                time: "2:00 PM - 4:00 PM",
                location: "Virtual",
                attendees: 100,
                companies: ["HR Experts Inc."],
                type: "Workshop",
              },
            ].map((event, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{event.type}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {event.date}
                      <Clock className="w-4 h-4 ml-4 mr-2" />
                      {event.time}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      {event.attendees} Expected Attendees
                    </div>
                    <div>
                      <p className="font-medium mb-2">Participating Companies:</p>
                      <div className="flex flex-wrap gap-2">
                        {event.companies.map((company) => (
                          <span key={company} className="px-2 py-1 bg-muted rounded-full text-sm text-muted-foreground">
                            {company}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Edit</Button>
                      <Button>Manage Event</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

