"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Start fade out after 1 second
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 1000)

    // Complete after 1.5 seconds total
    const completeTimer = setTimeout(() => {
      onComplete()
    }, 1500)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="animate-fade-in flex flex-col items-center text-center px-8">
        {/* Logo */}
        <div className="relative w-72 h-40 mb-4">
          <Image
            src="/images/allergyzen-logo.png"
            alt="allergyZEN Wellness Assistant"
            fill
            className="object-contain"
            priority
          />
        </div>
        
        {/* Tagline centered below logo */}
        <p className="text-sm text-[#8E55A2] font-medium mb-2">allergyZEN wellness</p>

        {/* Validation Quote */}
        <p className="text-lg text-gray-600 font-light italic max-w-xs mt-4">
          "You owe no one an explanation. You are safe here."
        </p>

        {/* Loading indicator */}
        <div className="flex items-center gap-2 mt-8">
          <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  )
}
