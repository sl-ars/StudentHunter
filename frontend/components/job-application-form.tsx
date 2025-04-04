"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { jobApi } from "@/lib/api/jobs"
import { useToast } from "@/hooks/use-toast"

interface JobApplicationFormProps {
  jobId?: string
  onSubmit?: (data: any) => void
  isLoading?: boolean
  standalone?: boolean
}

export function JobApplicationForm({
  jobId,
  onSubmit,
  isLoading = false,
  standalone = false,
}: JobApplicationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    coverLetter: "",
    resume: null as File | null,
    resumeUrl: "",
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, agreeToTerms: checked }))
    if (errors.agreeToTerms) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.agreeToTerms
        return newErrors
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, resume: file }))
    if (errors.resume) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.resume
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.coverLetter.trim()) newErrors.coverLetter = "Cover letter is required"
    if (!formData.resume && !formData.resumeUrl) newErrors.resume = "Resume is required"
    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    if (onSubmit) {
      onSubmit(formData)
      return
    }

    if (!jobId) {
      toast({
        title: "Error",
        description: "Job ID is required",
        variant: "destructive",
      })
      return
    }

    try {
      await jobApi.applyToJob(jobId, formData)
      toast({
        title: "Application submitted",
        description: "Your application has been successfully submitted.",
      })
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        coverLetter: "",
        resume: null,
        resumeUrl: "",
        agreeToTerms: false,
      })
    } catch (error) {
      console.error("Error applying to job:", error)
      toast({
        title: "Application failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className={standalone ? "space-y-6 p-4 border rounded-lg" : "space-y-4"}>
      {standalone && <div className="text-xl font-semibold mb-4">Apply for this Position</div>}

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john.doe@example.com"
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="(123) 456-7890"
          className={errors.phone ? "border-destructive" : ""}
        />
        {errors.phone && <p className="text-destructive text-sm">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="resume">Resume</Label>
        <Input
          id="resume"
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className={errors.resume ? "border-destructive" : ""}
        />
        {errors.resume && <p className="text-destructive text-sm">{errors.resume}</p>}
        <p className="text-xs text-muted-foreground">Accepted formats: PDF, DOC, DOCX</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverLetter">Cover Letter</Label>
        <Textarea
          id="coverLetter"
          name="coverLetter"
          value={formData.coverLetter}
          onChange={handleChange}
          placeholder="Tell us why you're a good fit for this position..."
          className={`min-h-[120px] ${errors.coverLetter ? "border-destructive" : ""}`}
        />
        {errors.coverLetter && <p className="text-destructive text-sm">{errors.coverLetter}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="agreeToTerms"
          checked={formData.agreeToTerms}
          onCheckedChange={handleCheckboxChange}
          className={errors.agreeToTerms ? "border-destructive" : ""}
        />
        <Label htmlFor="agreeToTerms" className="text-sm">
          I agree to the terms and conditions and privacy policy
        </Label>
      </div>
      {errors.agreeToTerms && <p className="text-destructive text-sm">{errors.agreeToTerms}</p>}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  )
}
