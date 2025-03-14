"use client"
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { authApi } from "@/lib/api/auth"
import { testUsers } from "@/lib/mock-data/test-users"

// Mock dependencies
jest.mock("@/lib/api/auth", () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    getMe: jest.fn(),
  },
}))

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    pathname: "/",
  })),
  usePathname: jest.fn(() => "/"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))

// Test component that uses auth context
const TestComponent = () => {
  const { user, isAuthenticated, login, logout, register, hasRole } = useAuth()

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? "Authenticated" : "Not Authenticated"}</div>
      {user && (
        <div>
          <div data-testid="user-name">{user.name}</div>
          <div data-testid="user-email">{user.email}</div>
          <div data-testid="user-role">{user.role}</div>
        </div>
      )}
      <button onClick={() => login("test@example.com", "password")}>Login</button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => register({ name: "New User", email: "new@example.com", password: "password" })}>
        Register
      </button>
      <div data-testid="has-student-role">{hasRole("student") ? "Yes" : "No"}</div>
      <div data-testid="has-admin-role">{hasRole("admin") ? "Yes" : "No"}</div>
    </div>
  )
}

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Clear localStorage
    localStorage
      .clear()(
        // Default mock implementations
        authApi.login as jest.Mock,
      )
      .mockResolvedValue({
        access: "mock-token",
        refresh: "mock-refresh-token",
        user: {
          id: "user-1",
          name: "Test User",
          email: "test@example.com",
          role: "student",
        },
      })(authApi.register as jest.Mock)
      .mockResolvedValue({
        success: true,
      })(authApi.getMe as jest.Mock)
      .mockResolvedValue({
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        role: "student",
      })
  })

  test("provides authentication state and functions", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    // Initially not authenticated
    expect(screen.getByTestId("auth-status")).toHaveTextContent("Not Authenticated")

    // Login
    fireEvent.click(screen.getByText("Login"))

    // Check if authenticated after login
    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("Authenticated")
      expect(screen.getByTestId("user-name")).toHaveTextContent("Test User")
      expect(screen.getByTestId("user-email")).toHaveTextContent("test@example.com")
      expect(screen.getByTestId("user-role")).toHaveTextContent("student")
    })

    // Check role
    expect(screen.getByTestId("has-student-role")).toHaveTextContent("Yes")
    expect(screen.getByTestId("has-admin-role")).toHaveTextContent("No")

    // Logout
    fireEvent.click(screen.getByText("Logout"))

    // Check if not authenticated after logout
    expect(screen.getByTestId("auth-status")).toHaveTextContent("Not Authenticated")
  })

  test("handles registration", async () => {
    // Mock successful registration and login
    ;(authApi.register as jest.Mock).mockResolvedValue({ success: true })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    // Register
    fireEvent.click(screen.getByText("Register"))

    // Check if login is called after successful registration
    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith({
        name: "New User",
        email: "new@example.com",
        password: "password",
      })
      expect(authApi.login).toHaveBeenCalled()
    })
  })

  test("handles login failure", async () => {
    // Mock login failure
    ;(authApi.login as jest.Mock).mockRejectedValue(new Error("Invalid credentials"))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    // Try to login
    fireEvent.click(screen.getByText("Login"))

    // Should still be unauthenticated
    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("Not Authenticated")
    })
  })

  test("checks for existing token on mount", async () => {
    // Set token in localStorage
    localStorage.setItem("access_token", "existing-token")

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      )
    })

    // Should call getMe to verify token
    expect(authApi.getMe).toHaveBeenCalled()

    // Should be authenticated if getMe returns user data
    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("Authenticated")
    })
  })

  test("handles mock mode correctly", async () => {
    // Enable mock mode
    process.env.NEXT_PUBLIC_MOCK_ENABLED = "true"

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    // Login with mock credentials
    fireEvent.click(screen.getByText("Login"))

    // Should use mock data instead of API
    await waitFor(() => {
      expect(authApi.login).not.toHaveBeenCalled()
      expect(screen.getByTestId("auth-status")).toHaveTextContent("Authenticated")
    })

    // Clean up
    process.env.NEXT_PUBLIC_MOCK_ENABLED = "false"
  })

  test("provides test users in mock mode", () => {
    // Enable mock mode
    process.env.NEXT_PUBLIC_MOCK_ENABLED = "true"

    const TestUsersComponent = () => {
      const { getDemoAccounts } = useAuth()
      const demoAccounts = getDemoAccounts()

      return (
        <div>
          <div data-testid="demo-accounts-count">{demoAccounts.length}</div>
          {demoAccounts.map((account) => (
            <div key={account.id} data-testid={`demo-account-${account.id}`}>
              {account.email}
            </div>
          ))}
        </div>
      )
    }

    render(
      <AuthProvider>
        <TestUsersComponent />
      </AuthProvider>,
    )

    // Should provide test users
    expect(screen.getByTestId("demo-accounts-count")).toHaveTextContent(testUsers.length.toString())

    // Clean up
    process.env.NEXT_PUBLIC_MOCK_ENABLED = "false"
  })
})
