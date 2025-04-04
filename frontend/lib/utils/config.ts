// Configuration utility functions

/**
 * Check if mock data mode is enabled
 */
export function isMockEnabled(): boolean {
  // Check the environment variable to determine if mock data should be used
  return process.env.NEXT_PUBLIC_MOCK_ENABLED === "true"
}

/**
 * Get API base URL
 */
export function getApiBaseUrl(): string {
  // Use NEXT_PUBLIC_API_URL for consistency with .env.example
  return process.env.NEXT_PUBLIC_API_URL || "https://api.studenthunter.example.com"
}

/**
 * Get application environment
 */
export function getEnvironment(): "development" | "production" | "test" {
  return (process.env.NODE_ENV as "development" | "production" | "test") || "development"
}
