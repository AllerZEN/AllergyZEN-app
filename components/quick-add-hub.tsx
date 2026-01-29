"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search,
  X,
  AlertTriangle,
  AlertCircle,
  Check,
  Heart
} from "lucide-react"
import userProfile from "@/lib/profile"
import { cn } from "@/lib/utils"

interface QuickAddHubProps {
  onItemAdded?: () => void
}

type DotColor = "red" | "amber" | "green" | "blue"

const DOT_CONFIGS: Record<DotColor, { label: string; color: string; bgColor: string; description: string }> = {
  red: { 
    label: "Danger", 
    color: "text-red-500", 
    bgColor: "bg-red-500",
    description: "Anaphylaxis/Severe" 
  },
  amber: { 
    label: "Caution", 
    color: "text-amber-500", 
    bgColor: "bg-amber-500",
    description: "Sensitivity/Intolerance" 
  },
  green: { 
    label: "Safe", 
    color: "text-green-500", 
    bgColor: "bg-green-500",
    description: "Verified Safe" 
  },
  blue: { 
    label: "Boundary", 
    color: "text-blue-500", 
    bgColor: "bg-blue-500",
    description: "Personal Preference" 
  }
}

export function QuickAddHub({ onItemAdded }: QuickAddHubProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [itemName, setItemName] = useState("")
  const [selectedDot, setSelectedDot] = useState<DotColor | null>(null)
  const [category, setCategory] = useState("Food")

  const handleAdd = () => {
    if (!itemName.trim() || !selectedDot) return
    
    userProfile.addItem(itemName.trim(), category, selectedDot)
    setItemName("")
    setSelectedDot(null)
    setIsOpen(false)
    onItemAdded?.()
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full bg-[#1A1A1B] hover:bg-[#2A2A2B] text-white border-2 border-[#1A1A1B]"
      >
        <Plus className="w-4 h-4 mr-2" />
        Quick-Add to Zen Spectrum
      </Button>
    )
  }

  return (
    <Card className="border-2 border-[#1A1A1B] bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-gray-800">Quick-Add to Spectrum</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Item Name Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Item Name</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="e.g., Peanuts, Latex, Wool..."
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="pl-10 border-2 border-gray-300 focus:border-[#8E55A2]"
            />
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <div className="flex gap-2 flex-wrap">
            {["Food", "Chemical", "Textile", "Medication", "Environment"].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all",
                  category === cat
                    ? "border-[#8E55A2] bg-[#8E55A2]/10 text-[#8E55A2]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Zen Spectrum Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Zen Spectrum Level</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(DOT_CONFIGS) as [DotColor, typeof DOT_CONFIGS.red][]).map(([dot, config]) => (
              <button
                key={dot}
                onClick={() => setSelectedDot(dot)}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all text-left",
                  selectedDot === dot
                    ? `border-${dot === "red" ? "red" : dot === "amber" ? "amber" : dot === "green" ? "green" : "blue"}-500 ${config.bgColor}/10`
                    : "border-gray-200 hover:border-gray-300"
                )}
                style={{
                  borderColor: selectedDot === dot ? 
                    (dot === "red" ? "#ef4444" : dot === "amber" ? "#f59e0b" : dot === "green" ? "#22c55e" : "#3b82f6") : 
                    undefined,
                  backgroundColor: selectedDot === dot ?
                    (dot === "red" ? "#fef2f2" : dot === "amber" ? "#fffbeb" : dot === "green" ? "#f0fdf4" : "#eff6ff") :
                    undefined
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn("w-4 h-4 rounded-full", config.bgColor)} />
                  <span className={cn("font-semibold", config.color)}>{config.label}</span>
                </div>
                <p className="text-xs text-gray-500">{config.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Add Button */}
        <Button
          onClick={handleAdd}
          disabled={!itemName.trim() || !selectedDot}
          className="w-full bg-[#1A1A1B] hover:bg-[#2A2A2B] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add to {selectedDot ? DOT_CONFIGS[selectedDot].label : "Spectrum"}
        </Button>
      </CardContent>
    </Card>
  )
}
