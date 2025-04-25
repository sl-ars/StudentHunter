"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ProtectedRoute from "@/components/protected-route"
import { employerApi } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { isMockEnabled } from "@/lib/utils/config"

interface CompanyProfile {
  company_name: string
  industry: string
  website: string
  description: string
  company: string
  company_id: string
}

export default function CompanyProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<CompanyProfile>({
    company_name: "",
    industry: "",
    website: "",
    description: "",
    company: "",
    company_id: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) router.push("/login")

    const fetchCompanyProfile = async () => {
      try {
        setLoading(true)
        const response = await employerApi.getCompanyProfile()

        setProfile({
          company_name: response.data.company_name || "",
          industry: response.data.industry || "",
          website: response.data.website || "",
          description: response.data.description || "",
          company: response.data.company || "",
          company_id: response.data.company_id || "",
        })
      } catch (error) {
        console.error("Error fetching company profile:", error)

        // If API call fails or mock is enabled, use mock data
        if (isMockEnabled()) {
          setProfile({
            company_name: "TechCorp Inc.",
            industry: "Technology",
            website: "https://techcorp.com",
            description: "TechCorp is a leading technology company...",
            company: "TechCorp Inc.",
            company_id: "techcorp-1",
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyProfile()
  }, [user, router])

  const handleChange = (field: keyof CompanyProfile, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const profileData = {
        ...profile,
        company: profile.company_name,
        company_id: profile.company_name.toLowerCase().replace(/\s+/g, '-')
      }
      console.log('Saving profile data:', profileData)
      const response = await employerApi.updateCompanyProfile(profileData)
      console.log('Profile update response:', response)

      toast({
        title: "Profile updated",
        description: "Your company profile has been successfully updated.",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update company profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProtectedRoute roles="employer">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Company Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Edit Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading company profile...</div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={profile.company_name}
                    onChange={(e) => handleChange("company_name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={profile.industry}
                    onChange={(e) => handleChange("industry", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={profile.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Company Description</Label>
                  <Textarea
                    id="description"
                    rows={5}
                    value={profile.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
