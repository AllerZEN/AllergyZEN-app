"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, ShieldCheck, ShieldX, Timer, Building2, Clock, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import userProfile from "@/lib/profile"

// Handshake Timer Options: Standard allergyZEN presets
const TIMER_OPTIONS = [
  { label: "30m", value: 30 * 60 * 1000 },
  { label: "1h", value: 60 * 60 * 1000 },
  { label: "3h", value: 3 * 60 * 60 * 1000 },
  { label: "24h", value: 24 * 60 * 60 * 1000 }
]

export function ProtectionTimer() {
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [status, setStatus] = useState<"PROTECTED" | "EXPIRED" | "CONFIRMED" | "UNKNOWN">("UNKNOWN")
  const [businessName, setBusinessName] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(3 * 60 * 60 * 1000)

  useEffect(() => {
    const updateTimer = () => {
      const remaining = userProfile.getProtectionTimeRemaining()
      setTimeRemaining(remaining)
      setStatus(userProfile.checkStatus() as any)
      
      const protectionWindow = userProfile.session?.protectionWindow
      setBusinessName(protectionWindow?.businessName || null)
      setConfirmed(protectionWindow?.confirmedByBusiness || false)
      
      // Auto-wipe logic per business plan: data is removed from local state on expiry
      userProfile.cleanupExpiredData()
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000))
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const startNewTimer = (duration: number) => {
    setSelectedDuration(duration)
    if (userProfile.session) {
      userProfile.session.protectionWindow = {
        startTime: Date.now(),
        duration: duration,
        businessName: businessName || "Manual Handshake",
        confirmedByBusiness: false
      }
      userProfile.saveToStorage()
    }
    setTimeRemaining(duration)
    setStatus("PROTECTED")
  }

  const hasActiveSession = userProfile.session?.protectionWindow?.startTime
  const isExpired = status === "EXPIRED"
  const isActive = (status === "PROTECTED" || status === "CONFIRMED") && !isExpired

  // 1. SELECTOR VIEW (No active session)
  if (status === "UNKNOWN" || !hasActiveSession) {
    return (
      <Card className="border-2 border-blue-100 bg-white shadow-sm rounded-3xl overflow-hidden">
        <CardContent className="p-5">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-black text-slate-800 uppercase tracking-tighter">Handshake Timer</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Duration of stay</p>
            
            <div className="grid grid-cols-4 gap-2">
              {TIMER_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  onClick={() => startNewTimer(option.value)}
                  className="h-14 border-2 rounded-2xl font-black text-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 2. ACTIVE OR EXPIRED VIEW
  return (
    <Card className={cn(
      "border-2 transition-all rounded-3xl shadow-lg",
      confirmed ? "border-green-500 bg-green-50/30" : 
      isActive ? "border-blue-600 bg-blue-50/30" : 
      "border-red-500 bg-red-50"
    )}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-full",
              confirmed ? "bg-green-500" : isActive ? "bg-blue-600" : "bg-red-500"
            )}>
              {confirmed ? <ShieldCheck className="w-5 h-5 text-white" /> : 
               isActive ? <Shield className="w-5 h-5 text-white animate-pulse" /> : 
               <ShieldX className="w-5 h-5 text-white" />}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {isExpired ? "Protection Void" : "Session Active"}
              </p>
              <h3 className="font-bold text-slate-800 leading-tight">
                {businessName || "Trusted Venue"}
              </h3>
            </div>
          </div>
          <Badge className={cn(
            "rounded-full px-3 py-1 text-[10px] font-black border-none",
            confirmed ? "bg-green-500" : isExpired ? "bg-red-500" : "bg-blue-600"
          )}>
            {status}
          </Badge>
        </div>

        {isActive ? (
          <div className="text-center py-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-slate-400" />
              <span className="text-4xl font-black tracking-tighter text-slate-900">
                {formatTime(timeRemaining)}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              {confirmed ? "Business has your ticket" : "Handshake in progress..."}
            </p>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm font-bold text-red-600 mb-3">Your QR protection has expired.</p>
            <Button 
              onClick={() => setStatus("UNKNOWN")}
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-tighter"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Rescan for Safety
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
