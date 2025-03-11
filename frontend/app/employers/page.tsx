import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Users, Zap, Trophy } from "lucide-react"
import Link from "next/link"

export default function EmployersPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
        Hire Top Student Talent
      </h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
        {[
          { title: "Access Top Talent", icon: Users, color: "vibrant-blue" },
          { title: "Efficient Hiring", icon: Zap, color: "vibrant-green" },
          { title: "Brand Exposure", icon: Trophy, color: "vibrant-orange" },
          { title: "Diverse Candidates", icon: CheckCircle, color: "vibrant-pink" },
        ].map((feature, index) => (
          <Card
            key={index}
            className="text-center group hover:shadow-lg transition-all duration-300 overflow-hidden border-none"
          >
            <div className={`h-2 bg-${feature.color} w-full`}></div>
            <CardHeader>
              <div
                className={`w-16 h-16 mx-auto rounded-full bg-${feature.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className={`w-8 h-8 text-${feature.color}`} />
              </div>
              <CardTitle className={`text-${feature.color}`}>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="text-center border-none shadow-lg overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-vibrant-blue to-vibrant-purple w-full"></div>
        <CardHeader>
          <CardTitle className="text-2xl">Ready to Find Your Next Star Employee?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            Join StudentHunter today and connect with talented students eager to contribute to your company's success.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue transition-all duration-300"
            >
              Get Started
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

