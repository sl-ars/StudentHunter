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
import { toast } from "sonner"
import { userApi } from "@/lib/api/user"
import type { UserProfile } from "@/lib/types"

export default function AccountPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    company: "",
    position: "",
    industry: "",
    experience: [],
    education: [],
    skills: [],
    university: "",
    degree: "",
    major: "",
    graduationYear: "",
    notifications: false,
    profileVisibility: false,
  })

  const updateArrayField = (
  section: "experience" | "education",
  index: number,
  field: string,
  value: string
) => {
  setFormData((prev) => {
    const items = [...(prev[section] || [])]
    items[index] = { ...items[index], [field]: value }
    return {
      ...prev,
      [section]: items,
    }
  })
}


  useEffect(() => {
    if (!user) router.push("/login")
    // Calculate profile completion (this is a simplified example)
    const totalFields = 10
    const completedFields = Object.values(user || {}).filter(Boolean).length
    setProfileCompletion((completedFields / totalFields) * 100)

    // Initialize form data with user data
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        name: user.name || "",
        email: user.email || "",
        // Add other fields from user data if available
      }))
    }
  }, [user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value
    
    // Special handling for skills to convert comma-separated string to array
    if (target.id === 'skills' && typeof value === 'string') {
      setFormData(prev => ({
        ...prev,
        skills: value.split(',').map((skill: string) => skill.trim()).filter(Boolean)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [target.id]: value
      }))
    }
  }


  function getChangedFields<T extends Record<string, any>>(original: T, updated: Partial<T>) {
  const changed: Partial<T> = {}

  for (const key in updated) {
    const originalValue = JSON.stringify(original[key])
    const updatedValue = JSON.stringify(updated[key])

    if (originalValue !== updatedValue) {
      changed[key] = updated[key]
    }
  }

  return changed
}

const handleSaveChanges = async () => {
  try {
    setIsSaving(true)

    if (!user) throw new Error("No user loaded")

    const payload = getChangedFields(user, formData)

    if (Object.keys(payload).length === 0) {
      toast.info("No changes to save.")
      return
    }

    const response = await userApi.updateProfile(payload)

    if (response.status === "error") {
      throw new Error(response.message)
    }

    toast.success("Changes saved successfully!")
  } catch (error) {
    console.error("Error saving changes:", error)
    toast.error("Failed to save changes. Please try again.")
  } finally {
    setIsSaving(false)
  }
}


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
                    <Input 
                      id="name" 
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      placeholder="City, State"
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Tell us about yourself"
                    value={formData.bio}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>

            {user.role === "student" && (
  <>
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
  {formData.experience?.map((exp, index) => (
    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
      <div>
        <Label>Company</Label>
        <Input
          value={exp.company}
          onChange={(e) =>
            updateArrayField("experience", index, "company", e.target.value)
          }
        />
      </div>
      <div>
        <Label>Position</Label>
        <Input
          value={exp.position}
          onChange={(e) =>
            updateArrayField("experience", index, "position", e.target.value)
          }
        />
      </div>
      <div>
        <Label>Start Date</Label>
        <Input
          type="date"
          value={exp.start_date}
          onChange={(e) =>
            updateArrayField("experience", index, "start_date", e.target.value)
          }
        />
      </div>
      <div>
        <Label>End Date</Label>
        <Input
          type="date"
          value={exp.end_date}
          onChange={(e) =>
            updateArrayField("experience", index, "end_date", e.target.value)
          }
        />
      </div>
    </div>
  ))}

  <Button
    type="button"
    variant="outline"
    onClick={() =>
      setFormData((prev) => ({
        ...prev,
        experience: [...(prev.experience || []), { company: "", position: "", start_date: "", end_date: "" }],
      }))
    }
  >
    ➕ Add Experience
  </Button>
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
  {formData.education?.map((edu, index) => (
    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
      <div>
        <Label>University</Label>
        <Input
          value={edu.university}
          onChange={(e) =>
            updateArrayField("education", index, "university", e.target.value)
          }
        />
      </div>
      <div>
        <Label>Field</Label>
        <Input
          value={edu.field}
          onChange={(e) =>
            updateArrayField("education", index, "field", e.target.value)
          }
        />
      </div>
      <div>
        <Label>Degree</Label>
        <Input
          value={edu.degree}
          onChange={(e) =>
            updateArrayField("education", index, "degree", e.target.value)
          }
        />
      </div>
      <div>
        <Label>Start Date</Label>
        <Input
          type="date"
          value={edu.start_date}
          onChange={(e) =>
            updateArrayField("education", index, "start_date", e.target.value)
          }
        />
      </div>
      <div>
        <Label>End Date</Label>
        <Input
          type="date"
          value={edu.end_date}
          onChange={(e) =>
            updateArrayField("education", index, "end_date", e.target.value)
          }
        />
      </div>
    </div>
  ))}

  <Button
    type="button"
    variant="outline"
    onClick={() =>
      setFormData((prev) => ({
        ...prev,
        education: [...(prev.education || []), { university: "", degree: "", field: "", start_date: "", end_date: "" }],
      }))
    }
  >
    ➕ Add Education
  </Button>
</CardContent>

            </Card>


              </>
)}

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
                  <Switch 
                    id="notifications"
                    checked={formData.notifications}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-vibrant-green" />
                    <Label htmlFor="profileVisibility">Profile Visibility</Label>
                  </div>
                  <Switch 
                    id="profileVisibility"
                    checked={formData.profileVisibility}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, profileVisibility: checked }))}
                  />
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
              <Button 
                variant="outline" 
                onClick={() => setFormData(prev => ({
                  ...prev,
                  name: user?.name || "",
                  email: user?.email || "",
                  phone: "",
                  location: "",
                  bio: "",
                  company: "",
                  position: "",
                  industry: "",
                  experience: [],
                  skills: [],
                  university: "",
                  degree: "",
                  major: "",
                  graduationYear: "",
                  notifications: false,
                  profileVisibility: false,
                }))}
              >
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue transition-all duration-300"
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
