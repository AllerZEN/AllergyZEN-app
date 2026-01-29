"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, Clock, Shield, QrCode, CheckCircle2, 
  AlertTriangle, Timer, Handshake, MapPin
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

export function BusinessTab() {
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
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Handshake className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-800">Business Handshake</h1>
        </div>
        <p className="text-gray-500 text-sm">Protection timer for restaurants and venues</p>
      </div>

      {/* Active Protection Timer */}
      <ProtectionTimer />

      {/* Start New Handshake */}
      {status === "INACTIVE" || status === "EXPIRED" ? (
        <Card className="border-2 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              Start New Handshake
            </CardTitle>
            <CardDescription>Enter venue name and select duration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Business Name Input */}
            <div className="space-y-2">
              <Input
                placeholder="Restaurant or venue name..."
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="border-2 border-gray-200 focus:border-purple-500"
              />
            </div>

            {/* Timer Duration Options */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">How long will you be here?</p>
              <div className="grid grid-cols-4 gap-2">
                {TIMER_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    onClick={() => startProtection(option.value, businessName)}
                    className="flex flex-col items-center p-3 h-auto border-2 hover:border-purple-500 hover:bg-purple-50 bg-transparent"
                  >
                    <span className="text-xl font-bold text-gray-800">{option.short}</span>
                    <span className="text-[10px] text-gray-500">{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* QR Scan Option */}
            <Button 
              variant="outline" 
              className="w-full border-2 border-dashed border-gray-300 bg-transparent"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Scan Business QR Code
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Confirm Handshake Button (when timer active) */
        status === "PROTECTED" && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Awaiting staff confirmation</span>
                </div>
                <Button 
                  onClick={confirmHandshake}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      )}

      {/* Recent Businesses */}
      {recentBusinesses.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              Recent Venues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentBusinesses.map((business, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setBusinessName(business.name)
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-sm">{business.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {business.confirmed && (
                    <Badge variant="outline" className="text-xs border-green-300 text-green-600">
                      Verified
                    </Badge>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(business.lastVisit).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Status Legend */}
      <Card className="bg-gray-50 border-0">
        <CardContent className="p-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Status Guide</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <span>Inactive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Expired</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
