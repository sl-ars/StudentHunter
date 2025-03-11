"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Lock } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(formData.email, formData.password)
      if (success) {
        router.push("/")
        toast({
          title: "Login successful",
          description: "Welcome back!",
        })
      } else {
        setError("Invalid email or password")
      }
    } catch (error) {
      setError("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-vibrant-blue via-vibrant-purple to-vibrant-pink py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-vibrant-yellow to-vibrant-orange w-full"></div>
        <CardHeader className="pb-6">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          {error && <p className="text-destructive text-center mt-2">{error}</p>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-vibrant-blue">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  className="pl-10 border-vibrant-blue/20 focus:border-vibrant-blue"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password" className="text-vibrant-purple">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  className="pl-10 border-vibrant-purple/20 focus:border-vibrant-purple"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/forgot-password" className="text-sm text-vibrant-blue hover:underline">
            Forgot password?
          </Link>
          <span className="text-sm text-muted-foreground">Don't have an account? Contact your administrator</span>
        </CardFooter>
      </Card>
    </div>
  )
}

