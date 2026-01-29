"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, ShieldCheck, ShieldX, Timer, Building2, Clock, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import userProfile, { HANDSHAKE_DURATIONS } from "@/lib/profile"

// Handshake Timer Options derived from lib/profile logic
const TIMER_OPTIONS = [
  { label: "30min", minutes: 30, short: "30m" },
  { label: "1 hour", minutes: 60, short: "1h" },
  { label: "3 hours", minutes: 180, short: "3h" },
  { label: "24 hours", minutes: 1440, short: "24h" }
]

export function ProtectionTimer() {
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [status, setStatus] = useState<string>("UNKNOWN")
  const [businessName, setBusinessName] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [totalDuration, setTotalDuration] = useState(HANDSHAKE_DURATIONS.THREE_HOURS)

  useEffect(() => {
    const updateTimer = () => {
      const remaining = userProfile.getProtectionTimeRemaining()
      const currentStatus = userProfile.checkStatus()
      const session = userProfile.session?.protectionWindow

      setTimeRemaining(remaining)
      setStatus(currentStatus)
      setBusinessName(session?.businessName || null)
      setConfirmed(session?.confirmedByBusiness || false)
      setTotalDuration(session?.durationMs || HANDSHAKE_DURATIONS.THREE_HOURS)
      
      // Auto-wipe if expired
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

  const handleManualHandshake = (minutes: number) => {
    userProfile.startProtectionWindow("MANUAL_ENTRY", "Guest Session", minutes)
  }

  const handleUnshake = () => {
    if (confirm("Disconnect Handshake? This will wipe your details from the business dashboard for your privacy.")) {
      userProfile.clearProtectionWindow()
    }
  }

  // State: No active protection - Show Duration Options
  if (!userProfile.isProtectionActive() && status !== "EXPIRED") {
    return (
      <Card className="border-2 border-dashed border-slate-300 bg-slate-50/50 shadow-none">
        <CardContent className="p-6">
          <div className="text-center">
            <Clock className="w-10 h-10 mx-auto text-slate-400 mb-3" />
            <h3 className="font-bold text-base text-slate-800 mb-1">Activate Handshake</h3>
            <p className="text-xs text-slate-500 mb-5">Select duration to enable your shield at this venue.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TIMER_OPTIONS.map((option) => (
                <Button
                  key={option.minutes}
                  variant="outline"
                  className="flex flex-col items-center py-4 h-auto border-2 hover:border-[var(--profile-theme)] hover:bg-white transition-all"
                  onClick={() => handleManualHandshake(option.minutes)}
                >
                  <span className="text-lg font-black text-slate-900">{option.short}</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">{option.label}</span>
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
      "border-2 transition-all shadow-md",
      confirmed ? "border-green-500 bg-green-50/30" : 
      isActive ? "border-[var(--profile-theme)] bg-white" : 
      "border-red-500 bg-red-50/30"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-full",
              isActive ? "bg-[var(--profile-theme)] text-white animate-pulse" : "bg-red-100 text-red-600"
            )}>
              {confirmed ? <ShieldCheck className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Handshake Active</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-tighter flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {businessName || "Private Shield"}
              </p>
            </div>
          </div>
          <Badge variant={isExpired ? "destructive" : "outline"} className={cn(
            !isExpired && "border-[var(--profile-theme)] text-[var(--profile-theme)]"
          )}>
            {status}
          </Badge>
        </div>

        {isActive ? (
          <>
            <div className="flex flex-col items-center justify-center py-2">
              <span className="text-4xl font-black font-mono tracking-tighter text-slate-800">
                {formatTime(timeRemaining)}
              </span>
              <div className="flex items-center gap-1 mt-1 text-slate-400">
                <Timer className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase">Time Remaining</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
              <div 
                className="h-full bg-[var(--profile-theme)] transition-all duration-1000"
                style={{ width: `${(timeRemaining / totalDuration) * 100}%` }}
              />
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleUnshake}
              className="w-full mt-4 text-xs text-slate-400 hover:text-red-500 gap-2"
            >
              <LogOut className="w-3 h-3" />
              Disconnect Handshake (Wipe Data)
            </Button>
          </>
        ) : (
          <div className="text-center py-2">
            <ShieldX className="w-8 h-8 mx-auto text-red-500 mb-2" />
            <p className="text-sm font-bold text-red-600">Shield Expired</p>
            <Button 
              variant="link" 
              onClick={() => userProfile.clearProtectionWindow()}
              className="text-xs text-slate-500"
            >
              Reset Shield
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
