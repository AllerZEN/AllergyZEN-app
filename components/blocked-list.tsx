"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, AlertTriangle, Ban, Info, Heart, ShieldAlert } from "lucide-react"
// Ensure this points to your comprehensive database
import allergensData from "@/lib/allergen-database" 
import { SensitivityDetailModal } from "./sensitivity-detail-modal"

interface AllergenItem {
  id: string
  name: string
  category: string
  tier: "red" | "amber" | "brown" | "blue"
}

export function BlockedList() {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<"red" | "amber" | "brown" | "blue">("red")
  const [selectedItem, setSelectedItem] = useState<AllergenItem | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  // Map the 4 tiers from your 2026 Master Database
  const tierData = useMemo(() => ({
    red: (allergensData.high_reactivity || []) as AllergenItem[],
    amber: (allergensData.moderate_reactivity || []) as AllergenItem[],
    brown: (allergensData.disliked || []) as AllergenItem[],
    blue: (allergensData.sensory || []) as AllergenItem[]
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

  const TIER_UI = {
    red: { color: "bg-red-500", text: "text-red-600", label: "Red - Severe", icon: ShieldAlert, bgLight: "bg-red-50" },
    amber: { color: "bg-orange-500", text: "text-orange-600", label: "Amber - Moderate", icon: AlertTriangle, bgLight: "bg-orange-50" },
    brown: { color: "bg-amber-800", text: "text-stone-600", label: "Brown - Dislike", icon: Info, bgLight: "bg-stone-50" },
    blue: { color: "bg-blue-500", text: "text-blue-600", label: "Blue - Sensory", icon: Heart, bgLight: "bg-blue-50" }
  }

  return (
    <div className="space-y-4">
      <Card className="border-blue-100 bg-gradient-to-br from-blue-50/50 to-background">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center">
              <Ban className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-black">Zen Blocked List</CardTitle>
              <CardDescription>Verified triggers & protection settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search your shield..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>

          {/* 4-Tier Navigation */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
            {(["red", "amber", "brown", "blue"] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setActiveTab(tier)}
                className={`flex items-center justify-center gap-2 py-2 px-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                  activeTab === tier 
                    ? `${TIER_UI[tier].color} text-white shadow-md` 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tier === 'blue' ? <Heart className="w-3 h-3 fill-current" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                {tier}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = TIER_UI[activeTab].icon;
                return <Icon className={`w-4 h-4 ${TIER_UI[activeTab].text}`} />;
              })()}
              <span className="uppercase tracking-tight">{TIER_UI[activeTab].label}</span>
            </div>
            <Badge variant="outline" className="text-[10px]">{filteredItems.length} Items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredItems.length === 0 ? (
              <p className="text-center text-gray-400 py-10 text-xs italic">No items found in this tier.</p>
            ) : (
              filteredItems.map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${TIER_UI[activeTab].bgLight} hover:shadow-sm`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${TIER_UI[activeTab].color} ${activeTab === 'red' ? 'animate-pulse' : ''}`} />
                    <div>
                      <p className="font-bold text-sm text-gray-900 leading-none">{item.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase mt-1">{item.category}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

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
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  )
}
