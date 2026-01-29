"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, ShieldCheck, ShieldX, Timer, Building2, Clock, LogOut, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import userProfile from "@/lib/profile"

/**
 * 2026 HANDSHAKE PROTOCOL:
 * Options: 30min, 1hr, 3hr, 24hr
 * Primary function: Data wipe after expiry for absolute privacy.
 */
const TIMER_OPTIONS = [
  { label: "30min", minutes: 30, short: "30m" },
  { label: "1 hour", minutes: 60, short: "1h" },
  { label: "3 hours", minutes: 180, short: "3h" },
  { label: "24 hours", minutes: 1440, short: "24h" }
]

export function ProtectionTimer() {
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [status, setStatus] = useState<string>("INACTIVE")
  const [businessName, setBusinessName] = useState<string | null>(null)
  const [totalDuration, setTotalDuration] = useState(180 * 60 * 1000)

  useEffect(() => {
    const updateTimer = () => {
      const remaining = userProfile.getProtectionTimeRemaining()
      const currentStatus = userProfile.isProtectionActive() ? "PROTECTED" : "EXPIRED"
      const session = userProfile.session?.protectionWindow

      setTimeRemaining(remaining)
      setStatus(session?.active ? currentStatus : "INACTIVE")
      setBusinessName(session?.businessName || null)
      setTotalDuration(session?.durationMs || 180 * 60 * 1000)
      
      // Auto-wipe logic from engine
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
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const handleManualHandshake = (minutes: number) => {
    userProfile.activateHandshake("Guest Session", minutes)
  }

  const handleUnshake = () => {
    if (confirm("Disconnect Handshake? This will wipe your details from the business dashboard immediately.")) {
      userProfile.clearProtectionWindow()
    }
  }

  // View 1: Selector (When inactive)
  if (status === "INACTIVE" || status === "EXPIRED") {
    return (
      <Card className="border-2 border-blue-100 bg-blue-50/20 shadow-none rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-black text-lg text-slate-900 mb-1 uppercase tracking-tight">Init Handshake</h3>
            <p className="text-xs font-medium text-slate-500 mb-6">Choose how long your shield stays active at this location.</p>
            
            <div className="grid grid-cols-2 gap-3">
              {TIMER_OPTIONS.map((option) => (
                <Button
                  key={option.minutes}
                  variant="outline"
                  className="flex flex-col items-center py-6 h-auto border-2 rounded-2xl hover:border-blue-600 hover:bg-white transition-all group"
                  onClick={() => handleManualHandshake(option.minutes)}
                >
                  <span className="text-xl font-black text-slate-900 group-hover:text-blue-600">{option.short}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Duration</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // View 2: Active Pulsing Shield
  return (
    <Card className="border-2 border-blue-500 bg-white shadow-xl shadow-blue-100 rounded-3xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
              <div className="relative p-3 bg-blue-600 rounded-2xl text-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm uppercase tracking-tight">Active Shield</h3>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none text-[9px] font-black">LIVE</Badge>
              </div>
              <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                <Building2 className="w-3 h-3" /> {businessName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl py-6 border border-slate-100">
          <span className="text-5xl font-black tabular-nums tracking-tighter text-slate-900">
            {formatTime(timeRemaining)}
          </span>
          <div className="flex items-center gap-2 mt-2">
            <Timer className="w-3 h-3 text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time Until Auto-Wipe</span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full mt-6 overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-1000 ease-linear"
            style={{ width: `${(timeRemaining / totalDuration) * 100}%` }}
          />
        </div>

        <button 
          onClick={handleUnshake}
          className="w-full mt-6 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-3 h-3" />
          Terminate Handshake & Wipe
        </button>
      </CardContent>
    </Card>
  )
}
