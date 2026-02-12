import type React from "react"
import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "allergyZEN Wellness Assistant App",
  description: "Bulletproof wellness companion for navigating life with allergies, sensitivities, and dietary boundaries",
  applicationName: "allergyZEN",
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  )
}


import './globals.css'