"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, Clock, Shield, QrCode, CheckCircle2, 
  AlertTriangle, Timer, Handshake, MapPin, ArrowLeft
} from "lucide-react"
import { cn } from "@/lib/utils"
import userProfile from "@/lib/profile"
import { ProtectionTimer } from "./protection-timer"

// Timer options: 30min, 1hr, 3hr, 24hr
const TIMER_OPTIONS = [
  { label: "30 min", value: 30 * 60 * 1000, short: "30m" },
  { label: "1 hour", value: 60 * 60 * 1000, short: "1h" },
  { label: "3 hours", value: 3 * 60 * 60 * 1000, short: "3h" },
  { label: "24 hours", value: 24 * 60 * 60 * 1000, short: "24h" }
]

interface RecentBusiness {
  name: string
  lastVisit: string
  confirmed: boolean
}

// FIX: Added 'default' and 'onBack' prop
export default function BusinessTab({ onBack }: { onBack: () => void }) {
  const [businessName, setBusinessName] = useState("")
  const [recentBusinesses, setRecentBusinesses] = useState<RecentBusiness[]>([])
  const [mounted, setMounted] = useState(false)
  const [activeTimer, setActiveTimer] = useState<number | null>(null)
  const [status, setStatus] = useState<"INACTIVE" | "PROTECTED" | "CONFIRMED" | "EXPIRED">("INACTIVE")

  useEffect(() => {
    setMounted(true)
    loadRecentBusinesses()
    checkStatus()
  }, [])

  const loadRecentBusinesses = () => {
    try {
      const stored = localStorage.getItem("allergyzen_recent_businesses")
      if (stored) {
        setRecentBusinesses(JSON.parse(stored))
      }
    } catch {
      // Ignore
    }
  }

  const saveRecentBusiness = (name: string, confirmed: boolean) => {
    const newBusiness: RecentBusiness = {
      name,
      lastVisit: new Date().toISOString(),
      confirmed
    }
    const updated = [newBusiness, ...recentBusinesses.filter(b => b.name !== name)].slice(0, 5)
    setRecentBusinesses(updated)
    localStorage.setItem("allergyzen_recent_businesses", JSON.stringify(updated))
  }

  const checkStatus = () => {
    const s = userProfile.checkStatus()
    setStatus(s as "INACTIVE" | "PROTECTED" | "CONFIRMED" | "EXPIRED")
  }

  const startProtection = (duration: number, business: string) => {
    if (userProfile.session) {
      userProfile.session.protectionWindow = {
        startTime: Date.now(),
        duration: duration,
        businessName: business || "Manual Timer",
        confirmedByBusiness: false
      }
      userProfile.saveToStorage()
    }
    saveRecentBusiness(business || "Manual Timer", false)
    setActiveTimer(duration)
    setStatus("PROTECTED")
    setBusinessName("")
  }

  const confirmHandshake = () => {
    if (userProfile.session?.protectionWindow) {
      userProfile.session.protectionWindow.confirmedByBusiness = true
      userProfile.saveToStorage()
    }
    setStatus("CONFIRMED")
    if (userProfile.session?.protectionWindow?.businessName) {
      saveRecentBusiness(userProfile.session.protectionWindow.businessName, true)
    }
  }

  if (!mounted) {
    return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />
  }

  return (
    <div className="min-h-screen bg-white p-4 pb-20 space-y-4">
       {/* Navigation */}
       <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest mb-4 active:scale-95 transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Handshake className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-black text-gray-800 italic uppercase">Handshake</h1>
        </div>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">3-Hour Verification System</p>
      </div>

      {/* Active Protection Timer component */}
      <ProtectionTimer />

      {/* Start New Handshake */}
      {status === "INACTIVE" || status === "EXPIRED" ? (
        <Card className="border-2 border-blue-100 rounded-[32px] overflow-hidden shadow-sm">
          <CardHeader className="pb-2 bg-blue-50/50">
            <CardTitle className="text-lg font-black flex items-center gap-2 uppercase italic">
              <Building2 className="w-5 h-5 text-blue-600" />
              New Session
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold text-blue-400">Scan or manually enter venue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Input
                placeholder="Restaurant or venue name..."
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white"
              />
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Select Duration</p>
              <div className="grid grid-cols-4 gap-2">
                {TIMER_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    onClick={() => startProtection(option.value, businessName)}
                    className="flex flex-col items-center py-6 h-auto border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 active:scale-95 transition-all"
                  >
                    <span className="text-lg font-black text-slate-900">{option.short}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-14 border-2 border-dashed border-gray-200 rounded-2xl font-black uppercase text-xs tracking-widest"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Scan QR Code
            </Button>
          </CardContent>
        </Card>
      ) : (
        status === "PROTECTED" && (
          <Card className="border-2 border-blue-200 bg-blue-50 rounded-[24px]">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <AlertTriangle className="w-8 h-8 text-blue-600 animate-pulse" />
                <div>
                    <p className="font-black text-blue-900 uppercase">Handshake Pending</p>
                    <p className="text-xs text-blue-700 font-bold">Show this screen to staff for verification</p>
                </div>
                <Button 
                  onClick={confirmHandshake}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-black uppercase tracking-widest"
                >
                  Confirm Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      )}

      {/* Recent Businesses */}
      {recentBusinesses.length > 0 && (
        <Card className="rounded-[24px] border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentBusinesses.map((business, idx) => (
              <button
                key={idx}
                onClick={() => setBusinessName(business.name)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all text-left border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="font-black text-sm text-slate-900">{business.name}</span>
                </div>
                {business.confirmed && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Updated Status Legend to Brown */}
      <Card className="bg-slate-900 text-white border-0 rounded-[24px]">
        <CardContent className="p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 text-center">Zen Spectrum Legend</p>
          <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase tracking-tighter">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Safe 🟢</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Blocked 🔴</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <span>Boundary 🔵</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#78350f]" />
              <span>Dislike 🟤</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
