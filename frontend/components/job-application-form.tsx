"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ResumeUpload } from "@/components/resume-upload"
import type { ApplicationQuestion } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { Briefcase, GraduationCap, FileText, CheckCircle, AlertCircle } from "lucide-react"

interface JobApplicationFormProps {
  job: {
    id: string
    title: string
    company: string
    applicationQuestions?: ApplicationQuestion[]
  }
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  existingResumes?: { id: string; name: string; url: string }[]
}

export function JobApplicationForm({ job, isOpen, onClose, onSubmit, existingResumes = [] }: JobApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedResume, setSelectedResume] = useState<string>("")
  const [newResume, setNewResume] = useState<File | null>(null)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [currentStep, setCurrentStep] = useState(1)
  const { toast } = useToast()

  // Add campus-specific questions
  const campusQuestions: ApplicationQuestion[] = [
    {
      id: "campus-1",
      type: "text",
      question: "What is your current GPA?",
      required: true,
    },
    {
      id: "campus-2",
      type: "singleChoice",
      question: "Are you eligible to work in this location?",
      required: true,
      options: ["Yes", "No", "Need Visa Sponsorship"],
    },
    {
      id: "campus-3",
      type: "multipleChoice",
      question: "Which career services have you utilized?",
      required: false,
      options: ["Resume Review", "Mock Interviews", "Career Counseling", "Career Fairs", "Networking Events"],
    },
  ]

  // Combine job questions with campus questions
  const allQuestions = [...(job.applicationQuestions || []), ...campusQuestions]

  const handleResumeUpload = async (file: File) => {
    setNewResume(file)
    setSelectedResume("")
  }

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required questions
      const unansweredRequired = allQuestions.filter((q) => q.required && !answers[q.id]).map((q) => q.question)

      if (unansweredRequired.length > 0) {
        toast({
          title: "Required questions",
          description: "Please answer all required questions",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Validate resume
      if (!selectedResume && !newResume) {
        toast({
          title: "Resume required",
          description: "Please select or upload a resume",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      await onSubmit({
        resumeId: selectedResume,
        newResume,
        answers,
      })

      onClose()
      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep === 1 && !selectedResume && !newResume) {
      toast({
        title: "Resume required",
        description: "Please select or upload a resume",
        variant: "destructive",
      })
      return
    }
    setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const renderQuestion = (question: ApplicationQuestion, index: number) => {
    const questionColors = [
      "from-vibrant-blue to-vibrant-purple",
      "from-vibrant-green to-vibrant-blue",
      "from-vibrant-orange to-vibrant-pink",
      "from-vibrant-purple to-vibrant-blue",
      "from-vibrant-pink to-vibrant-orange",
    ]

    const colorIndex = index % questionColors.length
    const gradientClass = `bg-gradient-to-r ${questionColors[colorIndex]}`

    return (
      <div key={question.id} className="mb-6 rounded-xl overflow-hidden border border-muted">
        <div className={`${gradientClass} px-4 py-3 text-white`}>
          <Label className="text-white font-medium flex items-center">
            {question.question}
            {question.required && <AlertCircle className="w-4 h-4 ml-2 text-vibrant-yellow" />}
          </Label>
        </div>
        <div className="p-4 bg-white dark:bg-gray-900">
          {question.type === "text" && (
            <Textarea
              value={(answers[question.id] as string) || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Enter your answer"
              className="mt-2 border-muted focus:border-vibrant-blue"
            />
          )}
          {question.type === "singleChoice" && (
            <RadioGroup
              value={answers[question.id] as string}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
              className="mt-2 space-y-2"
            >
              {question.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                  <Label htmlFor={`${question.id}-${option}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
          {question.type === "multipleChoice" && (
            <div className="mt-2 space-y-2">
              {question.options?.map((option) => {
                const selectedOptions = (answers[question.id] as string[]) || []
                return (
                  <div key={option} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50">
                    <Checkbox
                      id={`${question.id}-${option}`}
                      checked={selectedOptions.includes(option)}
                      onCheckedChange={(checked) => {
                        const newValue = checked
                          ? [...selectedOptions, option]
                          : selectedOptions.filter((o) => o !== option)
                        handleAnswerChange(question.id, newValue)
                      }}
                    />
                    <Label htmlFor={`${question.id}-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  const hasQuestions = allQuestions && allQuestions.length > 0
  const totalSteps = hasQuestions ? 2 : 1

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-background to-muted/30 border-none shadow-lg">
        <DialogHeader className="bg-gradient-to-r from-vibrant-blue to-vibrant-purple p-6 -mx-6 -mt-6 rounded-t-lg text-white">
          <DialogTitle className="text-2xl flex items-center">
            <Briefcase className="w-6 h-6 mr-2" />
            Apply for {job.title}
          </DialogTitle>
          <DialogDescription className="text-white/80">
            {job.company} • Complete the application form below to apply
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 mb-6">
          <div className="flex justify-between">
            {[...Array(totalSteps)].map((_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep > i + 1
                      ? "bg-vibrant-green text-white"
                      : currentStep === i + 1
                        ? "bg-vibrant-blue text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > i + 1 ? <CheckCircle className="w-5 h-5" /> : i + 1}
                </div>
                <span className="ml-2 text-sm font-medium">{i === 0 ? "Resume" : "Questions"}</span>
                {i < totalSteps - 1 && (
                  <div className={`h-1 w-16 mx-2 ${currentStep > i + 1 ? "bg-vibrant-green" : "bg-muted"}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-vibrant-blue/10 to-vibrant-purple/10 p-6 rounded-xl">
                <h3 className="text-lg font-semibold flex items-center text-vibrant-blue mb-4">
                  <FileText className="w-5 h-5 mr-2" />
                  Resume
                </h3>

                {existingResumes.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <Label className="text-vibrant-purple">Select existing resume</Label>
                    <Select value={selectedResume} onValueChange={setSelectedResume}>
                      <SelectTrigger className="border-vibrant-blue/20 focus:border-vibrant-blue">
                        <SelectValue placeholder="Choose a resume" />
                      </SelectTrigger>
                      <SelectContent>
                        {existingResumes.map((resume) => (
                          <SelectItem key={resume.id} value={resume.id}>
                            {resume.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {existingResumes.length > 0 && (
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>
                )}

                <ResumeUpload onUpload={handleResumeUpload} />
              </div>
            </div>
          )}

          {currentStep === 2 && hasQuestions && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-vibrant-purple/10 to-vibrant-blue/10 p-6 rounded-xl mb-6">
                <h3 className="text-lg font-semibold flex items-center text-vibrant-purple mb-4">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Application Questions
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Please answer the following questions to complete your application. Questions marked with{" "}
                  <AlertCircle className="w-3 h-3 inline text-vibrant-yellow" /> are required.
                </p>

                {allQuestions.map((question, index) => renderQuestion(question, index))}
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between mt-6 pt-4 border-t">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="hover:bg-vibrant-blue/10 hover:text-vibrant-blue"
              >
                Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="hover:bg-vibrant-pink/10 hover:text-vibrant-pink"
              >
                Cancel
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue transition-all duration-300"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-vibrant-green to-vibrant-blue hover:from-vibrant-blue hover:to-vibrant-green transition-all duration-300"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

