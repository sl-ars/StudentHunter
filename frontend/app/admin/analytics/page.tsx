"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, LineChart, PieChart } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

export default function AdminAnalyticsPage() {
  return (
    <ProtectedRoute roles="admin">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
          Platform Analytics
        </h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "User Growth", icon: LineChart, color: "vibrant-blue" },
            { title: "Job Applications", icon: BarChart, color: "vibrant-green" },
            { title: "User Distribution", icon: PieChart, color: "vibrant-orange" },
          ].map((chart, index) => (
            <Card
              key={index}
              className="overflow-hidden border-none shadow-lg group hover:shadow-xl transition-all duration-300"
            >
              <div className={`h-2 bg-${chart.color} w-full`}></div>
              <CardHeader>
                <CardTitle className={`flex items-center text-${chart.color}`}>
                  <chart.icon className="w-5 h-5 mr-2" />
                  {chart.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`h-64 bg-${chart.color}/10 rounded-lg flex items-center justify-center`}>
                  <chart.icon className={`w-16 h-16 text-${chart.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  )
}

