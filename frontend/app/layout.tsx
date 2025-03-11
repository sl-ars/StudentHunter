import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"
import { NotificationProvider } from "@/contexts/notification-context"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "StudentHunter",
  description: "Connect students with dream opportunities",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <AuthProvider>
          <NotificationProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'