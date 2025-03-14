"use client"
import { render, screen, fireEvent, waitFor } from "../utils/test-utils"
import { ResumeCard } from "@/components/resume-card"
import { mockResume } from "../utils/test-utils"

describe("ResumeCard Component", () => {
  const mockOnSelect = jest.fn()
  const mockOnDelete = jest.fn()
  const mockOnSetDefault = jest.fn()
  const mockOnRename = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("renders resume card with correct information", () => {
    render(
      <ResumeCard
        resume={mockResume}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
        onSetDefault={mockOnSetDefault}
        onRename={mockOnRename}
      />,
    )

    // Check if resume information is displayed
    expect(screen.getByText(mockResume.name)).toBeInTheDocument()
    expect(
      screen.getByText(
        `Uploaded: ${new Date(mockResume.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}`,
      ),
    ).toBeInTheDocument()

    // Check if default badge is displayed
    expect(screen.getByText("Default Resume")).toBeInTheDocument()

    // Check if action buttons are displayed
    expect(screen.getByText("View")).toBeInTheDocument()
    expect(screen.getByText("Preview")).toBeInTheDocument()
  })

  test("calls onSelect when View button is clicked", () => {
    render(
      <ResumeCard
        resume={mockResume}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
        onSetDefault={mockOnSetDefault}
        onRename={mockOnRename}
      />,
    )

    // Click View button
    fireEvent.click(screen.getByText("View"))

    // Check if onSelect was called
    expect(mockOnSelect).toHaveBeenCalled()
  })

  test("opens dropdown menu when more button is clicked", async () => {
    render(
      <ResumeCard
        resume={mockResume}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
        onSetDefault={mockOnSetDefault}
        onRename={mockOnRename}
      />,
    )

    // Click more button
    fireEvent.click(screen.getByRole("button", { name: "" }))

    // Check if dropdown menu is displayed
    await waitFor(() => {
      expect(screen.getByText("View Details")).toBeInTheDocument()
      expect(screen.getByText("Rename")).toBeInTheDocument()
      expect(screen.getByText("Download")).toBeInTheDocument()
      expect(screen.getByText("Delete")).toBeInTheDocument()
    })
  })

  test("enters rename mode when Rename is clicked", async () => {
    render(
      <ResumeCard
        resume={mockResume}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
        onSetDefault={mockOnSetDefault}
        onRename={mockOnRename}
      />,
    )

    // Click more button
    fireEvent.click(screen.getByRole("button", { name: "" }))

    // Click Rename
    fireEvent.click(screen.getByText("Rename"))

    // Check if rename input is displayed
    await waitFor(() => {
      expect(screen.getByDisplayValue(mockResume.name)).toBeInTheDocument()
    })

    // Enter new name
    fireEvent.change(screen.getByDisplayValue(mockResume.name), {
      target: { value: "New Resume Name" },
    })

    // Confirm rename
    fireEvent.click(screen.getByRole("button", { name: "" }))

    // Check if onRename was called with new name
    expect(mockOnRename).toHaveBeenCalledWith("New Resume Name")
  })

  test("calls onDelete when Delete is clicked and confirmed", async () => {
    // Mock window.confirm
    const originalConfirm = window.confirm
    window.confirm = jest.fn(() => true)

    render(
      <ResumeCard
        resume={mockResume}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
        onSetDefault={mockOnSetDefault}
        onRename={mockOnRename}
      />,
    )

    // Click more button
    fireEvent.click(screen.getByRole("button", { name: "" }))

    // Click Delete
    fireEvent.click(screen.getByText("Delete"))

    // Check if onDelete was called
    expect(mockOnDelete).toHaveBeenCalled()

    // Restore original confirm
    window.confirm = originalConfirm
  })

  test("does not show Set as Default option for default resume", async () => {
    render(
      <ResumeCard
        resume={mockResume}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
        onSetDefault={mockOnSetDefault}
        onRename={mockOnRename}
      />,
    )

    // Click more button
    fireEvent.click(screen.getByRole("button", { name: "" }))

    // Set as Default should not be displayed
    await waitFor(() => {
      expect(screen.queryByText("Set as Default")).not.toBeInTheDocument()
    })
  })

  test("shows Set as Default option for non-default resume", async () => {
    const nonDefaultResume = { ...mockResume, isDefault: false }

    render(
      <ResumeCard
        resume={nonDefaultResume}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
        onSetDefault={mockOnSetDefault}
        onRename={mockOnRename}
      />,
    )

    // Click more button
    fireEvent.click(screen.getByRole("button", { name: "" }))

    // Set as Default should be displayed
    await waitFor(() => {
      expect(screen.getByText("Set as Default")).toBeInTheDocument()
    })

    // Click Set as Default
    fireEvent.click(screen.getByText("Set as Default"))

    // Check if onSetDefault was called
    expect(mockOnSetDefault).toHaveBeenCalled()
  })

  test("handles application count display", () => {
    const resumeWithApplications = {
      ...mockResume,
      applicationCount: 5,
    }

    render(
      <ResumeCard
        resume={resumeWithApplications}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
        onSetDefault={mockOnSetDefault}
        onRename={mockOnRename}
      />,
    )

    // Check if application count is displayed
    expect(screen.getByText("Used in 5 applications")).toBeInTheDocument()
  })

  test("handles resume with updated date", () => {
    const updatedResume = {
      ...mockResume,
      updatedAt: "2023-02-01T00:00:00.000Z",
    }

    render(
      <ResumeCard
        resume={updatedResume}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
        onSetDefault={mockOnSetDefault}
        onRename={mockOnRename}
      />,
    )

    // Check if updated date is displayed
    expect(
      screen.getByText(
        `Updated: ${new Date(updatedResume.updatedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}`,
      ),
    ).toBeInTheDocument()
  })
})
