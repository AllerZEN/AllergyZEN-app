"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  User, ChevronRight, Shield, AlertTriangle, 
  Clock, CheckCircle2, Zap, Scan, Camera, Heart
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { useWellnessStore } from "@/lib/wellness-store"
import {
  ALLERGY_CATEGORIES,
  getFullSensitivityCount,
  getDetailedTriggerList,
  type UserProfile,
} from "@/lib/user-profile"
import { TrialBanner } from "./trial-banner"
import { UpgradeModal } from "./upgrade-modal"
import { DeepListModal } from "./deep-list-modal"
import { SensitivityDetailModal } from "./sensitivity-detail-modal"
import { AllergenQuickSearch } from "./allergen-quick-search"
import userProfile from "@/lib/profile"

const ZEN_GREETINGS = [
  "Safety and serenity, hand in hand.",
  "Your wellness journey continues beautifully.",
  "Every mindful choice brings peace.",
  "You're doing amazing - one scan at a time.",
  "Trust your instincts, they're serving you well.",
]

interface DashboardProps {
  onNavigate?: (tab: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [userName, setUserName] = useState("Friend")
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [showDeepList, setShowDeepList] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [protectionStatus, setProtectionStatus] = useState(userProfile.checkStatus())

  const brandShieldAlert = useWellnessStore((state) => state.brandShieldAlert)
  const lastScanResult = useWellnessStore((state) => state.lastScanResult)

  // Listen for timer/protection updates
  useEffect(() => {
    const timer = setInterval(() => {
      setProtectionStatus(userProfile.checkStatus())
    }, 1000)
    
    const activeProfile = userProfile.getActiveProfile()
    if (activeProfile?.name) setUserName(activeProfile.name)
    setUserPhoto(userProfile.getProfilePhoto())
    
    return () => clearInterval(timer)
  }, [])

  const greeting = useMemo(() => {
    return ZEN_GREETINGS[Math.floor(Math.random() * ZEN_GREETINGS.length)]
  }, [])

  const isProtected = protectionStatus === "PROTECTED" || protectionStatus === "CONFIRMED"
  const totalTriggerCount = getFullSensitivityCount()

  return (
    <div className="space-y-6 pb-20">
      <TrialBanner />
      
      {/* Brand Header */}
      <div className="px-1">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Hey, {userName}</h2>
        <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mt-1">{greeting}</p>
      </div>

      {/* CORE ACTION: The Scan Launchpad */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <Button
          onClick={() => onNavigate?.("scan")}
          className="relative w-full py-10 rounded-[2rem] bg-slate-900 hover:bg-slate-800 text-white flex flex-col items-center gap-2 shadow-2xl transition-transform active:scale-95"
        >
          <Scan className="w-10 h-10 text-purple-400" />
          <span className="text-xl font-black uppercase tracking-tighter">Scan Product</span>
          <span className="text-[10px] font-bold opacity-50 uppercase tracking-[0.2em]">Ready for Brand Shield</span>
        </Button>
      </div>

      {/* HORIZONTAL STATUS HUB (Scrollable) */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
        {/* SHIELD CARD with Pulsing Blue Dot logic */}
        <Card className={cn(
          "flex-shrink-0 w-36 rounded-[2rem] border-2 transition-all shadow-sm",
          isProtected ? "border-blue-500 bg-blue-50" : "border-slate-100 bg-white"
        )}>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="relative">
              {isProtected && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
              )}
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                isProtected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
              )}>
                <Shield className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Shield</p>
            <p className="text-xs font-bold text-slate-900">{isProtected ? "ACTIVE" : "OFFLINE"}</p>
          </CardContent>
        </Card>

        {/* BOUNDARIES CARD (Blue Dot System) */}
        <Card 
          onClick={() => onNavigate?.("profile")}
          className="flex-shrink-0 w-36 rounded-[2rem] border-2 border-slate-100 bg-white shadow-sm cursor-pointer"
        >
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <Heart className="w-6 h-6 text-blue-600 fill-blue-600" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Boundaries</p>
            <p className="text-xs font-bold text-slate-900">BLUE DOT</p>
          </CardContent>
        </Card>

        {/* TIMER CARD */}
        <Card className="flex-shrink-0 w-36 rounded-[2rem] border-2 border-slate-100 bg-white shadow-sm">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Handshake</p>
            <p className="text-xs font-bold text-slate-900">
              {userProfile.isProtectionActive() ? "TIMING" : "STANDBY"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* QUICK SEARCH & PROFILE SUMMARY */}
      <Card className="rounded-[2.5rem] border-none bg-slate-50 shadow-inner">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full border-4 border-white shadow-md overflow-hidden bg-purple-100">
               {userPhoto ? (
                <img src={userPhoto} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-full h-full p-3 text-purple-600" />
              )}
            </div>
            <div>
              <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Active Protection</p>
              <h4 className="font-bold text-slate-900">{totalTriggerCount} Items Monitored</h4>
            </div>
          </div>

          <AllergenQuickSearch 
            onSelectItem={(item) => setSelectedCategory(item)} 
            placeholder="Quick search allergens..." 
          />
          
          <Button 
            variant="ghost" 
            className="w-full mt-4 text-xs font-bold text-slate-500 hover:text-purple-600"
            onClick={() => setShowDeepList(true)}
          >
            VIEW FULL MASTER LIST <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardContent>
      </Card>

      {/* Modals */}
      <DeepListModal 
        isOpen={showDeepList} 
        onClose={() => setShowDeepList(false)} 
        triggers={getDetailedTriggerList()} 
        onSelectItem={(item) => setSelectedCategory(item)} 
      />
      <SensitivityDetailModal 
        isOpen={!!selectedCategory} 
        onClose={() => setSelectedCategory(null)} 
        item={selectedCategory} 
      />
    </div>
  )
}
