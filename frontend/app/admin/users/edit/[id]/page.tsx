"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { adminApi } from "@/lib/api/admin"
import { isMockEnabled } from "@/lib/utils/config"
import { mockAdminUsers } from "@/lib/mock-data/admin"
import { ArrowLeft, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function EditUserPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    status: "",
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        let data
        if (isMockEnabled()) {
          // Use mock data
          const mockUser = mockAdminUsers.find((u) => u.id === id)
          if (!mockUser) throw new Error("User not found")
          data = { data: mockUser, status: "success" }
        } else {
          // Use real API
          data = await adminApi.getUserById(id as string)
        }
        setUser(data.data)
      } catch (err) {
        console.error("Error fetching user:", err)
        setError("Failed to load user details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchUser()
    }
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUser((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setUser((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isMockEnabled()) {
        // Mock update
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API delay
        toast({
          title: "User updated",
          description: "The user has been successfully updated.",
        })
        router.push("/admin/users")
        return
      }

      // Real API update
      await adminApi.updateUser(id as string, user)
      toast({
        title: "User updated",
        description: "The user has been successfully updated.",
      })
      router.push("/admin/users")
    } catch (err) {
      console.error("Error updating user:", err)
      setError("Failed to update user. Please try again.")
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we load the user details.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" className="mb-4 flex items-center gap-1" onClick={() => router.push("/admin/users")}>
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit User</CardTitle>
          <CardDescription>Update user information</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={user.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" value={user.email} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={user.role} onValueChange={(value) => handleSelectChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="campus">Campus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={user.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="flex items-center gap-1">
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
