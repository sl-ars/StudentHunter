import apiClient from "./client"
import type { ApiResponse } from "./client"
import { mockResumes } from "../mock-data/resumes"
import { isMockEnabled } from "../utils/config"

export interface Resume {
  id: string
  userId: string
  name: string
  url: string
  createdAt: string
  updatedAt?: string
  isDefault?: boolean
  applicationCount?: number
}

export const resumeApi = {
  // Get all resumes for a user
  getUserResumes: async (): Promise<ApiResponse<Resume[]>> => {
    if (isMockEnabled()) {
      // Mock implementation
      // Filter resumes for the current user (in a real app, we'd get the user ID from auth)
      const currentUserId = "user-1" // This would come from auth context in a real app
      const userResumes = mockResumes.filter((resume) => resume.userId === currentUserId)

      return {
        status: "success",
        data: userResumes,
        message: "Resumes retrieved successfully",
      }
    }

    // Real API implementation
    const response = await apiClient.get<ApiResponse<Resume[]>>("/resumes/")
    return response.data
  },

  // Upload a new resume
  uploadResume: async (file: File, name?: string): Promise<ApiResponse<Resume>> => {
    if (isMockEnabled()) {
      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay

      const mockUrl = `/mock-uploads/resume-${Date.now()}.pdf`
      const newResume = {
        id: `resume-${Date.now()}`,
        userId: "user-1", // This would come from auth context in a real app
        name: name || file.name,
        url: mockUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDefault: mockResumes.filter((resume) => resume.userId === "user-1").length === 0, // Make default if first resume
        applicationCount: 0,
      }

      // Add to mock data
      mockResumes.unshift(newResume)

      return {
        status: "success",
        data: newResume,
        message: "Resume uploaded successfully",
      }
    }

    // Real API implementation
    const formData = new FormData()
    formData.append("file", file)
    if (name) {
      formData.append("name", name)
    }

    const response = await apiClient.post<ApiResponse<Resume>>("/resumes/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  // Delete a resume
  deleteResume: async (resumeId: string): Promise<ApiResponse<{ success: boolean }>> => {
    if (isMockEnabled()) {
      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay

      // Remove from mock data
      const index = mockResumes.findIndex((r) => r.id === resumeId)
      if (index !== -1) {
        mockResumes.splice(index, 1)
      }

      return {
        status: "success",
        data: { success: true },
        message: "Resume deleted successfully",
      }
    }

    // Real API implementation
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/resumes/${resumeId}`)
    return response.data
  },

  // Set a resume as default
  setDefaultResume: async (resumeId: string): Promise<ApiResponse<{ success: boolean }>> => {
    if (isMockEnabled()) {
      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay

      // Update mock data
      mockResumes.forEach((resume) => {
        if (resume.userId === "user-1") {
          resume.isDefault = resume.id === resumeId
        }
      })

      return {
        status: "success",
        data: { success: true },
        message: "Default resume set successfully",
      }
    }

    // Real API implementation
    const response = await apiClient.put<ApiResponse<{ success: boolean }>>(`/resumes/${resumeId}/default`)
    return response.data
  },

  // Rename a resume
  renameResume: async (resumeId: string, newName: string): Promise<ApiResponse<Resume>> => {
    if (isMockEnabled()) {
      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay

      // Update mock data
      const resume = mockResumes.find((r) => r.id === resumeId)
      if (resume) {
        resume.name = newName
        resume.updatedAt = new Date().toISOString()
      }

      return {
        status: "success",
        data: resume!,
        message: "Resume renamed successfully",
      }
    }

    // Real API implementation
    const response = await apiClient.put<ApiResponse<Resume>>(`/resumes/${resumeId}/rename`, { name: newName })
    return response.data
  },

  // Analyze a resume
  analyzeResume: async (resumeId: string): Promise<ApiResponse<any>> => {
    if (isMockEnabled()) {
      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay

      // Generate mock analysis data
      const mockAnalysis = {
        overallScore: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
        strengths: [
          "Strong experience section with quantifiable achievements",
          "Clear and concise bullet points",
          "Good use of action verbs",
          "Relevant skills highlighted",
        ],
        improvementAreas: [
          "Summary could be more targeted to specific roles",
          "Consider adding more industry keywords",
          "Education section could be more detailed",
        ],
        skills: [
          "JavaScript",
          "React",
          "Node.js",
          "TypeScript",
          "HTML",
          "CSS",
          "Git",
          "REST APIs",
          "SQL",
          "MongoDB",
          "AWS",
          "Docker",
        ],
        summary:
          "Your resume demonstrates strong technical skills and experience, with clear achievements. Consider enhancing your summary and adding more industry-specific keywords to improve ATS compatibility.",
        sections: {
          experience: {
            score: Math.floor(Math.random() * 20) + 80,
            feedback: [
              "Strong use of action verbs and quantifiable results",
              "Good chronological order",
              "Consider adding more context about project impact",
            ],
          },
          education: {
            score: Math.floor(Math.random() * 30) + 70,
            feedback: [
              "Education section is clear and well-formatted",
              "Consider adding relevant coursework or projects",
              "GPA could be included if it's strong",
            ],
          },
          skills: {
            score: Math.floor(Math.random() * 20) + 80,
            feedback: [
              "Good range of technical skills listed",
              "Consider organizing skills by proficiency or category",
              "Add more soft skills to balance technical abilities",
            ],
          },
          summary: {
            score: Math.floor(Math.random() * 40) + 60,
            feedback: [
              "Summary provides a good overview of experience",
              "Could be more targeted to specific job types",
              "Consider highlighting your unique value proposition",
            ],
          },
        },
        format: {
          layout: {
            score: Math.floor(Math.random() * 30) + 70,
            feedback: [
              "Clean and professional layout",
              "Good use of white space",
              "Consider more consistent formatting for dates",
            ],
          },
          readability: {
            score: Math.floor(Math.random() * 20) + 80,
            feedback: [
              "Font choices are professional and readable",
              "Good section headings and organization",
              "Consider slightly larger line spacing",
            ],
          },
          pages: 1,
          wordCount: Math.floor(Math.random() * 300) + 400,
          bulletPoints: Math.floor(Math.random() * 10) + 15,
          recommendations: [
            "Keep resume to 1-2 pages maximum",
            "Ensure consistent formatting throughout",
            "Use standard fonts like Arial, Calibri, or Times New Roman",
          ],
        },
        ats: {
          score: Math.floor(Math.random() * 30) + 70,
          summary:
            "Your resume is generally ATS-friendly, but could benefit from more targeted keywords relevant to your desired positions.",
          recommendations: [
            "Include more job-specific keywords from target job descriptions",
            "Avoid using tables, headers/footers, or complex formatting",
            "Use standard section headings that ATS systems recognize",
          ],
        },
        keywords: {
          industry: [
            "Software Development",
            "Web Development",
            "Full Stack",
            "Frontend",
            "Backend",
            "Cloud Computing",
            "DevOps",
            "Agile",
          ],
          skills: [
            "JavaScript",
            "React",
            "Node.js",
            "TypeScript",
            "HTML",
            "CSS",
            "Git",
            "REST APIs",
            "SQL",
            "MongoDB",
            "AWS",
            "Docker",
          ],
          found: [
            "JavaScript",
            "React",
            "Node.js",
            "TypeScript",
            "HTML",
            "CSS",
            "Git",
            "REST APIs",
            "Software Development",
            "Web Development",
          ],
        },
      }

      return {
        status: "success",
        data: mockAnalysis,
        message: "Resume analyzed successfully",
      }
    }

    // Real API implementation
    const response = await apiClient.get<ApiResponse<any>>(`/resumes/${resumeId}/analyze`)
    return response.data
  },

  // Match resume to jobs
  matchResumeToJobs: async (resumeId: string): Promise<ApiResponse<any[]>> => {
    if (isMockEnabled()) {
      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay

      // Generate mock job matches
      const mockMatches = [
        {
          id: "job-1",
          title: "Senior Frontend Developer",
          company: "TechCorp Inc.",
          location: "San Francisco, CA",
          matchScore: 87,
          skills: [
            { name: "React", match: true },
            { name: "TypeScript", match: true },
            { name: "Redux", match: false },
            { name: "JavaScript", match: true },
            { name: "HTML/CSS", match: true },
            { name: "GraphQL", match: false },
          ],
          recommendations: [
            "Add experience with Redux to your resume",
            "Highlight any GraphQL experience you may have",
            "Emphasize your experience with modern React patterns",
          ],
        },
        {
          id: "job-2",
          title: "Full Stack Engineer",
          company: "InnovateSoft",
          location: "Remote",
          matchScore: 76,
          skills: [
            { name: "Node.js", match: true },
            { name: "React", match: true },
            { name: "MongoDB", match: true },
            { name: "AWS", match: true },
            { name: "Docker", match: false },
            { name: "Kubernetes", match: false },
          ],
          recommendations: [
            "Add Docker and container experience to your resume",
            "Highlight any cloud deployment experience",
            "Emphasize full-stack projects you've completed",
          ],
        },
        {
          id: "job-3",
          title: "JavaScript Developer",
          company: "WebSolutions Ltd",
          location: "New York, NY",
          matchScore: 92,
          skills: [
            { name: "JavaScript", match: true },
            { name: "HTML/CSS", match: true },
            { name: "React", match: true },
            { name: "Node.js", match: true },
            { name: "REST APIs", match: true },
            { name: "Git", match: true },
          ],
          recommendations: [
            "Your resume is a strong match for this position",
            "Consider highlighting specific JavaScript projects",
            "Emphasize your experience with modern JavaScript features",
          ],
        },
        {
          id: "job-4",
          title: "Backend Developer",
          company: "DataSystems Inc.",
          location: "Austin, TX",
          matchScore: 68,
          skills: [
            { name: "Node.js", match: true },
            { name: "Express", match: true },
            { name: "SQL", match: true },
            { name: "MongoDB", match: true },
            { name: "Python", match: false },
            { name: "Microservices", match: false },
          ],
          recommendations: [
            "Add any Python experience to your resume",
            "Highlight experience with microservices architecture",
            "Emphasize database optimization skills",
          ],
        },
        {
          id: "job-5",
          title: "React Native Developer",
          company: "MobileApps Co.",
          location: "Chicago, IL",
          matchScore: 72,
          skills: [
            { name: "React", match: true },
            { name: "JavaScript", match: true },
            { name: "TypeScript", match: true },
            { name: "React Native", match: false },
            { name: "Mobile Development", match: false },
            { name: "Redux", match: false },
          ],
          recommendations: [
            "Add any mobile development experience to your resume",
            "Highlight React Native projects or knowledge",
            "Emphasize cross-platform development skills",
          ],
        },
      ]

      return {
        status: "success",
        data: mockMatches,
        message: "Resume matched to jobs successfully",
      }
    }

    // Real API implementation
    const response = await apiClient.get<ApiResponse<any[]>>(`/resumes/${resumeId}/match-jobs`)
    return response.data
  },

  // Match resume to a specific job
  matchResumeToJob: async (resumeId: string, jobId: string): Promise<ApiResponse<any>> => {
    if (isMockEnabled()) {
      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate network delay

      // Generate mock job match
      const mockMatch = {
        id: jobId,
        title: "Senior Frontend Developer",
        company: "TechCorp Inc.",
        location: "San Francisco, CA",
        matchScore: 87,
        skills: [
          { name: "React", match: true },
          { name: "TypeScript", match: true },
          { name: "Redux", match: false },
          { name: "JavaScript", match: true },
          { name: "HTML/CSS", match: true },
          { name: "GraphQL", match: false },
        ],
        recommendations: [
          "Add experience with Redux to your resume",
          "Highlight any GraphQL experience you may have",
          "Emphasize your experience with modern React patterns",
          "Include more details about your frontend architecture experience",
          "Add metrics or quantifiable achievements to your projects",
        ],
        keywordMatch: 78,
        experienceMatch: 85,
        educationMatch: 90,
        missingKeywords: ["Redux", "GraphQL", "Webpack", "Performance Optimization"],
      }

      return {
        status: "success",
        data: mockMatch,
        message: "Resume matched to job successfully",
      }
    }

    // Real API implementation
    const response = await apiClient.get<ApiResponse<any>>(`/resumes/${resumeId}/match-job/${jobId}`)
    return response.data
  },
}
