"use client"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { JobApplicationForm } from "@/components/job-application-form"
import { jobsApi } from "@/lib/api/jobs"
import { useToast } from "@/hooks/use-toast"

// Mock the jobs API
jest.mock("@/lib/api/jobs", () => ({
  jobsApi: {
    applyToJob: jest.fn(),
  },
}))

// Mock the toast hook
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}))

describe("JobApplicationForm Component", () => {
  const mockJobId = "job-123"
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock successful API call
    // @ts-ignore
    jobsApi.applyToJob.mockResolvedValue({ success: true })

    // Mock toast
    // @ts-ignore
    useToast.mockReturnValue({
      toast: jest.fn(),
    })
  })

  it("renders the form with all required fields", () => {
    render(<JobApplicationForm jobId={mockJobId} />)

    // Check for form fields
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/resume/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cover letter/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/i agree to the terms/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /submit application/i })).toBeInTheDocument()
  })

  it("validates required fields on submit", async () => {
    render(<JobApplicationForm jobId={mockJobId} />)

    // Submit the form without filling any fields
    fireEvent.click(screen.getByRole("button", { name: /submit application/i }))

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/phone number is required/i)).toBeInTheDocument()
      expect(screen.getByText(/cover letter is required/i)).toBeInTheDocument()
      expect(screen.getByText(/resume is required/i)).toBeInTheDocument()
      expect(screen.getByText(/you must agree to the terms/i)).toBeInTheDocument()
    })

    // API should not be called
    expect(jobsApi.applyToJob).not.toHaveBeenCalled()
  })

  it("validates email format", async () => {
    render(<JobApplicationForm jobId={mockJobId} />)

    // Fill in name
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "John Doe" },
    })

    // Fill in invalid email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "invalid-email" },
    })

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /submit application/i }))

    // Check for email validation error
    await waitFor(() => {
      expect(screen.getByText(/email is invalid/i)).toBeInTheDocument()
    })
  })

  it("calls onSubmit prop when provided instead of API", async () => {
    render(<JobApplicationForm onSubmit={mockOnSubmit} />)

    // Fill in all required fields
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "John Doe" },
    })

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "john.doe@example.com" },
    })

    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: "(123) 456-7890" },
    })

    fireEvent.change(screen.getByLabelText(/cover letter/i), {
      target: { value: "This is my cover letter" },
    })

    // Mock file input
    const file = new File(["dummy content"], "resume.pdf", { type: "application/pdf" })
    fireEvent.change(screen.getByLabelText(/resume/i), {
      target: { files: [file] },
    })

    // Check terms
    fireEvent.click(screen.getByLabelText(/i agree to the terms/i))

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /submit application/i }))

    // Check if onSubmit was called with form data
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "(123) 456-7890",
          coverLetter: "This is my cover letter",
          resume: file,
          agreeToTerms: true,
        }),
      )
    })

    // API should not be called
    expect(jobsApi.applyToJob).not.toHaveBeenCalled()
  })

  it("calls the API when jobId is provided and no onSubmit prop", async () => {
    render(<JobApplicationForm jobId={mockJobId} />)

    // Fill in all required fields
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "John Doe" },
    })

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "john.doe@example.com" },
    })

    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: "(123) 456-7890" },
    })

    fireEvent.change(screen.getByLabelText(/cover letter/i), {
      target: { value: "This is my cover letter" },
    })

    // Mock file input
    const file = new File(["dummy content"], "resume.pdf", { type: "application/pdf" })
    fireEvent.change(screen.getByLabelText(/resume/i), {
      target: { files: [file] },
    })

    // Check terms
    fireEvent.click(screen.getByLabelText(/i agree to the terms/i))

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /submit application/i }))

    // Check if API was called with correct data
    await waitFor(() => {
      expect(jobsApi.applyToJob).toHaveBeenCalledWith(
        mockJobId,
        expect.objectContaining({
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "(123) 456-7890",
          coverLetter: "This is my cover letter",
          resume: file,
          agreeToTerms: true,
        }),
      )
    })
  })

  it("shows loading state when isLoading prop is true", () => {
    render(<JobApplicationForm jobId={mockJobId} isLoading={true} />)

    // Check if submit button shows loading state
    expect(screen.getByRole("button", { name: /submitting/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /submitting/i })).toBeDisabled()
  })

  it("renders in standalone mode when standalone prop is true", () => {
    render(<JobApplicationForm jobId={mockJobId} standalone={true} />)

    // Check for standalone title
    expect(screen.getByText(/apply for this position/i)).toBeInTheDocument()
  })
})
