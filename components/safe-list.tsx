"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, CheckCircle2, Leaf, Apple, ShoppingBag, ArrowRight, Info, Heart } from "lucide-react"
import { ItemDetailModal } from "./item-detail-modal"
import { SafeAlternatives } from "./safe-alternatives"
// FIXED: Added missing cn import to resolve runtime error
import { cn } from "@/lib/utils"
// FIXED: Updated import to point to your audited master profile [cite: 2026-01-23]
import { getUserProfile, addCustomAllergy } from "@/lib/user-profile"

export function SafeList() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  // Handlers for interactive actions
  const handleAction = (type: string, itemName: string) => {
    if (type === "meal") alert(`Added ${itemName} to your Meal Planner!`)
    if (type === "note") alert(`Saved ${itemName} to your allerZEN notes.`)
  }

  // Categories based on your Bulletproof lists [cite: 2026-01-20]
  const categories = ["Pantry", "Snacks", "Medicinal", "Fresh", "Sustainable"]

  return (
    <div className="space-y-6 pb-10">
      {/* Header with Zen Branding */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-[2rem] p-6 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black tracking-tighter text-white">SAFE HUB</h2>
            <p className="text-xs font-bold opacity-80 uppercase tracking-widest text-white">Verified Alternatives</p>
          </div>
          <CheckCircle2 className="w-10 h-10 opacity-30 text-white" />
        </div>
        
        <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-800" />
          <Input
            placeholder="Search safe alternatives..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 bg-white/20 border-none placeholder:text-green-100 text-white rounded-2xl backdrop-blur-md"
          />
        </div>
      </div>

      {/* Suggested Swaps (If coming from a red-search) [cite: 2026-01-25] */}
      <SafeAlternatives 
        productName="Recent Search"
        onAction={handleAction}
        alternatives={[
          { name: "Oat Milk", brand: "Oatly", description: "Perfect creamy replacement for dairy.", image: "" },
          { name: "Sunflower Butter", brand: "SunButter", description: "Nut-free and protein rich.", image: "" }
        ]}
      />

      {/* Category Chips - Using 🟢 and 🟤 logic [cite: 2026-01-25] */}
      <div className="flex gap-2 overflow-x-auto pb-2 px-1 no-scrollbar">
        {categories.map(cat => (
          <Badge
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full cursor-pointer border-2 transition-all",
              selectedCategory === cat 
                ? "bg-green-600 text-white border-green-600 shadow-md" 
                : "bg-white text-slate-500 border-slate-100"
            )}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {/* Master Safe Item List */}
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-1">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Library of Safety</CardTitle>
        </CardHeader>
        <CardContent className="px-0 space-y-3">
          {["Quinoa", "Avocado Oil", "Coconut Flour", "Lentil Pasta"].map((item, idx) => (
            <button 
              key={idx}
              onClick={() => {
                setSelectedItem({ name: item, category: "General Pantry" })
                setShowModal(true)
              }}
              className="w-full flex items-center justify-between p-4 rounded-[1.5rem] bg-white border-2 border-slate-50 hover:border-green-200 transition-all text-left shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">{item}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">General Pantry</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300" />
            </button>
          ))}
        </CardContent>
      </Card>

      <ItemDetailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        item={selectedItem}
        status="green"
        onAddToList={(item, color) => {
          // Changed yellow logic to brown (🟤) [cite: 2026-01-25]
          if (color === "brown") {
            addCustomAllergy(item.name)
          }
          setShowModal(false)
        }}
      />
    </div>
  )
}
