"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Lock, Mail } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push("/login")
  }, [user, router])

  return (
    <ProtectedRoute roles="manager">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" /> Email Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="new-applications">New Applications</Label>
                <Switch id="new-applications" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="interview-reminders">Interview Reminders</Label>
                <Switch id="interview-reminders" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" /> Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <Switch id="push-notifications" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <Switch id="sms-notifications" />
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2" /> Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button>Change Password</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

