// Update the job match API route to work with the Django backend
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { resume, preferences } = await req.json()

    // Forward the request to the Django backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/match/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_SECRET_KEY}`, // Server-side API key
      },
      body: JSON.stringify({ resume, preferences }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate job matches")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Job match error:", error)
    return NextResponse.json({ error: "Failed to generate job matches" }, { status: 500 })
  }
}

