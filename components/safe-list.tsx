"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, CheckCircle2, Leaf, ArrowRight, ArrowLeft } from "lucide-react"
import { ItemDetailModal } from "./item-detail-modal"
import { SafeAlternatives } from "./safe-alternatives"
import { cn } from "@/lib/utils"
// FIXED: Ensured this matches your existing lib structure
import { getUserProfile, addCustomAllergy } from "@/lib/user-profile"

// FIX: Added 'default' and 'onBack' prop to fix the runtime error
export default function SafeList({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  const handleAction = (type: string, itemName: string) => {
    if (type === "meal") alert(`Added ${itemName} to your Meal Planner!`)
    if (type === "note") alert(`Saved ${itemName} to your allerZEN notes.`)
  }

  const categories = ["Pantry", "Snacks", "Medicinal", "Fresh", "Sustainable"]

  return (
    <div className="min-h-screen bg-white p-4 pb-20 space-y-4">
      {/* Dashboard Navigation [cite: 2026-01-20] */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest mb-4 active:scale-95 transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

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

      <SafeAlternatives 
        productName="Recent Search"
        onAction={handleAction}
        alternatives={[
          { name: "Oat Milk", brand: "Oatly", description: "Perfect creamy replacement for dairy.", image: "" },
          { name: "Sunflower Butter", brand: "SunButter", description: "Nut-free and protein rich.", image: "" }
        ]}
      />

      <div className="flex gap-2 overflow-x-auto pb-2 px-1 no-scrollbar">
        {categories.map(cat => (
          <Badge
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full cursor-pointer border-2 transition-all whitespace-nowrap",
              selectedCategory === cat 
                ? "bg-green-600 text-white border-green-600 shadow-md" 
                : "bg-white text-slate-500 border-slate-100"
            )}
          >
            {cat}
          </Badge>
        ))}
      </div>

      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-1">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Library of Safety</CardTitle>
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
          // Yellow to brown (🟤) logic [cite: 2026-01-25]
          if (color === "brown") {
            addCustomAllergy(item.name)
          }
          setShowModal(false)
        }}
      />
    </div>
  )
}
