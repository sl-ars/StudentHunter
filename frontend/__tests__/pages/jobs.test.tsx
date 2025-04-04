import { render, screen } from "@testing-library/react"
import JobsPage from "@/app/jobs/page"
import { JobSearch } from "@/components/job-search"

// Mock the JobSearch component
jest.mock("@/components/job-search", () => ({
  JobSearch: jest.fn(() => <div data-testid="mock-job-search">JobSearch Component</div>),
}))

describe("Jobs Page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders the page title and description", () => {
    render(<JobsPage />)

    expect(screen.getByText(/find your next opportunity/i)).toBeInTheDocument()
    expect(screen.getByText(/browse and apply to jobs/i)).toBeInTheDocument()
  })

  it("renders the JobSearch component", () => {
    render(<JobsPage />)

    expect(screen.getByTestId("mock-job-search")).toBeInTheDocument()
    expect(JobSearch).toHaveBeenCalled()
  })

  it("has the correct page structure", () => {
    render(<JobsPage />)

    // Check for main container
    const container = screen.getByRole("main")
    expect(container).toHaveClass("container")

    // Check for header section
    const header = screen.getByText(/find your next opportunity/i).closest("div")
    expect(header).toBeInTheDocument()

    // Check for content section
    const content = screen.getByTestId("mock-job-search").closest("div")
    expect(content).toBeInTheDocument()
  })
})
