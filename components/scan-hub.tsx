"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scan, Package, Building2, Pill, Droplets, TreeDeciduous, Apple, Keyboard } from "lucide-react"
import { QRScanner } from "./qr-scanner"
import { BrandSearch } from "./brand-search"
import { CameraScanner } from "./camera-scanner"
import { cn } from "@/lib/utils"

// Universal scan categories
const SCAN_CATEGORIES = [
  { id: "food", label: "Food/Drink", icon: Apple, color: "bg-green-500", description: "Biscuits, drinks, packaged foods" },
  { id: "meds", label: "Medication", icon: Pill, color: "bg-blue-500", description: "Pills, excipients, supplements" },
  { id: "chemical", label: "Chemicals", icon: Droplets, color: "bg-orange-500", description: "Cleaning, perfume, cosmetics" },
  { id: "wood", label: "Woods", icon: TreeDeciduous, color: "bg-amber-700", description: "Furniture, dust, construction" },
]

interface ScanHubProps {
  onNavigateToSafe?: () => void
}

export function ScanHub({ onNavigateToSafe }: ScanHubProps) {
  const [activeTab, setActiveTab] = useState<"camera" | "text" | "business">("camera")
  const [selectedCategory, setSelectedCategory] = useState<string>("food")

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="border-[#673AB7]/20 bg-gradient-to-br from-[#EDE7F6] to-white">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#673AB7] flex items-center justify-center">
              <Scan className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">allergyZEN Scan Hub</CardTitle>
              <CardDescription>Universal scanner for all categories</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Main Tab Toggle */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg mb-4">
            <button
              onClick={() => setActiveTab("camera")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-md text-sm font-medium transition-all",
                activeTab === "camera"
                  ? "bg-[#673AB7] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Package className="w-4 h-4" />
              Camera
            </button>
            <button
              onClick={() => setActiveTab("text")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-md text-sm font-medium transition-all",
                activeTab === "text"
                  ? "bg-[#673AB7] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Keyboard className="w-4 h-4" />
              Text Search
            </button>
            <button
              onClick={() => setActiveTab("business")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-md text-sm font-medium transition-all",
                activeTab === "business"
                  ? "bg-[#673AB7] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Building2 className="w-4 h-4" />
              Business
            </button>
          </div>
          
          {/* Category Selection (Camera/Text modes) */}
          {(activeTab === "camera" || activeTab === "text") && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">What are you scanning?</p>
              <div className="grid grid-cols-2 gap-2">
                {SCAN_CATEGORIES.map((cat) => {
                  const Icon = cat.icon
                  const isActive = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left",
                        isActive
                          ? "border-[#673AB7] bg-[#EDE7F6]"
                          : "border-gray-200 hover:border-[#9575CD]"
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", cat.color)}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{cat.label}</p>
                        <p className="text-[10px] text-gray-500 line-clamp-1">{cat.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Add Action Flow Info */}
      {(activeTab === "camera" || activeTab === "text") && (
        <Card className="bg-[#EDE7F6]/50 border-[#673AB7]/10">
          <CardContent className="p-3">
            <p className="text-xs text-gray-600 text-center">
              <span className="font-semibold">Action Flow:</span> Scan result offers Quick Add to route items
            </p>
            <div className="flex justify-center gap-2 mt-2 text-[10px] flex-wrap">
              <Badge variant="outline" className="border-green-300 text-green-700">Food to Safe + Diabetes</Badge>
              <Badge variant="outline" className="border-red-300 text-red-700">Allergens to Shield</Badge>
              <Badge variant="outline" className="border-blue-300 text-blue-700">Sensory to ED</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scanner Content */}
      {activeTab === "camera" && (
        <CameraScanner onNavigateToSafe={onNavigateToSafe} />
      )}
      
      {activeTab === "text" && (
        <BrandSearch />
      )}
      
      {activeTab === "business" && (
        <QRScanner />
      )}
    </div>
  )
}
