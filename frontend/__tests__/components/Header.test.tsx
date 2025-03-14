import { render, screen, fireEvent, waitFor } from "../utils/test-utils"
import Header from "@/components/Header"
import { useAuth } from "@/contexts/auth-context"
import { mockAuthenticatedUser } from "../utils/test-utils"

// Mock the auth context
jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(),
}))

describe("Header Component", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
  })

  test("renders logo and navigation links", () => {
    // Mock unauthenticated user
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: jest.fn(),
      hasRole: jest.fn(),
    })

    render(<Header />)

    // Check if logo and nav links are rendered
    expect(screen.getByText("SH")).toBeInTheDocument()
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Jobs")).toBeInTheDocument()
    expect(screen.getByText("Companies")).toBeInTheDocument()
    expect(screen.getByText("Resources")).toBeInTheDocument()
  })

  test("renders login button for unauthenticated users", () => {
    // Mock unauthenticated user
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: jest.fn(),
      hasRole: jest.fn(),
    })

    render(<Header />)

    // Check if login button is rendered
    expect(screen.getByText("Login")).toBeInTheDocument()

    // User dropdown should not be rendered
    expect(screen.queryByText("My Account")).not.toBeInTheDocument()
  })

  test("renders user dropdown for authenticated users", async () => {
    // Mock authenticated user
    const mockLogout = jest
      .fn()(useAuth as jest.Mock)
      .mockReturnValue({
        user: mockAuthenticatedUser,
        isAuthenticated: true,
        logout: mockLogout,
        hasRole: jest.fn().mockImplementation((roles) => {
          if (Array.isArray(roles)) {
            return roles.includes("student")
          }
          return roles === "student"
        }),
      })

    render(<Header />)

    // User avatar should be rendered
    const avatarButton = screen.getByRole("button", { name: /Test User/i })
    expect(avatarButton).toBeInTheDocument()

    // Click on avatar to open dropdown
    fireEvent.click(avatarButton)

    // Check dropdown content
    await waitFor(() => {
      expect(screen.getByText("My Account")).toBeInTheDocument()
      expect(screen.getByText("Saved Jobs")).toBeInTheDocument()
      expect(screen.getByText("My Applications")).toBeInTheDocument()
      expect(screen.getByText("Settings")).toBeInTheDocument()
      expect(screen.getByText("Log out")).toBeInTheDocument()
    })

    // Click logout
    fireEvent.click(screen.getByText("Log out"))

    // Check if logout function was called
    expect(mockLogout).toHaveBeenCalled()
  })

  test("renders mobile menu when menu button is clicked", () => {
    // Mock unauthenticated user
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: jest.fn(),
      hasRole: jest.fn(),
    })

    render(<Header />)

    // Initially, mobile menu should be hidden
    expect(screen.queryByText("StudentHunter")).not.toBeInTheDocument()

    // Click menu button
    fireEvent.click(screen.getByLabelText("Open menu"))

    // Mobile menu should be visible
    expect(screen.getByText("StudentHunter")).toBeInTheDocument()

    // Close menu
    fireEvent.click(screen.getByLabelText("Close menu"))

    // Mobile menu should be hidden again
    expect(screen.queryByText("StudentHunter")).not.toBeInTheDocument()
  })

  test("renders student-specific links for student users", async () => {
    // Mock student user
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { ...mockAuthenticatedUser, role: "student" },
      isAuthenticated: true,
      logout: jest.fn(),
      hasRole: jest.fn().mockImplementation((roles) => {
        if (Array.isArray(roles)) {
          return roles.includes("student")
        }
        return roles === "student"
      }),
    })

    render(<Header />)

    // Quest button should be visible
    expect(screen.getByText("Quest")).toBeInTheDocument()

    // Dashboard button should be visible
    expect(screen.getByText("Dashboard")).toBeInTheDocument()

    // Click on avatar to open dropdown
    const avatarButton = screen.getByRole("button", { name: /Test User/i })
    fireEvent.click(avatarButton)

    // Student-specific links should be in dropdown
    await waitFor(() => {
      expect(screen.getByText("Saved Jobs")).toBeInTheDocument()
      expect(screen.getByText("My Applications")).toBeInTheDocument()
    })
  })

  test("changes header style on scroll", async () => {
    // Mock unauthenticated user
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: jest.fn(),
      hasRole: jest.fn(),
    })

    render(<Header />)

    // Initially, header should not have scrolled class
    const header = screen.getByRole("banner")
    expect(header).not.toHaveClass("bg-white/90")

    // Simulate scroll
    fireEvent.scroll(window, { target: { scrollY: 20 } })

    // Header should now have scrolled class
    await waitFor(() => {
      expect(header).toHaveClass("bg-white/90")
    })
  })
})
