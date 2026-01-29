"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, AlertTriangle, Ban, Info } from "lucide-react"
import allergensData from "@/allergens.json"
import { SensitivityDetailModal } from "./sensitivity-detail-modal"

interface AllergenItem {
  name: string
  category: string
}

export function BlockedList() {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<"red" | "amber">("red")
  const [selectedItem, setSelectedItem] = useState<AllergenItem | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const redItems = useMemo(() => {
    return (allergensData.high_reactivity || []) as AllergenItem[]
  }, [])

  const amberItems = useMemo(() => {
    return (allergensData.moderate_reactivity || []) as AllergenItem[]
  }, [])

  const filteredRed = useMemo(() => {
    if (!search.trim()) return redItems.slice(0, 50)
    const searchLower = search.toLowerCase().trim()
    return redItems.filter(item => 
      item.name.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
    ).slice(0, 50)
  }, [redItems, search])

  const filteredAmber = useMemo(() => {
    if (!search.trim()) return amberItems.slice(0, 50)
    const searchLower = search.toLowerCase().trim()
    return amberItems.filter(item => 
      item.name.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
    ).slice(0, 50)
  }, [amberItems, search])

  const handleItemClick = (item: AllergenItem) => {
    setSelectedItem(item)
    setShowDetail(true)
  }

  return (
    <div className="space-y-4">
      <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-background">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <Ban className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Blocked List</CardTitle>
              <CardDescription>Your flagged triggers and sensitivities</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search blocked items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setActiveTab("red")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                activeTab === "red" 
                  ? "bg-red-500 text-white shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-current opacity-80" />
              Red - Anaphylaxis
            </button>
            <button
              onClick={() => setActiveTab("amber")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                activeTab === "amber" 
                  ? "bg-orange-500 text-white shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-current opacity-80" />
              Amber - Sensitivity
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {activeTab === "red" ? (
              <>
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>High Risk Triggers ({filteredRed.length})</span>
              </>
            ) : (
              <>
                <Info className="w-4 h-4 text-orange-600" />
                <span>Sensitivity Triggers ({filteredAmber.length})</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {activeTab === "red" ? (
              filteredRed.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No red triggers found</p>
              ) : (
                filteredRed.map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleItemClick(item)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                    <Badge variant="destructive" className="text-xs">AVOID</Badge>
                  </button>
                ))
              )
            ) : (
              filteredAmber.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No amber triggers found</p>
              ) : (
                filteredAmber.map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleItemClick(item)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 hover:bg-orange-500/10 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                    <Badge className="text-xs bg-orange-500/20 text-orange-700 border-orange-500/30">CAUTION</Badge>
                  </button>
                ))
              )
            )}
          </div>
        </CardContent>
      </Card>

      {selectedItem && (
        <SensitivityDetailModal
          isOpen={showDetail}
          onClose={() => {
            setShowDetail(false)
            setSelectedItem(null)
          }}
          item={{
            name: selectedItem.name,
            category: selectedItem.category,
            severity: activeTab === "red" ? "high" : "moderate"
          }}
        />
      )}
    </div>
  )
}
