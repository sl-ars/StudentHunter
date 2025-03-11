"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ProtectedRoute from "@/components/protected-route"

export default function CompanyProfilePage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push("/login")
  }, [user, router])

  return (
    <ProtectedRoute roles="manager">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Company Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Edit Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <Label htmlFor="company-name">Company Name</Label>
                <Input id="company-name" defaultValue="TechCorp Inc." />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" defaultValue="Technology" />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" defaultValue="San Francisco, CA" />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input id="website" type="url" defaultValue="https://techcorp.com" />
              </div>
              <div>
                <Label htmlFor="description">Company Description</Label>
                <Textarea id="description" rows={5} defaultValue="TechCorp is a leading technology company..." />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}

