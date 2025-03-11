"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Briefcase, GraduationCap, Award, Star, MapPin, Mail, Phone } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import { Progress } from "@/components/ui/progress"

export default function StudentProfilePage() {
  const { user } = useAuth()
  const router = useRouter()

  const [profileCompletion, setProfileCompletion] = useState(0)

  useEffect(() => {
    if (!user) router.push("/login")
    // Calculate profile completion
    // This is a simplified example, you should adjust based on your actual user data structure
    const totalFields = 10 // Adjust based on your total number of profile fields
    const completedFields = Object.values(user || {}).filter(Boolean).length
    setProfileCompletion((completedFields / totalFields) * 100)
  }, [user, router])

  if (!user) return null

  return (
    <ProtectedRoute roles="student">
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/50 to-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
            Your Profile
          </h1>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Overview */}
            <Card className="md:col-span-1 border-none shadow-lg overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-vibrant-blue to-vibrant-purple"></div>
              <CardContent className="-mt-16 relative">
                <div className="flex flex-col items-center">
                  <Avatar className="w-32 h-32 border-4 border-background">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      <User className="w-16 h-16" />
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="mt-4 text-2xl font-bold">{user.name}</h2>
                  <p className="text-muted-foreground">Student</p>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="w-4 h-4 mr-2" />
                    {user.email}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="w-4 h-4 mr-2" />
                    +1 (555) 123-4567
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    San Francisco, CA
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Profile Completion</h3>
                  <Progress value={profileCompletion} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">{profileCompletion.toFixed(0)}% Complete</p>
                </div>
              </CardContent>
            </Card>

            {/* Main Profile Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card className="border-none shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-vibrant-blue to-vibrant-purple w-full"></div>
                <CardHeader>
                  <CardTitle className="flex items-center text-vibrant-blue">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue={user.name} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={user.email} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" placeholder="City, State" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" placeholder="Tell us about yourself" />
                  </div>
                </CardContent>
              </Card>

              {/* Education */}
              <Card className="border-none shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-vibrant-green to-vibrant-blue w-full"></div>
                <CardHeader>
                  <CardTitle className="flex items-center text-vibrant-green">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="university">University</Label>
                      <Input id="university" placeholder="Enter your university" />
                    </div>
                    <div>
                      <Label htmlFor="major">Major</Label>
                      <Input id="major" placeholder="Enter your major" />
                    </div>
                    <div>
                      <Label htmlFor="graduation">Expected Graduation</Label>
                      <Input id="graduation" type="month" />
                    </div>
                    <div>
                      <Label htmlFor="gpa">GPA</Label>
                      <Input id="gpa" type="number" step="0.01" min="0" max="4" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card className="border-none shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-vibrant-orange to-vibrant-pink w-full"></div>
                <CardHeader>
                  <CardTitle className="flex items-center text-vibrant-orange">
                    <Star className="w-5 h-5 mr-2" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="skills">Skills</Label>
                    <Textarea id="skills" placeholder="Enter your skills (separated by commas)" />
                  </div>
                </CardContent>
              </Card>

              {/* Work Experience */}
              <Card className="border-none shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-vibrant-purple to-vibrant-blue w-full"></div>
                <CardHeader>
                  <CardTitle className="flex items-center text-vibrant-purple">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Work Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input id="company" placeholder="Enter company name" />
                    </div>
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input id="position" placeholder="Enter your position" />
                    </div>
                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input id="start-date" type="month" />
                    </div>
                    <div>
                      <Label htmlFor="end-date">End Date</Label>
                      <Input id="end-date" type="month" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="job-description">Job Description</Label>
                    <Textarea id="job-description" placeholder="Describe your responsibilities and achievements" />
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card className="border-none shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-vibrant-yellow to-vibrant-orange w-full"></div>
                <CardHeader>
                  <CardTitle className="flex items-center text-vibrant-yellow">
                    <Award className="w-5 h-5 mr-2" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="achievements">Achievements</Label>
                    <Textarea id="achievements" placeholder="List your key achievements and awards" />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue transition-all duration-300">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

