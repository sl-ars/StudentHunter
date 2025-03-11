"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Bell, Shield, Mail, Globe } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

export default function CampusSettingsPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push("/login")
  }, [user, router])

  return (
    <ProtectedRoute roles="campus">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">Campus Portal Settings</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold text-vibrant-blue">
                  <Settings className="w-6 h-6 mr-2" /> General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="campus-name">Campus Name</Label>
                  <Input id="campus-name" defaultValue="University of Technology" />
                </div>
                <div>
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input id="admin-email" type="email" defaultValue="admin@universityoftech.edu" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <Switch id="maintenance-mode" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold text-vibrant-green">
                  <Bell className="w-6 h-6 mr-2" /> Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <Switch id="sms-notifications" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="event-reminders">Event Reminders</Label>
                  <Switch id="event-reminders" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold text-vibrant-orange">
                  <Shield className="w-6 h-6 mr-2" /> Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="two-factor-auth">Two-Factor Authentication</Label>
                  <Switch id="two-factor-auth" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password-expiry">Password Expiry (90 days)</Label>
                  <Switch id="password-expiry" defaultChecked />
                </div>
                <Button className="w-full bg-vibrant-orange hover:bg-vibrant-orange/90 text-white transition-colors duration-300">
                  Update Security Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold text-vibrant-purple">
                  <Mail className="w-6 h-6 mr-2" /> Email Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="smtp-server">SMTP Server</Label>
                  <Input id="smtp-server" placeholder="smtp.example.com" />
                </div>
                <div>
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input id="smtp-port" placeholder="587" />
                </div>
                <div>
                  <Label htmlFor="smtp-username">SMTP Username</Label>
                  <Input id="smtp-username" type="email" placeholder="noreply@universityoftech.edu" />
                </div>
                <Button className="w-full bg-vibrant-purple hover:bg-vibrant-purple/90 text-white transition-colors duration-300">
                  Test Email Configuration
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold text-vibrant-pink">
                <Globe className="w-6 h-6 mr-2" /> API Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex space-x-2">
                  <Input id="api-key" defaultValue="••••••••••••••••" readOnly className="flex-grow" />
                  <Button variant="outline">Regenerate</Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="api-access">Enable API Access</Label>
                <Switch id="api-access" defaultChecked />
              </div>
              <div>
                <Label htmlFor="allowed-origins">Allowed Origins (comma-separated)</Label>
                <Input id="allowed-origins" placeholder="https://example.com, https://api.example.com" />
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex justify-end">
            <Button className="bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue transition-all duration-300">
              Save All Settings
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

