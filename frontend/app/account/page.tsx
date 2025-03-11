"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { User, Briefcase, GraduationCap, Star, Shield, Bell, Eye, Activity, Upload } from "lucide-react"

export default function AccountPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profileCompletion, setProfileCompletion] = useState(0)

  useEffect(() => {
    if (!user) router.push("/login")
    // Calculate profile completion (this is a simplified example)
    const totalFields = 10
    const completedFields = Object.values(user || {}).filter(Boolean).length
    setProfileCompletion((completedFields / totalFields) * 100)
  }, [user, router])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/50 to-background py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
          Your Account
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <p className="text-muted-foreground capitalize">{user.role}</p>
              </div>
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Profile Completion</h3>
                <Progress value={profileCompletion} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">{profileCompletion.toFixed(0)}% Complete</p>
              </div>
              <Button className="w-full mt-4 bg-gradient-to-r from-vibrant-green to-vibrant-blue hover:from-vibrant-blue hover:to-vibrant-green transition-all duration-300">
                <Upload className="w-4 h-4 mr-2" /> Update Profile Picture
              </Button>
            </CardContent>
          </Card>

          {/* Main Content */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Professional Information */}
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-vibrant-green to-vibrant-blue w-full"></div>
              <CardHeader>
                <CardTitle className="flex items-center text-vibrant-green">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Current Company</Label>
                    <Input id="company" placeholder="Enter company name" />
                  </div>
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input id="position" placeholder="Enter your position" />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input id="industry" placeholder="Enter your industry" />
                  </div>
                  <div>
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input id="experience" type="number" min="0" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="skills">Skills</Label>
                  <Textarea id="skills" placeholder="Enter your skills (separated by commas)" />
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-vibrant-orange to-vibrant-pink w-full"></div>
              <CardHeader>
                <CardTitle className="flex items-center text-vibrant-orange">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="university">University</Label>
                    <Input id="university" placeholder="Enter your university" />
                  </div>
                  <div>
                    <Label htmlFor="degree">Degree</Label>
                    <Input id="degree" placeholder="Enter your degree" />
                  </div>
                  <div>
                    <Label htmlFor="major">Major</Label>
                    <Input id="major" placeholder="Enter your major" />
                  </div>
                  <div>
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    <Input id="graduationYear" type="number" min="1900" max="2099" step="1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-vibrant-purple to-vibrant-blue w-full"></div>
              <CardHeader>
                <CardTitle className="flex items-center text-vibrant-purple">
                  <Shield className="w-5 h-5 mr-2" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-vibrant-blue" />
                    <Label htmlFor="notifications">Email Notifications</Label>
                  </div>
                  <Switch id="notifications" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-vibrant-green" />
                    <Label htmlFor="profileVisibility">Profile Visibility</Label>
                  </div>
                  <Switch id="profileVisibility" />
                </div>
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-vibrant-yellow to-vibrant-orange w-full"></div>
              <CardHeader>
                <CardTitle className="flex items-center text-vibrant-yellow">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <Star className="w-4 h-4 mr-2 text-vibrant-blue" />
                    <span>
                      You applied for <strong>Frontend Developer</strong> at TechCorp
                    </span>
                  </li>
                  <li className="flex items-center text-sm">
                    <Star className="w-4 h-4 mr-2 text-vibrant-green" />
                    <span>
                      Your profile was viewed by <strong>5 recruiters</strong> this week
                    </span>
                  </li>
                  <li className="flex items-center text-sm">
                    <Star className="w-4 h-4 mr-2 text-vibrant-orange" />
                    <span>
                      You updated your <strong>skills</strong>
                    </span>
                  </li>
                </ul>
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
  )
}

