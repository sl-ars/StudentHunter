"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut, Settings, Briefcase, Heart, ChevronRight, LayoutDashboard, Trophy } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationBell } from "@/components/notification-bell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

const navItems = [
  { name: "Home", href: "/" },
  { name: "Jobs", href: "/jobs" },
  { name: "Companies", href: "/companies" },
  { name: "Resources", href: "/resources" },
]

export default function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout, hasRole } = useAuth()

  // This is a placeholder. In a real app, you'd calculate this based on the user's profile completeness
  const profileCompletion = 70

  return (
    <header className="bg-gradient-to-r from-vibrant-blue to-vibrant-purple text-white sticky top-0 z-50 rounded-b-2xl shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            StudentHunter
          </Link>
          <nav className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`hover:text-vibrant-yellow transition-colors duration-200 ${
                  pathname === item.href ? "text-vibrant-yellow font-semibold" : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex space-x-2">
            {user ? (
              <>
                <NotificationBell />
                {user && user.role === "student" && (
                  <Link href="/career-quest">
                    <Button
                      variant="outline"
                      className="text-white border-white hover:bg-white hover:text-vibrant-purple transition-colors duration-200"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      <span>Career Quest</span>
                    </Button>
                  </Link>
                )}
                <Link href={`/${user.role}`}>
                  <Button
                    variant="outline"
                    className="text-white border-white hover:bg-white hover:text-vibrant-purple transition-colors duration-200"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    <span>Dashboard</span>
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 rounded-xl" align="end">
                    <div className="flex items-center space-x-2 p-2 bg-gradient-to-r from-vibrant-blue to-vibrant-purple text-white rounded-t-xl">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-white/70">{user.email}</p>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-sm font-medium">Profile Completion</p>
                      <Progress value={profileCompletion} className="h-2 mt-1" />
                      <p className="text-xs text-muted-foreground mt-1">{profileCompletion}% Complete</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="flex items-center cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>My Account</span>
                        <ChevronRight className="ml-auto h-4 w-4" />
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "student" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/student/saved-jobs" className="flex items-center cursor-pointer">
                            <Heart className="mr-2 h-4 w-4" />
                            <span>Saved Jobs</span>
                            <ChevronRight className="ml-auto h-4 w-4" />
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/student/applications" className="flex items-center cursor-pointer">
                            <Briefcase className="mr-2 h-4 w-4" />
                            <span>My Applications</span>
                            <ChevronRight className="ml-auto h-4 w-4" />
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/account/settings" className="flex items-center cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        <ChevronRight className="ml-auto h-4 w-4" />
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="secondary"
                    className="bg-white text-vibrant-purple hover:bg-vibrant-yellow hover:text-black transition-colors duration-200"
                  >
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
          <button
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40">
          <div className="bg-gradient-to-r from-vibrant-blue to-vibrant-purple p-4 h-full w-64 rounded-r-2xl">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`hover:text-vibrant-yellow transition-colors duration-200 ${
                    pathname === item.href ? "text-vibrant-yellow font-semibold" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {user && (
                <>
                  <Link href="/career-quest" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full text-white border-white hover:bg-white hover:text-vibrant-purple transition-colors duration-200"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Career Quest
                    </Button>
                  </Link>
                  <Link href={`/${user.role}`} onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full text-white border-white hover:bg-white hover:text-vibrant-purple transition-colors duration-200"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/account" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="secondary"
                      className="w-full bg-white text-vibrant-purple hover:bg-vibrant-yellow hover:text-black transition-colors duration-200"
                    >
                      My Account
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full text-white border-white hover:bg-white hover:text-vibrant-purple transition-colors duration-200"
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                  >
                    Logout
                  </Button>
                </>
              )}
              {!user && (
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="secondary"
                    className="w-full bg-white text-vibrant-purple hover:bg-vibrant-yellow hover:text-black transition-colors duration-200"
                  >
                    Login
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

