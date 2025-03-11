import type { Resource } from "../types"

export const mockResources: Record<string, Resource> = {
  "1": {
    id: "1",
    title: "Complete Guide to Modern Web Development",
    type: "Course",
    description: "A comprehensive guide covering all aspects of modern web development...",
    content: "# Introduction to Modern Web Development\n\nThis comprehensive guide will take you through...",
    author: "Sarah Johnson",
    publishedAt: "2024-02-01",
    estimatedTime: "10 hours",
    category: "Web Development",
    tags: ["JavaScript", "React", "Node.js", "Web Development", "Frontend", "Backend"],
  },
  // Add more mock resources here...
}

