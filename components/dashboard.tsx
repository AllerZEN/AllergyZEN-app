"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { 
  User, ChevronRight, Shield, 
  Clock, Scan, Heart, Sparkles, Activity
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { useWellnessStore } from "@/lib/wellness-store"
import { getFullSensitivityCount, getDetailedTriggerList } from "@/lib/user-profile"
import { TrialBanner } from "./trial-banner"
import { DeepListModal } from "./deep-list-modal"
import { SensitivityDetailModal } from "./sensitivity-detail-modal"
import { AllergenQuickSearch } from "./allergen-quick-search"
import { StatusDot } from "./status-dot"
import userProfile from "@/lib/profile"

const ZEN_GREETINGS = [
  "Safety and serenity, hand in hand.",
  "Your wellness journey continues beautifully.",
  "Every mindful choice brings peace.",
  "You're doing amazing - one scan at a time.",
  "Trust your instincts, they're serving you well.",
]

export function Dashboard({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [userName, setUserName] = useState("Friend")
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [showDeepList, setShowDeepList] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [protectionStatus, setProtectionStatus] = useState(userProfile.checkStatus())

  useEffect(() => {
    const sync = () => {
      setProtectionStatus(userProfile.checkStatus())
      const activeProfile = userProfile.getActiveProfile()
      if (activeProfile?.name) setUserName(activeProfile.name)
      setUserPhoto(userProfile.getProfilePhoto())
    }
    
    sync()
    const timer = setInterval(sync, 1000)
    return () => clearInterval(timer)
  }, [])

  const greeting = useMemo(() => ZEN_GREETINGS[Math.floor(Math.random() * ZEN_GREETINGS.length)], [])
  const isProtected = protectionStatus === "PROTECTED" || protectionStatus === "CONFIRMED"
  const totalTriggerCount = getFullSensitivityCount()

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-700">
      <TrialBanner />
      
      {/* Brand Header */}
      <div className="px-2 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Hey, {userName}</h2>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> {greeting}
          </p>
        </div>
        <div 
          onClick={() => onNavigate?.("profile")}
          className="w-12 h-12 rounded-2xl border-2 border-white shadow-xl overflow-hidden bg-slate-100 cursor-pointer active:scale-90 transition-transform"
        >
           {userPhoto ? (
            <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="w-full h-full p-2 text-slate-400" />
          )}
        </div>
      </div>

      {/* PRIMARY ACTION: THE SCANNER */}
      <div className="px-1">
        <Button
          onClick={() => onNavigate?.("scan")}
          className="relative w-full py-12 rounded-[2.5rem] bg-slate-900 hover:bg-black text-white flex flex-col items-center gap-3 shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all active:scale-[0.98] group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Scan className="w-12 h-12 text-blue-400 mb-1" />
          <div className="text-center relative z-10">
            <span className="block text-2xl font-black uppercase tracking-tighter">Verify Product</span>
            <span className="text-[10px] font-black opacity-50 uppercase tracking-[0.3em]">Zen Engine Active</span>
          </div>
        </Button>
      </div>

      {/* HORIZONTAL STATUS HUB */}
      <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar px-2 -mx-2">
        {/* SHIELD STATUS */}
        <Card 
          onClick={() => onNavigate?.("view")}
          className={cn(
            "flex-shrink-0 w-40 rounded-[2rem] border-2 transition-all cursor-pointer shadow-sm",
            isProtected ? "border-blue-500 bg-blue-50/50" : "border-slate-100 bg-white"
          )}
        >
          <CardContent className="p-5 flex flex-col items-center text-center">
            <StatusDot status="blue" size="md" isShield={isProtected} className="mb-3" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Shield</p>
            <p className={cn("text-xs font-black", isProtected ? "text-blue-600" : "text-slate-900")}>
              {isProtected ? "ACTIVE" : "OFFLINE"}
            </p>
          </CardContent>
        </Card>

        {/* BOUNDARIES STATUS (The Blue Dot System) */}
        <Card 
          onClick={() => onNavigate?.("profile")}
          className="flex-shrink-0 w-40 rounded-[2rem] border-2 border-slate-100 bg-white cursor-pointer shadow-sm hover:border-blue-200 transition-all"
        >
          <CardContent className="p-5 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
              <Heart className="w-5 h-5 text-blue-600 fill-blue-600" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Boundaries</p>
            <p className="text-xs font-black text-slate-900 uppercase">Blue Dot</p>
          </CardContent>
        </Card>

        {/* HANDSHAKE TIMER */}
        <Card 
          onClick={() => onNavigate?.("profile")}
          className="flex-shrink-0 w-40 rounded-[2rem] border-2 border-slate-100 bg-white cursor-pointer shadow-sm"
        >
          <CardContent className="p-5 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Handshake</p>
            <p className="text-xs font-black text-slate-900 uppercase">
              {userProfile.isProtectionActive() ? "Timing" : "Standby"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* QUICK SEARCH & MASTER LIST */}
      <Card className="rounded-[2.5rem] border-none bg-white shadow-xl shadow-slate-200/50">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-lg leading-tight">{totalTriggerCount} Active Monitors</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Across 5 Zen Tiers</p>
            </div>
          </div>

          <AllergenQuickSearch 
            onSelectItem={(item) => setSelectedCategory(item)} 
            placeholder="Quick search allergens..." 
          />
          
          <Button 
            variant="ghost" 
            className="w-full mt-6 py-6 rounded-2xl text-[10px] font-black text-slate-400 hover:text-blue-600 hover:bg-blue-50 tracking-[0.2em]"
            onClick={() => setShowDeepList(true)}
          >
            VIEW MASTER SPECTRUM <ChevronRight className="w-4 h-4 ml-2" />
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
