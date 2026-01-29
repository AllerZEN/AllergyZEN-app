"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Search, Users, ShieldCheck, Plus, Camera, ArrowRight } from "lucide-react"
import userProfile from "@/lib/profile"
import { searchAllergens, getAllAllergens, getDatabaseCount, type AllergenEntry, type ZenSpectrumColor } from "@/lib/allergen-database"
import { StatusDot } from "./status-dot"
import { ItemDetailModal } from "./item-detail-modal"
import { cn } from "@/lib/utils"

interface AllergenQuickSearchProps {
  onSelectItem?: (item: { name: string; category: string; severity: "high" | "moderate" | "safe" }) => void
  placeholder?: string
  onNavigateToSafe?: () => void
}

// Status dot colors for the ZEN Spectrum
const statusColors: Record<ZenSpectrumColor, string> = {
  red: "bg-red-500",
  amber: "bg-amber-500",
  brown: "bg-stone-500",
  green: "bg-green-500",
  blue: "bg-blue-500"
}

const statusLabels: Record<ZenSpectrumColor, string> = {
  red: "Danger",
  amber: "Caution",
  brown: "Dislike",
  green: "Safe",
  blue: "Boundary"
}

export function AllergenQuickSearch({ onSelectItem, placeholder, onNavigateToSafe }: AllergenQuickSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeProfile, setActiveProfile] = useState(0)
  const [status, setStatus] = useState<"PROTECTED" | "EXPIRED" | "CONFIRMED" | "INACTIVE" | "UNKNOWN">("INACTIVE")
  const [family, setFamily] = useState<{ name: string; allergies: string[]; createdAt: string }[]>([])
  const [mounted, setMounted] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{ item: AllergenEntry; status: ZenSpectrumColor } | null>(null)
  
  // Get user's lists for personalized search
  const [userLists, setUserLists] = useState<{
    red: string[]
    amber: string[]
    green: string[]
    brown: string[]
  }>({ red: [], amber: [], green: [], brown: [] })

  // Initialize on mount
  useEffect(() => {
    setMounted(true)
    setStatus(userProfile.checkStatus())
    setFamily([...userProfile.profiles])
    loadUserLists()
  }, [])

  const loadUserLists = () => {
    const profile = userProfile.getActiveProfile()
    if (profile?.items) {
      setUserLists({
        red: profile.items.red?.map(i => i.name) || [],
        amber: profile.items.amber?.map(i => i.name) || [],
        green: profile.items.green?.map(i => i.name) || [],
        brown: [] // Will be populated from dislikedItems
      })
    }
    if (profile?.dislikedItems) {
      setUserLists(prev => ({ ...prev, brown: profile.dislikedItems || [] }))
    }
  }

  // Sync state with the Profile logic
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setStatus(userProfile.checkStatus())
    }, 60000)
    return () => clearInterval(interval)
  }, [mounted])

  const handleProfileSwitch = (index: number) => {
    setActiveProfile(index)
    userProfile.session.activeProfileIndex = index
    loadUserLists()
  }

  // Use the expanded database search - now 1750+ items
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return []
    return searchAllergens(
      searchTerm, 
      userLists.red, 
      userLists.amber, 
      userLists.green, 
      userLists.brown
    ).slice(0, 30) // Limit results for performance
  }, [searchTerm, userLists])

  const totalItems = getDatabaseCount()

  const handleItemClick = (result: { item: AllergenEntry; status: ZenSpectrumColor }) => {
    setSelectedItem(result)
    if (onSelectItem) {
      onSelectItem({
        name: result.item.name,
        category: result.item.category,
        severity: result.status === "red" ? "high" : result.status === "amber" ? "moderate" : "safe"
      })
    }
  }

  const handleAddToList = (item: AllergenEntry, color: ZenSpectrumColor) => {
    if (color === "brown") {
      userProfile.addDislike(item.name)
    } else if (color !== "blue") {
      userProfile.addItem(item.name, item.category, color as "red" | "amber" | "green" | "blue")
    }
    loadUserLists()
    setSelectedItem(null)
  }

  if (!mounted) {
    return (
      <div className="p-4 max-w-md mx-auto bg-card rounded-xl shadow-md space-y-4">
        <div className="animate-pulse h-10 bg-muted rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-4 max-w-md mx-auto bg-card rounded-xl shadow-md space-y-4 border border-border">
      {/* 1. Family Shield Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Users className="text-primary" size={20} />
          <select 
            className="font-bold text-lg bg-transparent focus:outline-none text-foreground"
            value={activeProfile}
            onChange={(e) => handleProfileSwitch(Number(e.target.value))}
          >
            {family.map((member, idx) => (
              <option key={idx} value={idx}>{member.name}&apos;s Shield</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <StatusDot 
            status={
              status === "PROTECTED" || status === "CONFIRMED" ? "safe" : 
              status === "EXPIRED" ? "danger" : 
              status === "INACTIVE" ? "unknown" : "unknown"
            } 
            pulse={status === "PROTECTED" || status === "CONFIRMED"} 
          />
          <span className="text-xs font-medium uppercase text-muted-foreground">
            {status === "INACTIVE" ? "READY" : status}
          </span>
        </div>
      </div>

      {/* ZEN Spectrum Legend */}
      <div className="flex items-center justify-center gap-2 py-1">
        {(["red", "amber", "brown", "green", "blue"] as ZenSpectrumColor[]).map((color) => (
          <div key={color} className="flex items-center gap-1">
            <div className={cn("w-2.5 h-2.5 rounded-full", statusColors[color])} />
            <span className="text-[10px] text-muted-foreground">{statusLabels[color]}</span>
          </div>
        ))}
      </div>

      {/* 2. Personal Daily Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder={placeholder || `Search ${totalItems}+ items...`}
          className="w-full pl-10 pr-20 py-2 border border-border rounded-full focus:ring-2 focus:ring-primary outline-none bg-background text-foreground"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button 
            className="p-1.5 rounded-full hover:bg-primary/10 text-primary transition-colors"
            title="Quick Add"
          >
            <Plus size={18} />
          </button>
          <button 
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            title="Scan with Camera"
          >
            <Camera size={18} />
          </button>
        </div>
      </div>

      {/* 3. Result Feed - Now with ZEN Spectrum status indicators */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {searchTerm && searchResults.length > 0 && searchResults.map((result, index) => (
          <button
            key={index}
            onClick={() => handleItemClick(result)}
            className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              {/* Status Indicator Dot */}
              <div className={cn(
                "w-4 h-4 rounded-full shrink-0 flex items-center justify-center",
                statusColors[result.status]
              )}>
                {result.status === "red" && <span className="text-white text-[10px]">!</span>}
              </div>
              <div>
                <p className="font-semibold text-foreground">{result.item.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {result.item.category}
                  {result.item.subcategory && ` - ${result.item.subcategory}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded-full",
                result.status === "red" && "bg-red-100 text-red-700",
                result.status === "amber" && "bg-amber-100 text-amber-700",
                result.status === "brown" && "bg-stone-100 text-stone-700",
                result.status === "green" && "bg-green-100 text-green-700",
                result.status === "blue" && "bg-blue-100 text-blue-700"
              )}>
                {statusLabels[result.status]}
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </button>
        ))}
        {searchTerm && searchResults.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">No items found for &quot;{searchTerm}&quot;</p>
            <p className="text-xs mt-1">Searched {totalItems}+ items including meds, woods, terpenes</p>
          </div>
        )}
        {!searchTerm && (
          <div className="text-center py-8 text-muted-foreground">
            <ShieldCheck className="mx-auto mb-2 opacity-20" size={48} />
            <p className="text-sm">Search {totalItems}+ items</p>
            <p className="text-xs mt-1">Meds, Woods, Terpenes, Lab Chemicals, Foods</p>
          </div>
        )}
      </div>

      {/* 4. Family Member Quick-Add */}
      <button 
        onClick={() => {
          const name = prompt("Enter Family Member Name:")
          if (name) {
            userProfile.addFamilyMember(name)
            setFamily([...userProfile.profiles])
          }
        }}
        className="w-full py-2 text-sm font-medium text-primary border border-dashed border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
      >
        + Add Child or Family Profile
      </button>
      
      {/* Item Detail Modal */}
      <ItemDetailModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem?.item || null}
        status={selectedItem?.status || "amber"}
        onAddToList={handleAddToList}
        onNavigateToSafe={onNavigateToSafe}
      />
    </div>
  )
}

export default AllergenQuickSearch
