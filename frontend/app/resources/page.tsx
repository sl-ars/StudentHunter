"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Book, Video, FileText, Users, Calendar, Download } from "lucide-react"
import Link from "next/link"

const resourceTypes = [
  { icon: FileText, color: "vibrant-blue", bg: "bg-vibrant-blue/10" },
  { icon: Video, color: "vibrant-green", bg: "bg-vibrant-green/10" },
  { icon: Users, color: "vibrant-orange", bg: "bg-vibrant-orange/10" },
  { icon: Book, color: "vibrant-pink", bg: "bg-vibrant-pink/10" },
  { icon: Calendar, color: "vibrant-purple", bg: "bg-vibrant-purple/10" },
]

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted to-background">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
          Career Resources
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Resume Writing Guide", icon: FileText, type: "Guide" },
            { title: "Interview Preparation", icon: Users, type: "Video Course" },
            { title: "Networking Strategies", icon: Users, type: "Webinar" },
            { title: "Industry Insights", icon: Book, type: "E-book" },
            { title: "Career Fair Tips", icon: Calendar, type: "Article" },
            { title: "Job Search Strategies", icon: Video, type: "Workshop" },
          ].map((resource, index) => {
            const typeStyle = resourceTypes[index % resourceTypes.length]
            return (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 overflow-hidden hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-vibrant-blue to-vibrant-purple opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-2xl ${typeStyle.bg} text-${typeStyle.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <resource.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-vibrant-blue transition-colors duration-300">
                    {resource.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">{resource.type}</p>
                  <p className="text-sm">Learn essential skills and strategies to boost your career prospects.</p>
                </CardContent>
                <CardFooter>
                  <Link href={`/resources/${index + 1}`} className="w-full">
                    <Button className="w-full bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue transition-all duration-300">
                      <Download className="w-4 h-4 mr-2" /> Access Resource
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-vibrant-orange to-vibrant-pink bg-clip-text text-transparent">
            Need Personalized Guidance?
          </h2>
          <p className="mb-6 text-muted-foreground">Book a session with our career advisors for tailored advice.</p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-vibrant-orange to-vibrant-pink hover:from-vibrant-pink hover:to-vibrant-orange transition-all duration-300 transform hover:scale-105"
          >
            Schedule Consultation
          </Button>
        </div>
      </div>
    </div>
  )
}

