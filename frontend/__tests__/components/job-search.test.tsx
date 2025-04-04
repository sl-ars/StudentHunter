import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { JobSearch } from "@/components/job-search"
import { jobsApi } from "@/lib/api/jobs"
import { mockJobs } from "@/lib/mock-data/jobs"

// Mock the next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}))

// Mock the jobs API
jest.mock("@/lib/api/jobs", () => ({
  jobsApi: {
    getJobs: jest.fn(),
  },
}))

describe("JobSearch Component", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Mock the API response
    const mockResponse = {
      data: {
        results: mockJobs.slice(0, 5),
        count: mockJobs.length,
      },
    }

    // @ts-ignore - TypeScript doesn't know about our mock
    jobsApi.getJobs.mockResolvedValue(mockResponse)
  })

  it("renders the search form", () => {
    render(<JobSearch />)

    expect(screen.getByPlaceholderText(/job title, keywords, or company/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /search jobs/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /filters/i })).toBeInTheDocument()
  })

  it("shows filters when the filters button is clicked", async () => {
    render(<JobSearch />)

    // Filters should be hidden initially
    expect(screen.queryByText(/location/i)).not.toBeInTheDocument()

    // Click the filters button
    fireEvent.click(screen.getByRole("button", { name: /filters/i }))

    // Filters should be visible now
    await waitFor(() => {
      expect(screen.getByText(/location/i)).toBeInTheDocument()
      expect(screen.getByText(/job type/i)).toBeInTheDocument()
      expect(screen.getByText(/remote only/i)).toBeInTheDocument()
      expect(screen.getByText(/salary range/i)).toBeInTheDocument()
    })
  })

  it("calls the API with search parameters when form is submitted", async () => {
    render(<JobSearch />)

    // Enter search query
    fireEvent.change(screen.getByPlaceholderText(/job title, keywords, or company/i), {
      target: { value: "developer" },
    })

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /search jobs/i }))

    // Check if API was called with correct parameters
    await waitFor(() => {
      expect(jobsApi.getJobs).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "developer",
          page: 1,
          limit: 10,
        }),
      )
    })
  })

  it("displays job results when API returns data", async () => {
    render(<JobSearch />)

    // Wait for the initial API call to complete
    await waitFor(() => {
      expect(jobsApi.getJobs).toHaveBeenCalled()
    })

    // Check if job cards are rendered
    await waitFor(() => {
      // We should have 5 job cards based on our mock
      expect(screen.getAllByText(/view details/i)).toHaveLength(5)
    })
  })

  it("shows loading state while fetching jobs", async () => {
    // Make the API call hang
    // @ts-ignore
    jobsApi.getJobs.mockImplementation(() => new Promise(() => {}))

    render(<JobSearch />)

    // Check for loading skeletons
    expect(screen.getAllByTestId("skeleton")).toHaveLength(3)
  })

  it("clears all filters when clear filters button is clicked", async () => {
    render(<JobSearch />)

    // Show filters
    fireEvent.click(screen.getByRole("button", { name: /filters/i }))

    // Enter search query
    fireEvent.change(screen.getByPlaceholderText(/job title, keywords, or company/i), {
      target: { value: "developer" },
    })

    // Wait for filters to be visible
    await waitFor(() => {
      expect(screen.getByText(/clear filters/i)).toBeInTheDocument()
    })

    // Click clear filters
    fireEvent.click(screen.getByText(/clear filters/i))

    // Check if search input was cleared
    expect(screen.getByPlaceholderText(/job title, keywords, or company/i)).toHaveValue("")

    // Check if API was called with empty parameters
    await waitFor(() => {
      expect(jobsApi.getJobs).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
        }),
      )

      // Make sure search parameter is not included
      expect(jobsApi.getJobs).not.toHaveBeenCalledWith(
        expect.objectContaining({
          search: "developer",
        }),
      )
    })
  })
})
