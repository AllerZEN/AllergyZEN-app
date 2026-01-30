"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  Users, Plus, Trash2, Search, Timer,
  AlertTriangle, AlertCircle, Heart, ShieldCheck, X, ChevronRight
} from "lucide-react"
// Linked to your master profile logic [cite: 2026-01-23]
import { getUserProfile, getDetailedTriggerList, getItemsByDot, session, saveToStorage } from "@/lib/user-profile"
import { cn } from "@/lib/utils"

type TriggerCategory = "red" | "amber" | "brown" | "blue"

export function EditProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<TriggerCategory>("red")
  const [handshakeDuration, setHandshakeDuration] = useState("3h")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setProfile(getUserProfile())
    const savedDuration = localStorage.getItem("zen_handshake_duration") || "3h"
    setHandshakeDuration(savedDuration)
  }, [])

  // 1,750 Item Search Engine Logic [cite: 2026-01-16]
  const searchResults = useMemo(() => {
    if (search.length < 2) return []
    const allItems = getDetailedTriggerList()
    
    return allItems
      .filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 10) // Performance optimization for mobile
  }, [search])

  const handleHandshakeChange = (val: string) => {
    setHandshakeDuration(val)
    localStorage.setItem("zen_handshake_duration", val)
    
    // Handshake conversion: 30m, 1h, 3h, 24h [cite: 2026-01-25]
    const mins = val === "30m" ? 30 : val === "1h" ? 60 : val === "3h" ? 180 : 1440
    session.protectionWindow.durationMs = mins * 60 * 1000
    saveToStorage()
  }

  const addTrigger = (name: string, cat: TriggerCategory) => {
    // Logic to update the master profile list
    const currentProfile = getUserProfile()
    if (currentProfile) {
      currentProfile.customAllergies.push(name)
      localStorage.setItem("allergyzen_user_profile", JSON.stringify(currentProfile))
      setProfile({ ...currentProfile })
    }
    setSearch("")
  }

  const removeTrigger = (name: string, cat: TriggerCategory) => {
    const currentProfile = getUserProfile()
    if (currentProfile) {
      currentProfile.customAllergies = currentProfile.customAllergies.filter(item => item !== name)
      localStorage.setItem("allergyzen_user_profile", JSON.stringify(currentProfile))
      setProfile({ ...currentProfile })
    }
  }

  const getStyle = (cat: TriggerCategory) => {
    switch (cat) {
      case "red": return { color: "text-red-600", bg: "bg-red-500", label: "Block", icon: AlertTriangle }
      case "amber": return { color: "text-orange-600", bg: "bg-orange-500", label: "Caution", icon: AlertCircle }
      case "brown": return { color: "text-[#78350f]", bg: "bg-[#78350f]", label: "Reactivity", icon: ShieldCheck }
      case "blue": return { color: "text-blue-600", bg: "bg-blue-500", label: "Sensory", icon: Heart }
    }
  }

  if (!mounted) return <div className="h-screen bg-slate-50 animate-pulse" />

  return (
    <div className="max-w-md mx-auto space-y-6 pb-24 px-4 pt-4">
      {/* HANDSHAKE SHIELD - [cite: 2026-01-20] */}
      <Card className="rounded-[2rem] border-none shadow-xl shadow-blue-100/40 bg-white">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <Badge className="bg-blue-600 font-black uppercase tracking-widest text-[10px]">Active Shield</Badge>
            <Timer className="w-5 h-5 text-blue-600" />
          </div>
          <CardTitle className="font-black text-2xl uppercase tracking-tighter pt-2">Handshake Protocol</CardTitle>
          <CardDescription className="font-bold text-slate-400">Privacy First: Data wipes after your stay.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={handshakeDuration} onValueChange={handleHandshakeChange} className="grid grid-cols-4 gap-2">
            {["30m", "1h", "3h", "24h"].map(d => (
              <div key={d}>
                <RadioGroupItem value={d} id={d} className="peer sr-only" />
                <Label htmlFor={d} className="flex h-12 items-center justify-center rounded-2xl border-2 border-slate-50 bg-slate-50 font-black text-xs peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-white peer-data-[state=checked]:shadow-md transition-all cursor-pointer">
                  {d.toUpperCase()}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* SPECTRUM ENGINE - Full Zen Spectrum [cite: 2026-01-29] */}
      <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
        <div className="p-8 bg-slate-50 border-b border-slate-100">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">{profile?.name || 'User'}'s Spectrum</h2>
          <div className="grid grid-cols-4 gap-2">
            {(["red", "amber", "brown", "blue"] as TriggerCategory[]).map(cat => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-3xl transition-all border-2",
                  selectedCategory === cat ? "bg-white border-slate-900 shadow-lg scale-105" : "border-transparent opacity-30"
                )}
              >
                {React.createElement(getStyle(cat).icon, { className: cn("w-6 h-6", getStyle(cat).color) })}
                <span className="text-[9px] font-black uppercase">{getStyle(cat).label}</span>
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-8 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
            <Input 
              placeholder={`Search 1,750+ items for ${selectedCategory}...`} 
              className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-100/50 font-bold focus:bg-white transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            
            {/* SEARCH DROPDOWN - Zen Spectrum Search [cite: 2026-01-25] */}
            {searchResults.length > 0 && (
              <div className="absolute top-16 left-0 right-0 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {searchResults.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => addTrigger(item.name, selectedCategory)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full", item.severity === 'high' ? 'bg-red-500' : 'bg-orange-500')} />
                      <span className="font-bold text-slate-700">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-slate-300 uppercase">Add to {selectedCategory}</span>
                       <Plus className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                ))}
                {/* SAFE Tab Redirect Button */}
                <button className="w-full p-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  See Safe Alternatives <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* ACTIVE TRIGGERS - Live Shield View [cite: 2026-01-20] */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Shield Triggers</Label>
            <div className="flex flex-wrap gap-2">
              {getItemsByDot(selectedCategory).map((item, idx) => (
                <Badge key={idx} className={cn("rounded-xl px-4 py-3 border-none font-black text-[11px] uppercase text-white flex gap-2", getStyle(selectedCategory).bg)}>
                  {item.name}
                  <button onClick={() => removeTrigger(item.name, selectedCategory)}><X className="w-3 h-3" strokeWidth={4} /></button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
