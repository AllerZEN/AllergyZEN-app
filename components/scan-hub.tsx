"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Scan, QrCode, Package, Building2, Camera, Pill, Droplets, TreeDeciduous, Apple } from "lucide-react"
import { QRScanner } from "./qr-scanner"
import { BrandSearch } from "./brand-search"
import { cn } from "@/lib/utils"

// Universal scan categories
const SCAN_CATEGORIES = [
  { id: "food", label: "Food/Drink", icon: Apple, color: "bg-green-500", description: "Biscuits, drinks, packaged foods" },
  { id: "meds", label: "Medication", icon: Pill, color: "bg-blue-500", description: "Pills, excipients, supplements" },
  { id: "chemical", label: "Chemicals", icon: Droplets, color: "bg-orange-500", description: "Cleaning, perfume, cosmetics" },
  { id: "wood", label: "Woods", icon: TreeDeciduous, color: "bg-amber-700", description: "Furniture, dust, construction" },
]

export function ScanHub() {
  const [activeTab, setActiveTab] = useState<"product" | "business">("product")
  const [selectedCategory, setSelectedCategory] = useState<string>("food")

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
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
          <div className="flex gap-2 p-1 bg-muted rounded-lg mb-4">
            <button
              onClick={() => setActiveTab("product")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all",
                activeTab === "product"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Package className="w-4 h-4" />
              Product Scan
            </button>
            <button
              onClick={() => setActiveTab("business")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all",
                activeTab === "business"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Building2 className="w-4 h-4" />
              Business QR
            </button>
          </div>
          
          {/* Category Selection (Product mode only) */}
          {activeTab === "product" && (
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
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300"
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
      {activeTab === "product" && (
        <Card className="bg-gray-50 border-0">
          <CardContent className="p-3">
            <p className="text-xs text-gray-600 text-center">
              <span className="font-semibold">Action Flow:</span> Scan result will offer Quick Add to route item to the correct tab
            </p>
            <div className="flex justify-center gap-3 mt-2 text-[10px]">
              <Badge variant="outline" className="border-green-300 text-green-700">Food to Safe List + Diabetes</Badge>
              <Badge variant="outline" className="border-red-300 text-red-700">Meds/Chem to Shield</Badge>
              <Badge variant="outline" className="border-blue-300 text-blue-700">Sensory to ED</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scanner Content */}
      {activeTab === "product" ? (
        <BrandSearch />
      ) : (
        <QRScanner />
      )}
    </div>
  )
}
