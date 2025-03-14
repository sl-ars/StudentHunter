import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { JobCard } from "@/components/job-card"
import { saveJob, unsaveJob } from "@/app/actions/job-actions"

// Mock the server actions
jest.mock("@/app/actions/job-actions", () => ({
  saveJob: jest.fn(),
  unsaveJob: jest.fn(),
}))

describe("JobCard Component", () => {
  const mockJob = {
    id: "job-1",
    title: "Software Engineer",
    company: {
      id: "company-1",
      name: "Tech Corp",
    },
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "120,000 - 150,000",
    description: "We are looking for a skilled software engineer to join our team.",
    postedAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isSaved: false,
    isQuickApply: true,
    tags: ["React", "TypeScript", "Node.js"],
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock successful save/unsave actions
    // @ts-ignore
    saveJob.mockResolvedValue({ success: true })
    // @ts-ignore
    unsaveJob.mockResolvedValue({ success: true })
  })

  it("renders job details correctly", () => {
    render(<JobCard job={mockJob} />)

    expect(screen.getByText("Software Engineer")).toBeInTheDocument()
    expect(screen.getByText("Tech Corp")).toBeInTheDocument()
    expect(screen.getByText("San Francisco, CA")).toBeInTheDocument()
    expect(screen.getByText("Full-time")).toBeInTheDocument()
    expect(screen.getByText("We are looking for a skilled software engineer to join our team.")).toBeInTheDocument()

    // Check for tags
    expect(screen.getByText("React")).toBeInTheDocument()
    expect(screen.getByText("TypeScript")).toBeInTheDocument()
    expect(screen.getByText("Node.js")).toBeInTheDocument()
  })

  it("renders action buttons when showActions is true", () => {
    render(<JobCard job={mockJob} showActions={true} />)

    expect(screen.getByText("View Details")).toBeInTheDocument()
    expect(screen.getByText("Quick Apply")).toBeInTheDocument()
    expect(screen.getByLabelText("Save job")).toBeInTheDocument()
  })

  it("does not render action buttons when showActions is false", () => {
    render(<JobCard job={mockJob} showActions={false} />)

    expect(screen.queryByText("View Details")).not.toBeInTheDocument()
    expect(screen.queryByText("Quick Apply")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Save job")).not.toBeInTheDocument()
  })

  it("calls saveJob when bookmark button is clicked", async () => {
    render(<JobCard job={mockJob} />)

    // Click the save button
    fireEvent.click(screen.getByLabelText("Save job"))

    // Check if saveJob was called with the correct job ID
    expect(saveJob).toHaveBeenCalledWith("job-1")

    // Wait for the state to update
    await waitFor(() => {
      // The button should now show "Unsave job"
      expect(screen.getByLabelText("Unsave job")).toBeInTheDocument()
    })
  })

  it("calls unsaveJob when bookmark button is clicked for a saved job", async () => {
    render(<JobCard job={{ ...mockJob, isSaved: true }} />)

    // The button should initially show "Unsave job"
    expect(screen.getByLabelText("Unsave job")).toBeInTheDocument()

    // Click the unsave button
    fireEvent.click(screen.getByLabelText("Unsave job"))

    // Check if unsaveJob was called with the correct job ID
    expect(unsaveJob).toHaveBeenCalledWith("job-1")

    // Wait for the state to update
    await waitFor(() => {
      // The button should now show "Save job"
      expect(screen.getByLabelText("Save job")).toBeInTheDocument()
    })
  })

  it("renders company as link when showCompanyLink is true", () => {
    render(<JobCard job={mockJob} showCompanyLink={true} />)

    // The company name should be a link
    const companyLink = screen.getByText("Tech Corp").closest("a")
    expect(companyLink).toBeInTheDocument()
    expect(companyLink).toHaveAttribute("href", "/companies/company-1")
  })

  it("renders company as text when showCompanyLink is false", () => {
    render(<JobCard job={mockJob} showCompanyLink={false} />)

    // The company name should not be a link
    const companyText = screen.getByText("Tech Corp")
    expect(companyText.closest("a")).toBeNull()
  })

  it("renders job description when showDescription is true", () => {
    render(<JobCard job={mockJob} showDescription={true} />)

    expect(screen.getByText("We are looking for a skilled software engineer to join our team.")).toBeInTheDocument()
  })

  it("does not render job description when showDescription is false", () => {
    render(<JobCard job={mockJob} showDescription={false} />)

    expect(
      screen.queryByText("We are looking for a skilled software engineer to join our team."),
    ).not.toBeInTheDocument()
  })
})
