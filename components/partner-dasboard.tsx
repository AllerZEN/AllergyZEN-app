"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  AlertOctagon, CheckCircle2, Clock, User, 
  ChefHat, ShieldAlert, UtensilsCrossed 
} from "lucide-react"
import { cn } from "@/lib/utils"
import userProfile from "@/lib/profile"

export function PartnerDashboard() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    const syncData = () => {
      // In a live app, this would fetch from the DB via the QR ID
      // For the prototype, we mirror the local active handshake
      const active = userProfile.isProtectionActive()
      const remaining = userProfile.getRemainingProtectionTime()
      
      if (active && remaining > 0) {
        setSessionData(userProfile.getActiveProfile())
        setTimeLeft(remaining)
      } else {
        setSessionData(null) // AUTOMATIC WIPE
      }
    }

    syncData()
    const interval = setInterval(syncData, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!sessionData) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
        <ShieldAlert className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 uppercase">No Active Ticket</h2>
        <p className="text-slate-500 mt-2">Data is automatically wiped after 3 hours for user privacy. Please ask the customer to rescan.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 space-y-6">
      {/* KITCHEN HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center border-4 border-slate-800">
            <ChefHat className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Trusted Kitchen Ticket</p>
            <h1 className="text-2xl font-black tracking-tighter">TABLE: {sessionData.name || "Guest"}</h1>
          </div>
        </div>
        
        <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Privacy Wipe In:</p>
          <p className="text-2xl font-mono font-bold text-orange-400">
            {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* CRITICAL ALLERGIES (🔴 RED SPECTRUM) */}
        <Card className="border-l-8 border-l-red-600 rounded-[2rem] shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 uppercase font-black tracking-tighter">
              <AlertOctagon className="w-6 h-6" />
              Strict Avoidance (Red)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {sessionData.allergies?.map((item: any) => (
              <Badge key={item} className="bg-red-600 text-white text-sm py-2 px-4 rounded-xl">
                {item}
              </Badge>
            )) || <p className="text-slate-400 italic">No red-level triggers reported.</p>}
          </CardContent>
        </Card>

        {/* BLUE DOT BOUNDARIES (💙 SENSORY/ED) */}
        <Card className="border-l-8 border-l-blue-500 rounded-[2rem] shadow-lg bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600 uppercase font-black tracking-tighter">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              Blue Dot Boundaries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {sessionData.boundaries?.softTextures && (
                <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-blue-100 text-blue-700 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" /> SOFT TEXTURES ONLY
                </div>
              )}
              {sessionData.boundaries?.deconstructed && (
                <div className="p-3 bg-white rounded-xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-400 uppercase">Special Prep:</p>
                  <p className="text-sm font-bold text-blue-700 uppercase">DECONSTRUCT MEAL</p>
                  <p className="text-xs text-slate-500 italic mt-1">{sessionData.boundaries.deconstructedNotes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-8">
        Powered by allergyZEN Wellness Assistant • Liability protection active
      </p>
    </div>
  )
}
