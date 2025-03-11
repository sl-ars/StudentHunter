"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Lock, Globe, User, Briefcase } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

export default function AccountSettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")

  if (!user) return null

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
          Account Settings
        </h1>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5 rounded-xl bg-muted p-1">
            <TabsTrigger value="profile" className="rounded-lg">
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg">
              Security
            </TabsTrigger>
            {user.role === "manager" && (
              <TabsTrigger value="company" className="rounded-lg">
                Company
              </TabsTrigger>
            )}
            <TabsTrigger value="preferences" className="rounded-lg">
              Preferences
            </TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-vibrant-blue to-vibrant-purple w-full"></div>
              <CardHeader>
                <CardTitle className="flex items-center text-vibrant-blue">
                  <User className="w-5 h-5 mr-2" /> Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={user.name} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user.email} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" className="mt-1" />
                </div>
                <Button className="w-full bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue transition-all duration-300">
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="notifications">
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-vibrant-green to-vibrant-yellow w-full"></div>
              <CardHeader>
                <CardTitle className="flex items-center text-vibrant-green">
                  <Bell className="w-5 h-5 mr-2" /> Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch id="email-notifications" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <Switch id="push-notifications" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <Switch id="sms-notifications" />
                </div>
                <Button className="w-full bg-gradient-to-r from-vibrant-green to-vibrant-yellow hover:from-vibrant-yellow hover:to-vibrant-green transition-all duration-300">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="security">
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-vibrant-orange to-vibrant-pink w-full"></div>
              <CardHeader>
                <CardTitle className="flex items-center text-vibrant-orange">
                  <Lock className="w-5 h-5 mr-2" /> Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" className="mt-1" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
                  <Switch id="two-factor" />
                </div>
                <Button className="w-full bg-gradient-to-r from-vibrant-orange to-vibrant-pink hover:from-vibrant-pink hover:to-vibrant-orange transition-all duration-300">
                  Update Security Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          {user.role === "manager" && (
            <TabsContent value="company">
              <Card className="border-none shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-vibrant-purple to-vibrant-blue w-full"></div>
                <CardHeader>
                  <CardTitle className="flex items-center text-vibrant-purple">
                    <Briefcase className="w-5 h-5 mr-2" /> Company Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="company-website">Company Website</Label>
                    <Input id="company-website" type="url" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="company-description">Company Description</Label>
                    <Input id="company-description" className="mt-1" />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-vibrant-purple to-vibrant-blue hover:from-vibrant-blue hover:to-vibrant-purple transition-all duration-300">
                    Update Company Information
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          <TabsContent value="preferences">
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-vibrant-yellow to-vibrant-green w-full"></div>
              <CardHeader>
                <CardTitle className="flex items-center text-vibrant-yellow">
                  <Globe className="w-5 h-5 mr-2" /> User Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <Switch id="dark-mode" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="language">Language</Label>
                  <select
                    id="language"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-vibrant-blue focus:border-vibrant-blue sm:text-sm rounded-md"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                <Button className="w-full bg-gradient-to-r from-vibrant-yellow to-vibrant-green hover:from-vibrant-green hover:to-vibrant-yellow transition-all duration-300">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}

