"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  clickable?: boolean
  onClick?: () => void
  className?: string
  centered?: boolean
}

export function BrandLogo({ size = "md", showText = true, clickable = false, onClick, className, centered = false }: BrandLogoProps) {
  const [isPulsing, setIsPulsing] = useState(false)

  const sizeConfig = {
    sm: { container: "h-8", logo: 32, text: "text-sm", tagline: "text-[8px]" },
    md: { container: "h-10", logo: 40, text: "text-lg", tagline: "text-[10px]" },
    lg: { container: "h-14", logo: 56, text: "text-xl", tagline: "text-xs" },
    xl: { container: "h-20", logo: 80, text: "text-2xl", tagline: "text-sm" },
  }

  const config = sizeConfig[size]

  const handleClick = () => {
    if (clickable) {
      setIsPulsing(true)
      setTimeout(() => setIsPulsing(false), 300)
      onClick?.()
    }
  }

  if (centered) {
    // Centered layout - logo on top, text below
    return (
      <div
        className={cn("flex flex-col items-center", clickable && "cursor-pointer", isPulsing && "logo-pulse", className)}
        onClick={handleClick}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
      >
        {/* Lotus Icon - Centered */}
        <div className="relative">
          <LotusIcon size={config.logo} />
        </div>

        {showText && (
          <div className="flex flex-col items-center mt-1">
            {/* Brand name centered */}
            <div className="flex items-center gap-1">
              <span className={cn("font-bold leading-tight", config.text)}>
                <span className="text-gray-800">allergy</span>
                <span className="font-light text-gray-800">ZEN</span>
              </span>
            </div>
            {/* Tagline with blue heart */}
            <div className="flex items-center gap-1">
              <span className={cn("text-gray-500 leading-tight", config.tagline)}>wellness</span>
              <span className="text-blue-500">&#128153;</span>
            </div>
            {/* Traffic light dots */}
            <div className="flex gap-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span className="w-2 h-2 rounded-full bg-[#F97316]" />
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            </div>
          </div>
        )}
      </div>
    )
  }

  // Default horizontal layout
  return (
    <div
      className={cn("flex items-center gap-2", clickable && "cursor-pointer", isPulsing && "logo-pulse", className)}
      onClick={handleClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {/* Lotus Icon */}
      <div className="relative flex-shrink-0">
        <LotusIcon size={config.logo} />
      </div>

      {showText && (
        <div className="flex flex-col">
          {/* Traffic light dots and brand name */}
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5 mr-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
            </div>
            <span className={cn("font-bold leading-tight", config.text)}>
              <span className="text-gray-800">allergy</span>
              <span className="font-light text-gray-800">ZEN</span>
            </span>
          </div>
          <span className={cn("text-gray-500 leading-tight", config.tagline)}>Wellness Assistant App</span>
        </div>
      )}
    </div>
  )
}

function LotusIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Center petal */}
      <path
        d="M50 10 C50 10, 35 35, 35 55 C35 70, 42 80, 50 85 C58 80, 65 70, 65 55 C65 35, 50 10, 50 10Z"
        fill="#8E55A2"
      />
      {/* Left petals */}
      <path d="M30 25 C30 25, 15 45, 20 60 C25 75, 35 80, 45 78 C40 70, 35 55, 30 25Z" fill="#A872B8" opacity="0.9" />
      <path d="M15 40 C15 40, 5 55, 12 70 C18 82, 30 85, 42 80 C35 72, 25 60, 15 40Z" fill="#B88CC4" opacity="0.8" />
      {/* Right petals */}
      <path d="M70 25 C70 25, 85 45, 80 60 C75 75, 65 80, 55 78 C60 70, 65 55, 70 25Z" fill="#A872B8" opacity="0.9" />
      <path d="M85 40 C85 40, 95 55, 88 70 C82 82, 70 85, 58 80 C65 72, 75 60, 85 40Z" fill="#B88CC4" opacity="0.8" />
    </svg>
  )
}

export { LotusIcon }
