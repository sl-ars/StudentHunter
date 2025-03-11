"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Settings, Bell, Shield, Mail } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

export default function AdminSettingsPage() {
  return (
    <ProtectedRoute roles="admin">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
          Admin Settings
        </h1>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="h-2 bg-gradient-to-r from-vibrant-blue to-vibrant-green w-full"></div>
            <CardHeader>
              <CardTitle className="flex items-center text-vibrant-blue">
                <Settings className="w-5 h-5 mr-2" /> General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="site-name">Site Name</Label>
                <Input id="site-name" defaultValue="StudentHunter" />
              </div>
              <div>
                <Label htmlFor="support-email">Support Email</Label>
                <Input id="support-email" type="email" defaultValue="support@studenthunter.com" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                <Switch id="maintenance-mode" />
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="h-2 bg-gradient-to-r from-vibrant-orange to-vibrant-pink w-full"></div>
            <CardHeader>
              <CardTitle className="flex items-center text-vibrant-orange">
                <Bell className="w-5 h-5 mr-2" /> Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <Switch id="push-notifications" defaultChecked />
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="h-2 bg-gradient-to-r from-vibrant-purple to-vibrant-blue w-full"></div>
            <CardHeader>
              <CardTitle className="flex items-center text-vibrant-purple">
                <Shield className="w-5 h-5 mr-2" /> Security Settings
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
              <Button className="w-full bg-gradient-to-r from-vibrant-purple to-vibrant-blue hover:from-vibrant-blue hover:to-vibrant-purple transition-all duration-300">
                Update Security Settings
              </Button>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="h-2 bg-gradient-to-r from-vibrant-green to-vibrant-yellow w-full"></div>
            <CardHeader>
              <CardTitle className="flex items-center text-vibrant-green">
                <Mail className="w-5 h-5 mr-2" /> Email Configuration
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
              <Button className="w-full bg-gradient-to-r from-vibrant-green to-vibrant-yellow hover:from-vibrant-yellow hover:to-vibrant-green transition-all duration-300">
                Test Email Configuration
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

