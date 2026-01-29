"use client"

console.log("[v0] Page module loading...")

import { useState, useEffect, useCallback } from "react"
import { AppShell } from "@/components/app-shell"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import { SplashScreen } from "@/components/splash-screen"
import { LotusIcon } from "@/components/brand-logo"

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    try {
      const stored = localStorage.getItem("allergyzen_user_profile")
      if (!stored) {
        setShowOnboarding(true)
      } else {
        const profile = JSON.parse(stored)
        if (!profile?.onboardingComplete) {
          setShowOnboarding(true)
        }
      }
    } catch {
      setShowOnboarding(true)
    }
  }, [])

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false)
  }, [])

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse">
            <LotusIcon size={48} />
          </div>
          <p className="text-sm text-muted-foreground">Loading allergyZEN...</p>
        </div>
      </div>
    )
  }

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  if (showOnboarding) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />
  }

  return <AppShell />
}
