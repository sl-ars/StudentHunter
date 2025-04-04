import type React from "react"
import type { ReactElement } from "react"
import { render, type RenderOptions } from "@testing-library/react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { NotificationProvider } from "@/contexts/notification-context"

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="studenthunter-theme">
      <AuthProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options })

// Mock authenticated user
export const mockAuthenticatedUser = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  role: "student",
  avatar: "/placeholder.svg",
}

// Mock employer user
export const mockEmployerUser = {
  id: "employer-1",
  name: "Employer User",
  email: "employer@example.com",
  role: "employer",
  avatar: "/placeholder.svg",
}

// Mock admin user
export const mockAdminUser = {
  id: "admin-1",
  name: "Admin User",
  email: "admin@example.com",
  role: "admin",
  avatar: "/placeholder.svg",
}

// Mock job data
export const mockJob = {
  id: "job-1",
  title: "Software Engineer",
  company: "Tech Company",
  location: "San Francisco, CA",
  salary: "$120,000 - $150,000",
  type: "Full-time",
  postedDate: "2023-01-01T00:00:00.000Z",
  postedAt: "2 days ago",
  description: "This is a job description",
}

// Mock resume data
export const mockResume = {
  id: "resume-1",
  userId: "user-1",
  name: "My Resume",
  url: "/mock-resume.pdf",
  createdAt: "2023-01-01T00:00:00.000Z",
  isDefault: true,
  applicationCount: 5,
}

// re-export everything
export * from "@testing-library/react"
export { customRender as render }
