import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, MapPin, Users, Star, Building2, Briefcase, Globe } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CompaniesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/50 to-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
            Explore Top Companies
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover innovative companies looking for talented students like you
          </p>
        </div>

        <Card className="mb-8 border-none shadow-lg bg-gradient-to-r from-vibrant-blue/5 to-vibrant-purple/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search companies"
                  className="pl-10 rounded-2xl border-vibrant-blue/20 focus:border-vibrant-blue"
                />
              </div>
              <div className="flex-grow relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Location"
                  className="pl-10 rounded-2xl border-vibrant-blue/20 focus:border-vibrant-blue"
                />
              </div>
              <Button
                size="lg"
                className="bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue transition-all duration-300 rounded-2xl"
              >
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: "TechCorp Inc.",
              logo: "/placeholder-logo.svg",
              location: "San Francisco, CA",
              employees: "1000-5000",
              rating: 4.5,
              industry: "Technology",
              openPositions: 12,
            },
            {
              name: "DataDrive",
              logo: "/placeholder-logo.svg",
              location: "New York, NY",
              employees: "500-1000",
              rating: 4.2,
              industry: "Data Analytics",
              openPositions: 8,
            },
            {
              name: "GreenEnergy Solutions",
              logo: "/placeholder-logo.svg",
              location: "Austin, TX",
              employees: "100-500",
              rating: 4.7,
              industry: "Renewable Energy",
              openPositions: 5,
            },
            {
              name: "HealthTech Innovations",
              logo: "/placeholder-logo.svg",
              location: "Boston, MA",
              employees: "1000-5000",
              rating: 4.3,
              industry: "Healthcare",
              openPositions: 15,
            },
            {
              name: "AI Dynamics",
              logo: "/placeholder-logo.svg",
              location: "Seattle, WA",
              employees: "500-1000",
              rating: 4.6,
              industry: "Artificial Intelligence",
              openPositions: 10,
            },
            {
              name: "FinTech Frontier",
              logo: "/placeholder-logo.svg",
              location: "Chicago, IL",
              employees: "100-500",
              rating: 4.4,
              industry: "Finance",
              openPositions: 7,
            },
          ].map((company, index) => (
            <Card key={index} className="group overflow-hidden transition-all duration-500 hover:shadow-xl border-none">
              <div
                className={`h-2 w-full ${
                  index % 6 === 0
                    ? "bg-vibrant-blue"
                    : index % 6 === 1
                      ? "bg-vibrant-green"
                      : index % 6 === 2
                        ? "bg-vibrant-orange"
                        : index % 6 === 3
                          ? "bg-vibrant-pink"
                          : index % 6 === 4
                            ? "bg-vibrant-purple"
                            : "bg-vibrant-yellow"
                }`}
              ></div>
              <CardHeader className="relative pb-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 mr-4 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    <Image
                      src={company.logo || "/placeholder.svg"}
                      alt={company.name}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-xl group-hover:text-vibrant-blue transition-colors duration-300">
                      {company.name}
                    </CardTitle>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-vibrant-yellow mr-1" fill="currentColor" />
                      <span className="text-sm font-medium">{company.rating}</span>
                      <span className="text-xs text-muted-foreground ml-1">rating</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-2">
                  <div className="flex items-center text-muted-foreground">
                    <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{company.industry}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{company.location}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{company.employees} employees</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{company.openPositions} open positions</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center gap-4 pt-2 pb-4">
                <Link href={`/companies/${index + 1}`} className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-gradient-to-r group-hover:from-vibrant-blue group-hover:to-vibrant-purple group-hover:text-white transition-all duration-300"
                  >
                    View Profile
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                  <Globe className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 flex justify-center gap-4">
          <Button
            variant="outline"
            className="rounded-xl hover:bg-vibrant-blue hover:text-white transition-colors duration-300"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            className="rounded-xl hover:bg-vibrant-purple hover:text-white transition-colors duration-300"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

