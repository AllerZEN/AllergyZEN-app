"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  AlertOctagon, CheckCircle2, ChefHat, 
  ShieldAlert, Info, Ghost, EyeOff
} from "lucide-react"
import { cn } from "@/lib/utils"
import { StatusDot } from "./status-dot"
import userProfile from "@/lib/profile"

/**
 * allergyZEN Partner Dashboard (Kitchen View)
 * This view mirrors the user's active handshake.
 * DATA WIPE: All details are purged after the handshake timer expires.
 */
export function PartnerDashboard() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    const syncData = () => {
      const active = userProfile.isProtectionActive()
      const remainingMs = userProfile.getProtectionTimeRemaining()
      
      if (active && remainingMs > 0) {
        setSessionData(userProfile.getActiveProfile())
        setTimeLeft(Math.floor(remainingMs / 1000))
      } else {
        setSessionData(null) // 2026 BULLETPROOF WIPE
      }
    }

    syncData()
    const interval = setInterval(syncData, 1000)
    return () => clearInterval(interval)
  }, [])

  // EXPIRED / NO DATA STATE
  if (!sessionData) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-8 bg-slate-100 text-center">
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
          <EyeOff className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Handshake Expired</h2>
        <p className="text-slate-500 mt-2 max-w-sm">
          For user privacy and liability protection, all reactivity data has been wiped. 
          Please request a <strong>New Scan</strong> from the customer.
        </p>
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 space-y-8 pb-20">
      {/* KITCHEN COMMAND HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg transform rotate-3">
            <ChefHat className="w-10 h-10 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Zen Verified Ticket</p>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Table Guest: {sessionData.name || "Anonymous"}</h1>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/10 text-center relative z-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Privacy Wipe In:</p>
          <p className="text-3xl font-black tabular-nums text-orange-400">
            {formatTime(timeLeft)}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* 🔴 HIGH REACTIVITY (STRICT AVOIDANCE) */}
        <Card className="border-none rounded-[2.5rem] shadow-xl bg-white overflow-hidden">
          <div className="bg-red-600 p-5 flex items-center gap-3 text-white">
            <AlertOctagon className="w-6 h-6" />
            <h2 className="font-black uppercase tracking-tighter">High Reactivity</h2>
          </div>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              {sessionData.allergies?.length > 0 ? (
                sessionData.allergies.map((item: string) => (
                  <Badge key={item} className="bg-red-50 text-red-700 border-2 border-red-100 text-sm font-black py-3 px-5 rounded-2xl uppercase tracking-tighter">
                    {item}
                  </Badge>
                ))
              ) : (
                <p className="text-slate-400 italic text-sm">No high-reactivity triggers reported.</p>
              )}
            </div>
            <div className="mt-6 p-4 bg-red-50/50 rounded-2xl border border-red-100 flex items-start gap-3">
               <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
               <p className="text-[10px] font-bold text-red-900 uppercase leading-relaxed">
                 STRICT AVOIDANCE REQUIRED. High potential for severe physical reaction.
               </p>
            </div>
          </CardContent>
        </Card>

        {/* 💙 BLUE DOT BOUNDARIES (SENSORY / ED SUPPORT) */}
        <Card className="border-none rounded-[2.5rem] shadow-xl bg-white overflow-hidden">
          <div className="bg-blue-600 p-5 flex items-center gap-3 text-white">
            <StatusDot status="blue" size="sm" pulse className="bg-white" />
            <h2 className="font-black uppercase tracking-tighter">Blue Boundaries</h2>
          </div>
          <CardContent className="p-6 space-y-4">
            {sessionData.boundaries && Object.entries(sessionData.boundaries).some(([k, v]) => v === true) ? (
              <div className="space-y-3">
                {sessionData.boundaries.softTextures && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 font-black text-xs rounded-2xl border border-blue-100 uppercase">
                    <CheckCircle2 className="w-4 h-4" /> Soft Textures Only
                  </div>
                )}
                {sessionData.boundaries.deconstructed && (
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Service Style:</p>
                    <p className="text-sm font-black text-blue-700 uppercase">Deconstruct Meal</p>
                    <p className="text-xs text-slate-500 italic mt-2 font-medium">
                      "{sessionData.boundaries.deconstructedNotes || "Serve all components in separate bowls."}"
                    </p>
                  </div>
                )}
                {sessionData.boundaries.noMixedTextures && (
                   <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 font-black text-xs rounded-2xl border border-blue-100 uppercase">
                    <CheckCircle2 className="w-4 h-4" /> No Mixed Textures
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400 italic text-sm">No specific sensory boundaries reported.</p>
            )}
          </CardContent>
        </Card>

        {/* 🟤 DISLIKES / INTOLERANCES */}
        <Card className="border-none rounded-[2.5rem] shadow-xl bg-white overflow-hidden">
          <div className="bg-[#78350F] p-5 flex items-center gap-3 text-white">
            <Ghost className="w-6 h-6" />
            <h2 className="font-black uppercase tracking-tighter">Dislikes / Intolerance</h2>
          </div>
          <CardContent className="p-6">
             <div className="flex flex-wrap gap-2">
              {sessionData.dislikes?.length > 0 ? (
                sessionData.dislikes.map((item: string) => (
                  <Badge key={item} className="bg-amber-50 text-amber-900 border-2 border-amber-100 text-xs font-black py-2 px-4 rounded-xl uppercase">
                    {item}
                  </Badge>
                ))
              ) : (
                <p className="text-slate-400 italic text-sm">No personal dislikes reported.</p>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-slate-200 rounded-full">
           <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
             allergyZEN Bulletproof Protocol • v2.6.01
           </p>
        </div>
      </div>
    </div>
  )
}
