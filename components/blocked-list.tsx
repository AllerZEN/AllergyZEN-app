"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, AlertTriangle, Ban, Info, Heart, ShieldAlert, ArrowLeft } from "lucide-react"
import allergensData from "@/lib/allergen-database" 
import { SensitivityDetailModal } from "./sensitivity-detail-modal"

interface AllergenItem {
  id: string
  name: string
  category: string
  tier: "red" | "amber" | "brown" | "blue"
}

// FIX 1 & 2: Added 'default' and fixed 'onBack' naming
export default function BlockedList({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<"red" | "amber" | "brown" | "blue">("red")
  const [selectedItem, setSelectedItem] = useState<AllergenItem | null>(null)

  const tierData = useMemo(() => ({
    red: (allergensData.high_reactivity || []) as AllergenItem[],
    amber: (allergensData.moderate_reactivity || []) as AllergenItem[],
    brown: (allergensData.disliked || []) as AllergenItem[], // Zen Dislike Tier
    blue: (allergensData.sensory || []) as AllergenItem[] // ED Boundaries
  }), [])

  const filteredItems = useMemo(() => {
    const currentList = tierData[activeTab]
    if (!search.trim()) return currentList.slice(0, 50)
    const searchLower = search.toLowerCase().trim()
    return currentList.filter(item => 
      item.name.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
    ).slice(0, 50)
  }, [tierData, activeTab, search])

  // FIX 3: Updated to official Brown/Dislike tiering
  const TIER_UI = {
    red: { color: "bg-red-500", text: "text-red-600", label: "Red - Severe", icon: ShieldAlert, bgLight: "bg-red-50" },
    amber: { color: "bg-orange-500", text: "text-orange-600", label: "Amber - Moderate", icon: AlertTriangle, bgLight: "bg-orange-50" },
    brown: { color: "bg-[#78350f]", text: "text-[#78350f]", label: "Brown - Dislike", icon: Info, bgLight: "bg-orange-50/30" },
    blue: { color: "bg-blue-500", text: "text-blue-600", label: "Blue - ED Boundaries", icon: Heart, bgLight: "bg-blue-50" }
  }

  return (
    <div className="min-h-screen bg-white p-4 pb-20 space-y-4">
      {/* Back Button Navigation */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest mb-4 active:scale-95 transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <Card className="border-blue-100 shadow-sm overflow-hidden rounded-[32px]">
        <CardHeader className="pb-3 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
              <Ban className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-black italic tracking-tighter">ZEN <span className="text-red-600">BLOCKED</span></CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Shield Protection Active</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search triggers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all shadow-inner"
            />
          </div>

          <div className="grid grid-cols-4 gap-2 p-1.5 bg-gray-100 rounded-2xl">
            {(["red", "amber", "brown", "blue"] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setActiveTab(tier)}
                className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all ${
                  activeTab === tier 
                    ? `${TIER_UI[tier].color} text-white shadow-lg scale-[1.02]` 
                    : "text-gray-400"
                }`}
              >
                <div className="text-[10px] font-black uppercase tracking-tighter">{tier}</div>
                <div className={`w-1 h-1 rounded-full mt-1 ${activeTab === tier ? 'bg-white' : 'bg-transparent'}`} />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* List Display */}
      <div className="space-y-3">
        <h3 className="px-2 text-[10px] font-black uppercase tracking-[.2em] text-gray-400 flex items-center justify-between">
          <span>{TIER_UI[activeTab].label}</span>
          <span>{filteredItems.length} items</span>
        </h3>
        
        <div className="grid gap-2">
          {filteredItems.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <p className="text-gray-300 font-black italic uppercase text-sm">Clear Horizons</p>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">No blocks found in this tier</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedItem(item)}
                className="w-full group bg-white border border-gray-100 p-5 rounded-[24px] flex items-center justify-between hover:border-blue-200 active:scale-[0.98] transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${TIER_UI[activeTab].color} shadow-sm ${activeTab === 'red' ? 'animate-pulse' : ''}`} />
                  <div>
                    <p className="font-black text-slate-900 text-sm tracking-tight">{item.name}</p>
                    <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mt-0.5">{item.category}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-blue-500 transition-colors" />
              </button>
            ))
          )}
        </div>
      </div>

      {selectedItem && (
        <SensitivityDetailModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          item={{
            name: selectedItem.name,
            category: selectedItem.category,
            tier: activeTab
          }}
        />
      )}
    </div>
  )
}

function ChevronRight(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  )
}
