import type { Job } from "../types"

export const mockJobs: Record<string, Job> = {
  "1": {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    companyId: "1",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120,000 - $160,000",
    description: "We are seeking a Senior Frontend Developer to join our team...",
    requirements: [
      "5+ years of experience with React",
      "Strong TypeScript skills",
      "Experience with Next.js",
      "Understanding of web performance optimization",
    ],
    responsibilities: [
      "Lead frontend development initiatives",
      "Mentor junior developers",
      "Architect scalable solutions",
      "Collaborate with design team",
    ],
    benefits: [
      "Competitive salary",
      "Health insurance",
      "401(k) matching",
      "Remote work options",
      "Professional development budget",
    ],
    postedAt: "2024-02-20",
    applicationQuestions: [
      {
        id: "q1",
        type: "text",
        question: "Describe your experience with React and Next.js",
        required: true,
      },
      {
        id: "q2",
        type: "singleChoice",
        question: "Are you willing to work on-site in San Francisco?",
        required: true,
        options: ["Yes", "No", "Open to discussion"],
      },
    ],
  },
  // Add more mock jobs here...
}

