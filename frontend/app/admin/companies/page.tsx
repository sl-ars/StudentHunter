"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { adminApi } from "@/lib/api/admin"
import { isMockEnabled } from "@/lib/utils/config"
import { mockAdminCompanies } from "@/lib/mock-data/admin"
import { Plus, Edit, Trash2, ExternalLink, CheckCircle, XCircle } from "lucide-react"

interface CompanyType {
  id: string
  name: string
  industry: string
  location: string
  verified: boolean
}

export default function AdminCompaniesPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<CompanyType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true)
        let data
        if (isMockEnabled()) {
          // Use mock data
          data = { data: mockAdminCompanies, status: "success", message: "Companies retrieved successfully" }
        } else {
          // Use real API
          data = await adminApi.getCompanies()
        }
        setCompanies(data.data)
      } catch (err) {
        console.error("Error fetching companies:", err)
        setError("Failed to load companies. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [router])

  const handleDeleteCompany = async (id: string) => {
    if (confirm("Are you sure you want to delete this company? This will also delete all associated jobs.")) {
      try {
        if (isMockEnabled()) {
          // Mock deletion
          setCompanies(companies.filter((company) => company.id !== id))
          return
        }

        // Real API deletion
        await adminApi.deleteCompany(id)
        setCompanies(companies.filter((company) => company.id !== id))
      } catch (err) {
        console.error("Error deleting company:", err)
        setError("Failed to delete company. Please try again later.")
      }
    }
  }

  const handleVerifyCompany = async (id: string, currentStatus: boolean) => {
    try {
      if (isMockEnabled()) {
        // Mock update
        setCompanies(
          companies.map((company) => (company.id === id ? { ...company, verified: !currentStatus } : company)),
        )
        return
      }

      // Real API update
      await adminApi.updateCompany(id, { verified: !currentStatus })
      setCompanies(companies.map((company) => (company.id === id ? { ...company, verified: !currentStatus } : company)))
    } catch (err) {
      console.error("Error updating company verification status:", err)
      setError("Failed to update verification status. Please try again later.")
    }
  }

  const handleEditCompany = (id: string) => {
    router.push(`/admin/companies/edit/${id}`)
  }

  const handleViewCompany = (id: string) => {
    router.push(`/companies/${id}`)
  }

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Company Management</CardTitle>
            <CardDescription>Manage all companies registered on the platform</CardDescription>
          </div>
          <Button onClick={() => router.push("/admin/register")}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Company
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Search companies by name, industry, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Industry</th>
                  <th className="px-4 py-2 text-left">Location</th>
                  <th className="px-4 py-2 text-left">Verification</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2">
                          <Skeleton className="h-6 w-32" />
                        </td>
                        <td className="px-4 py-2">
                          <Skeleton className="h-6 w-24" />
                        </td>
                        <td className="px-4 py-2">
                          <Skeleton className="h-6 w-40" />
                        </td>
                        <td className="px-4 py-2">
                          <Skeleton className="h-6 w-16" />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Skeleton className="h-8 w-32 ml-auto" />
                        </td>
                      </tr>
                    ))
                ) : filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <tr key={company.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{company.name}</td>
                      <td className="px-4 py-2">{company.industry}</td>
                      <td className="px-4 py-2">{company.location}</td>
                      <td className="px-4 py-2">
                        {company.verified ? (
                          <Badge className="bg-green-100 text-green-800">Verified</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">Unverified</Badge>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewCompany(company.id)}>
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditCompany(company.id)}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant={company.verified ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleVerifyCompany(company.id, company.verified)}
                          >
                            {company.verified ? (
                              <>
                                <XCircle className="w-4 h-4 mr-1" />
                                Unverify
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Verify
                              </>
                            )}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteCompany(company.id)}>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No companies found. {searchTerm && "Try adjusting your search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
