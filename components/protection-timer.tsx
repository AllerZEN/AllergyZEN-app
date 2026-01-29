"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, ShieldCheck, ShieldX, Timer, Building2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import userProfile from "@/lib/profile"

// Handshake Timer Options: 30min, 1hr, 3hr, 24hr
const TIMER_OPTIONS = [
  { label: "30min", value: 30 * 60 * 1000, short: "30m" },
  { label: "1 hour", value: 60 * 60 * 1000, short: "1h" },
  { label: "3 hours", value: 3 * 60 * 60 * 1000, short: "3h" },
  { label: "24 hours", value: 24 * 60 * 60 * 1000, short: "24h" }
]

export function ProtectionTimer() {
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [status, setStatus] = useState<"PROTECTED" | "EXPIRED" | "CONFIRMED" | "UNKNOWN">("UNKNOWN")
  const [businessName, setBusinessName] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [showTimerOptions, setShowTimerOptions] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(3 * 60 * 60 * 1000) // Default 3hr

  useEffect(() => {
    const updateTimer = () => {
      const remaining = userProfile.getProtectionTimeRemaining()
      setTimeRemaining(remaining)
      setStatus(userProfile.checkStatus() as "PROTECTED" | "EXPIRED" | "CONFIRMED" | "UNKNOWN")
      
      // Safe access to protectionWindow properties with fallbacks
      const protectionWindow = userProfile.session?.protectionWindow
      setBusinessName(protectionWindow?.businessName || null)
      setConfirmed(protectionWindow?.confirmedByBusiness || false)
      
      // Cleanup expired sessions
      userProfile.cleanupExpiredData()
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const getProgressPercent = (): number => {
    return Math.min(100, ((selectedDuration - timeRemaining) / selectedDuration) * 100)
  }

  const startNewTimer = (duration: number) => {
    setSelectedDuration(duration)
    // Start protection window with selected duration
    if (userProfile.session) {
      userProfile.session.protectionWindow = {
        startTime: Date.now(),
        duration: duration,
        businessName: businessName || "Manual Timer",
        confirmedByBusiness: false
      }
      userProfile.saveToStorage()
    }
    setShowTimerOptions(false)
    setTimeRemaining(duration)
    setStatus("PROTECTED")
  }

  // Only show timer if there's an active protection window
  const hasActiveSession = userProfile.session?.protectionWindow?.startTime
  
  // Show timer selection if no active session
  if (status === "UNKNOWN" || !hasActiveSession) {
    return (
      <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
        <CardContent className="p-4">
          <div className="text-center">
            <Clock className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <h3 className="font-semibold text-sm text-gray-700 mb-3">Start Handshake Timer</h3>
            <p className="text-xs text-gray-500 mb-4">How long will you be at this venue?</p>
            <div className="grid grid-cols-4 gap-2">
              {TIMER_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  size="sm"
                  onClick={() => startNewTimer(option.value)}
                  className="flex flex-col items-center p-2 h-auto border-2 hover:border-purple-500 hover:bg-purple-50 bg-transparent"
                >
                  <span className="text-lg font-bold text-gray-800">{option.short}</span>
                  <span className="text-[10px] text-gray-500">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isActive = status === "PROTECTED" || status === "CONFIRMED"
  const isExpired = status === "EXPIRED"

  return (
    <Card className={cn(
      "border-2 transition-all",
      confirmed ? "border-success bg-success/5" : 
      isActive ? "border-primary bg-primary/5" : 
      "border-destructive bg-destructive/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {confirmed ? (
              <ShieldCheck className="w-6 h-6 text-success" />
            ) : isActive ? (
              <Shield className="w-6 h-6 text-primary animate-pulse" />
            ) : (
              <ShieldX className="w-6 h-6 text-destructive" />
            )}
            <div>
              <h3 className="font-semibold text-sm">Protection Window</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {businessName || "Local Partner"}
              </p>
            </div>
          </div>
          <Badge 
            variant={confirmed ? "default" : isExpired ? "destructive" : "secondary"}
            className={cn(
              confirmed && "bg-success text-success-foreground",
              !confirmed && isActive && "animate-pulse"
            )}
          >
            {confirmed ? "CONFIRMED" : isExpired ? "EXPIRED" : "PROTECTED"}
          </Badge>
        </div>

        {isActive && (
          <>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Timer className="w-5 h-5 text-muted-foreground" />
              <span className="text-3xl font-mono font-bold tracking-wider">
                {formatTime(timeRemaining)}
              </span>
            </div>

            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-1000 rounded-full",
                  confirmed ? "bg-success" : "bg-primary"
                )}
                style={{ width: `${100 - getProgressPercent()}%` }}
              />
            </div>

            <p className="text-xs text-center text-muted-foreground mt-2">
              {confirmed 
                ? "Business has acknowledged your sensitivities" 
                : "Waiting for business confirmation..."}
            </p>
          </>
        )}

        {isExpired && (
          <p className="text-sm text-center text-destructive">
            Your protection window has expired. Please scan again for continued protection.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
