"use client"

import { cn } from "@/lib/utils"

interface StatusDotProps {
  status: "safe" | "danger" | "warning" | "caution" | "unknown"
  size?: "sm" | "md" | "lg"
  pulse?: boolean
  className?: string
}

export function StatusDot({ status, size = "md", pulse = false, className }: StatusDotProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  }

  // Using exact colors from the logo
  const colorClasses = {
    safe: "bg-[#22C55E]", // Traffic green from logo
    danger: "bg-[#EF4444]", // Traffic red from logo
    warning: "bg-[#F97316]", // Traffic orange from logo
    caution: "bg-[#F97316]", // Traffic orange from logo
    unknown: "bg-gray-400",
  }

  return (
    <span
      className={cn(
        "inline-block rounded-full flex-shrink-0",
        sizeClasses[size],
        colorClasses[status],
        pulse && "animate-pulse",
        className,
      )}
      aria-label={`Status: ${status}`}
    />
  )
}
