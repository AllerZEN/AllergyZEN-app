import type React from "react"
import type { Metadata, Viewport } from "next"
import { Quicksand, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { WellnessProvider } from "@/lib/wellness-store"
import "./globals.css"

const _geist = Quicksand({ subsets: ["latin"] }) // Updated import
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "allergyZEN Wellness Assistant",
  description: "Your personal wellness companion for navigating life with allergies and sensitivities",
  generator: "v0.app",
  applicationName: "allergyZEN Wellness Assistant",
  keywords: ["allergy", "wellness", "food safety", "sensitivity", "scanner"],
  authors: [{ name: "allergyZEN" }],
  creator: "allergyZEN",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#E8E4E0" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1625" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/images/allergyzen-logo.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Suppress ResizeObserver loop errors - these are benign browser warnings
                var ignoreError = function(e) {
                  if (e && e.message && e.message.indexOf('ResizeObserver') !== -1) {
                    if (e.stopPropagation) e.stopPropagation();
                    if (e.preventDefault) e.preventDefault();
                    return true;
                  }
                  return false;
                };
                
                window.addEventListener('error', function(e) {
                  if (ignoreError(e)) return;
                }, true);
                
                window.addEventListener('unhandledrejection', function(e) {
                  if (e.reason && e.reason.message && e.reason.message.indexOf('ResizeObserver') !== -1) {
                    e.preventDefault();
                  }
                });
                
                // Patch ResizeObserver to debounce callbacks
                var RO = window.ResizeObserver;
                if (RO) {
                  window.ResizeObserver = function(callback) {
                    var timeout;
                    return new RO(function(entries, observer) {
                      clearTimeout(timeout);
                      timeout = setTimeout(function() {
                        callback(entries, observer);
                      }, 20);
                    });
                  };
                  window.ResizeObserver.prototype = RO.prototype;
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <WellnessProvider>
          {children}
        </WellnessProvider>
        <Analytics />
      </body>
    </html>
  )
}
