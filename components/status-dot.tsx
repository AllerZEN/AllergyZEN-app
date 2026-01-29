"use client"

import { cn } from "@/lib/utils"

// Synchronized with the 5-color ZEN Spectrum
export type SpectrumStatus = "red" | "orange" | "brown" | "green" | "blue" | "unknown"

interface StatusDotProps {
  status: SpectrumStatus
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  pulse?: boolean
  isShield?: boolean // New: Specific glow for active handshakes
  className?: string
}

export function StatusDot({ 
  status, 
  size = "md", 
  pulse = false, 
  isShield = false,
  className 
}: StatusDotProps) {
  
  const sizeClasses = {
    xs: "w-2 h-2",
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6",
    xl: "w-10 h-10",
  }

  // allergyZEN Official Spectrum Colors
  const colorClasses = {
    red: "bg-[#EF4444]", // Danger/Allergy
    orange: "bg-[#F97316]", // Warning/Sensitivity
    brown: "bg-[#78350F]", // Dislike/Preference (Updated to Brown 🟤)
    green: "bg-[#22C55E]", // Safe/Verified
    blue: "bg-[#3B82F6]", // ED/Sensory/Handshake (Blue 💙)
    unknown: "bg-slate-300",
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Handshake Glow Layer */}
      {(pulse || isShield) && (
        <span className={cn(
          "absolute inset-0 rounded-full opacity-75 animate-ping",
          status === "blue" ? "bg-blue-400" : colorClasses[status]
        )} />
      )}
      
      {/* Core Dot */}
      <span
        className={cn(
          "relative inline-block rounded-full flex-shrink-0 shadow-sm transition-colors duration-300",
          sizeClasses[size],
          colorClasses[status],
          className
        )}
        aria-label={`ZEN Spectrum Status: ${status}`}
      />
    </div>
  )
}
