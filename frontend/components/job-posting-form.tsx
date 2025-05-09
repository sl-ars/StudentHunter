"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { ApplicationQuestionsForm } from "./application-questions-form"

interface JobPostingFormProps {
  onSubmit: (data: any) => Promise<void>
  initialData?: any
}

interface ApplicationQuestion {
  id: string
  question: string
  type: string
  required: boolean
}

export function JobPostingForm({ onSubmit, initialData }: JobPostingFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const [formData, setFormData] = useState(
    initialData ? {
      ...initialData,
      requirements: Array.isArray(initialData.requirements) 
        ? initialData.requirements.join('\n') 
        : initialData.requirements || "",
      responsibilities: Array.isArray(initialData.responsibilities)
        ? initialData.responsibilities.join('\n')
        : initialData.responsibilities || "",
      benefits: Array.isArray(initialData.benefits)
        ? initialData.benefits.join('\n')
        : initialData.benefits || "",
    } : {
      title: "",
      type: "",
      location: "",
      salary: "",
      description: "",
      requirements: "",
      responsibilities: "",
      benefits: "",
      company: user?.company || "",
      company_id: user?.company_id || "",
    },
  )

  const [applicationQuestions, setApplicationQuestions] = useState<ApplicationQuestion[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Convert newline-separated text to arrays for JSON fields
      const processedData = {
        ...formData,
        requirements: Array.isArray(formData.requirements) 
          ? formData.requirements 
          : formData.requirements.split('\n').filter(Boolean),
        responsibilities: Array.isArray(formData.responsibilities)
          ? formData.responsibilities
          : formData.responsibilities.split('\n').filter(Boolean),
        benefits: Array.isArray(formData.benefits)
          ? formData.benefits
          : formData.benefits.split('\n').filter(Boolean),
        applicationQuestions,
        company: user?.company || formData.company,
        company_id: user?.company_id || formData.company_id,
      }

      await onSubmit(processedData)
      toast({
        title: initialData ? "Job updated" : "Job posted",
        description: initialData
          ? "Your job posting has been updated successfully"
          : "Your job has been posted successfully",
      })
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "Failed to save job posting. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{initialData ? "Edit Job Posting" : "Post a New Job"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="title">Job Title</label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="type">Job Type</label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="location">Location</label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="salary">Salary Range</label>
              <Input
                id="salary"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="e.g. $50,000 - $70,000"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="company">Company Name</label>
              <Input
                id="company"
                value={formData.company}
                readOnly
                disabled
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="company_id">Company ID</label>
              <Input
                id="company_id"
                value={formData.company_id}
                readOnly
                disabled
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description">Job Description</label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="requirements">Requirements</label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="Enter each requirement on a new line"
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="responsibilities">Responsibilities</label>
            <Textarea
              id="responsibilities"
              value={formData.responsibilities}
              onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
              placeholder="Enter each responsibility on a new line"
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="benefits">Benefits</label>
            <Textarea
              id="benefits"
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              placeholder="Enter each benefit on a new line"
              rows={5}
              required
            />
          </div>

          <div className="space-y-6">
            <ApplicationQuestionsForm questions={applicationQuestions} onChange={setApplicationQuestions} />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : initialData ? "Update Job" : "Post Job"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
