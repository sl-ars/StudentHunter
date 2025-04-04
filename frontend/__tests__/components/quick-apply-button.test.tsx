"use client"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { QuickApplyButton } from "@/components/quick-apply-button"
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

// Mock the JobApplicationForm component
jest.mock("@/components/job-application-form", () => ({
  JobApplicationForm: ({ onSubmit, isLoading }) => (
    <div data-testid="mock-job-application-form">
      <button onClick={() => onSubmit({ name: "Test User" })} disabled={isLoading}>
        Submit Mock Form
      </button>
    </div>
  ),
}))

describe("QuickApplyButton Component", () => {
  const mockJobId = "job-123"

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

  it('renders a button with "Quick Apply" text', () => {
    render(<QuickApplyButton jobId={mockJobId} />)

    expect(screen.getByRole("button", { name: /quick apply/i })).toBeInTheDocument()
  })

  it("opens a dialog when clicked", async () => {
    render(<QuickApplyButton jobId={mockJobId} />)

    // Dialog content should not be visible initially
    expect(screen.queryByText(/fill out the form below/i)).not.toBeInTheDocument()

    // Click the button
    fireEvent.click(screen.getByRole("button", { name: /quick apply/i }))

    // Dialog content should be visible
    await waitFor(() => {
      expect(screen.getByText(/fill out the form below/i)).toBeInTheDocument()
    })
  })

  it("submits the application when form is submitted", async () => {
    render(<QuickApplyButton jobId={mockJobId} />)

    // Click the button to open dialog
    fireEvent.click(screen.getByRole("button", { name: /quick apply/i }))

    // Submit the mock form
    fireEvent.click(screen.getByText(/submit mock form/i))

    // Check if API was called with correct data
    await waitFor(() => {
      expect(jobsApi.applyToJob).toHaveBeenCalledWith(
        mockJobId,
        expect.objectContaining({
          name: "Test User",
        }),
      )
    })
  })

  it("shows a success toast when application is submitted successfully", async () => {
    const { toast } = useToast() as { toast: jest.Mock }

    render(<QuickApplyButton jobId={mockJobId} />)

    // Click the button to open dialog
    fireEvent.click(screen.getByRole("button", { name: /quick apply/i }))

    // Submit the mock form
    fireEvent.click(screen.getByText(/submit mock form/i))

    // Check if toast was called with success message
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Application submitted",
          description: "Your application has been successfully submitted.",
        }),
      )
    })
  })

  it("shows an error toast when application submission fails", async () => {
    const { toast } = useToast() as { toast: jest.Mock }

    // Mock API failure
    // @ts-ignore
    jobsApi.applyToJob.mockRejectedValue(new Error("API error"))

    render(<QuickApplyButton jobId={mockJobId} />)

    // Click the button to open dialog
    fireEvent.click(screen.getByRole("button", { name: /quick apply/i }))

    // Submit the mock form
    fireEvent.click(screen.getByText(/submit mock form/i))

    // Check if toast was called with error message
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Application failed",
          description: "There was an error submitting your application. Please try again.",
          variant: "destructive",
        }),
      )
    })
  })

  it("closes the dialog after successful submission", async () => {
    render(<QuickApplyButton jobId={mockJobId} />)

    // Click the button to open dialog
    fireEvent.click(screen.getByRole("button", { name: /quick apply/i }))

    // Dialog content should be visible
    expect(screen.getByText(/fill out the form below/i)).toBeInTheDocument()

    // Submit the mock form
    fireEvent.click(screen.getByText(/submit mock form/i))

    // Dialog should close after submission
    await waitFor(() => {
      expect(screen.queryByText(/fill out the form below/i)).not.toBeInTheDocument()
    })
  })

  it("applies custom className when provided", () => {
    render(<QuickApplyButton jobId={mockJobId} className="custom-class" />)

    expect(screen.getByRole("button", { name: /quick apply/i })).toHaveClass("custom-class")
  })
})
