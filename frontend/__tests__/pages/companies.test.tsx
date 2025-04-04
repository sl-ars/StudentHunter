import { render, screen, fireEvent, waitFor } from "../utils/test-utils"
import CompaniesPage from "@/app/companies/page"
import { companiesApi } from "@/lib/api/companies"
import { useAuth } from "@/contexts/auth-context"
import { mockAuthenticatedUser } from "../utils/test-utils"

// Mock dependencies
jest.mock("@/lib/api/companies", () => ({
  companiesApi: {
    getCompanies: jest.fn(),
  },
}))

jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(),
}))

jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className }) => (
    <img src={src || "/placeholder.svg"} alt={alt} width={width} height={height} className={className} />
  ),
}))

describe("Companies Page", () => {
  const mockCompaniesResponse = {
    data: {
      status: "success",
      data: {
        results: [
          {
            id: "company-1",
            name: "TechCorp Inc.",
            logo: "/placeholder.svg",
            industry: "Technology",
            location: "San Francisco, CA",
            employees: "1000-5000",
            openPositions: 15,
            rating: 4.5,
            website: "https://techcorp.example.com",
          },
          {
            id: "company-2",
            name: "Finance Solutions",
            logo: "/placeholder.svg",
            industry: "Finance",
            location: "New York, NY",
            employees: "500-1000",
            openPositions: 8,
            rating: 4.2,
            website: "https://finance.example.com",
          },
        ],
        count: 2,
      },
    },
  }

  beforeEach(() => {
    jest
      .clearAllMocks()(
        // Default mock implementations
        useAuth as jest.Mock,
      )
      .mockReturnValue({
        user: mockAuthenticatedUser,
        isAuthenticated: true,
      })(companiesApi.getCompanies as jest.Mock)
      .mockResolvedValue(mockCompaniesResponse)
  })

  test("renders the companies page with search form", async () => {
    render(<CompaniesPage />)

    // Check if header is rendered
    expect(screen.getByText("Explore Top Companies")).toBeInTheDocument()

    // Check if search form is rendered
    expect(screen.getByPlaceholderText("Search companies")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Location")).toBeInTheDocument()
    expect(screen.getByText("Search")).toBeInTheDocument()
  })

  test("renders company cards when data is loaded", async () => {
    render(<CompaniesPage />)

    // Wait for company cards to be rendered
    await waitFor(() => {
      expect(screen.getByText("TechCorp Inc.")).toBeInTheDocument()
      expect(screen.getByText("Technology")).toBeInTheDocument()
      expect(screen.getByText("San Francisco, CA")).toBeInTheDocument()
      expect(screen.getByText("1000-5000 employees")).toBeInTheDocument()
      expect(screen.getByText("15 open positions")).toBeInTheDocument()

      expect(screen.getByText("Finance Solutions")).toBeInTheDocument()
      expect(screen.getByText("Finance")).toBeInTheDocument()
      expect(screen.getByText("New York, NY")).toBeInTheDocument()
      expect(screen.getByText("500-1000 employees")).toBeInTheDocument()
      expect(screen.getByText("8 open positions")).toBeInTheDocument()
    })

    // Check if action buttons are rendered
    expect(screen.getAllByText("View Profile").length).toBe(2)
  })

  test("filters companies when search form is submitted", async () => {
    render(<CompaniesPage />)

    // Fill in search form
    fireEvent.change(screen.getByPlaceholderText("Search companies"), {
      target: { value: "tech" },
    })

    // Submit search form
    fireEvent.click(screen.getByText("Search"))

    // Check if API was called with correct filters
    await waitFor(() => {
      expect(companiesApi.getCompanies).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "tech",
        }),
      )
    })
  })

  test("shows active filters and allows clearing them", async () => {
    render(<CompaniesPage />)

    // Fill in search form
    fireEvent.change(screen.getByPlaceholderText("Search companies"), {
      target: { value: "tech" },
    })

    // Submit search form
    fireEvent.click(screen.getByText("Search"))

    // Check if active filter is displayed
    await waitFor(() => {
      expect(screen.getByText("Search: tech")).toBeInTheDocument()
    })

    // Clear filter
    fireEvent.click(screen.getByText("Clear All"))

    // Check if filter was cleared
    await waitFor(() => {
      expect(screen.queryByText("Search: tech")).not.toBeInTheDocument()
    })
  })

  test("shows login prompt for unauthenticated users", async () => {
    // Mock unauthenticated user
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
    })

    render(<CompaniesPage />)

    // Check if login prompt is displayed
    await waitFor(() => {
      expect(screen.getByText("Want to see more companies?")).toBeInTheDocument()
      expect(
        screen.getByText("Sign in or create an account to access all available companies and job opportunities."),
      ).toBeInTheDocument()
      expect(screen.getByText("Sign In")).toBeInTheDocument()
      expect(screen.getByText("Create Account")).toBeInTheDocument()
    })
  })

  test("shows pagination for authenticated users with multiple pages", async () => {
    // Mock response with multiple pages
    ;(companiesApi.getCompanies as jest.Mock).mockResolvedValue({
      data: {
        status: "success",
        data: {
          ...mockCompaniesResponse.data.data,
          count: 20,
        },
      },
    })

    render(<CompaniesPage />)

    // Check if pagination is displayed
    await waitFor(() => {
      expect(screen.getByText("Page 1 of 2")).toBeInTheDocument()
      expect(screen.getByText("Previous")).toBeInTheDocument()
      expect(screen.getByText("Next")).toBeInTheDocument()
    })

    // Previous button should be disabled on first page
    expect(screen.getByText("Previous")).toBeDisabled()

    // Click next button
    fireEvent.click(screen.getByText("Next"))

    // Check if page was changed
    await waitFor(() => {
      expect(companiesApi.getCompanies).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
        }),
      )
    })
  })

  test("handles empty results", async () => {
    // Mock empty response
    ;(companiesApi.getCompanies as jest.Mock).mockResolvedValue({
      data: {
        status: "success",
        data: {
          results: [],
          count: 0,
        },
      },
    })

    render(<CompaniesPage />)

    // Check if empty state is displayed
    await waitFor(() => {
      expect(screen.getByText("No companies found")).toBeInTheDocument()
      expect(screen.getByText("Try adjusting your search filters or try a different search term.")).toBeInTheDocument()
    })
  })

  test("handles loading state", async () => {
    // Delay API response
    ;(companiesApi.getCompanies as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockCompaniesResponse), 100)),
    )

    render(<CompaniesPage />)

    // Check if loading state is displayed
    expect(screen.queryByText("TechCorp Inc.")).not.toBeInTheDocument()

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("TechCorp Inc.")).toBeInTheDocument()
    })
  })
})
