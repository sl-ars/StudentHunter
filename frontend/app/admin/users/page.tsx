"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, User, Mail, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ProtectedRoute from "@/components/protected-route"
import { adminApi } from "@/lib/api/admin"
import { isMockEnabled } from "@/lib/utils/config"
import { mockAdminUsers } from "@/lib/mock-data/admin"

interface UserType {
  id: string
  name: string
  email: string
  role: string
  status: string
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!user) router.push("/login")

    const fetchUsers = async () => {
      try {
        setLoading(true)
        let data
        if (isMockEnabled()) {
          // Use mock data
          data = { data: mockAdminUsers, status: "success", message: "Users retrieved successfully" }
        } else {
          // Use real API
          data = await adminApi.getUsers()
        }
        setUsers(data.data)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [user, router])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleDeleteUser = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        if (isMockEnabled()) {
          // Mock deletion
          setUsers(users.filter((user) => user.id !== id))
          return
        }

        // Real API deletion
        await adminApi.deleteUser(id)
        setUsers(users.filter((user) => user.id !== id))
      } catch (error) {
        console.error("Error deleting user:", error)
      }
    }
  }

  const handleEditUser = (id: string) => {
    router.push(`/admin/users/edit/${id}`)
  }

  const handleViewUser = (id: string) => {
    router.push(`/admin/users/${id}`)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <ProtectedRoute roles="admin">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">User Management</h1>
            <Button onClick={() => router.push("/admin/register")}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search users"
                  className="pl-10"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 text-center">Loading users...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            {user.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.status}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewUser(user.id)}>View Details</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditUser(user.id)}>Edit User</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)}>
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
