"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  AlertTriangle, Search, Utensils, FlaskConical, Shirt, 
  ChevronRight, Heart, Info, ShieldCheck, Pill, Factory 
} from "lucide-react"
// Note: Ensure your emailed lib/allergen-data.ts exports these 5 arrays
import { 
  redTierAllergens, amberTierAllergens, brownTierAllergens, 
  blueTierAllergens, type Allergen, type ZenTier 
} from "@/lib/allergen-data"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { AllergyDetailModal } from "./allergy-detail-modal"
import { ImageUploader } from "./image-uploader"

export function AllergenList() {
  const [search, setSearch] = useState("")
  // Updated Filter to include new 2026 categories
  const [filter, setFilter] = useState<"all" | "food" | "chemical" | "fabric" | "laboratory" | "medicinal" | "sensory">("all")
  const [selectedAllergen, setSelectedAllergen] = useState<Allergen | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // 2026 Icon Mapping
  const categoryIcons = {
    food: Utensils,
    chemical: FlaskConical,
    fabric: Shirt,
    laboratory: Factory,
    medicinal: Pill,
    material: Factory,
    sensory: Heart
  }

  // 5-Color Tier Configuration
  const TIER_CONFIG = {
    red: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50", border: "border-red-200", label: "Severe" },
    amber: { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200", label: "Moderate" },
    brown: { icon: Info, color: "text-stone-600", bg: "bg-stone-100", border: "border-stone-200", label: "Dislike" },
    blue: { icon: Heart, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200", label: "Sensory" },
    green: { icon: ShieldCheck, color: "text-green-500", bg: "bg-green-50", border: "border-green-200", label: "Safe" }
  }

  // Combine all tiers for the master view
  const allAllergens = [
    ...redTierAllergens, 
    ...amberTierAllergens, 
    ...brownTierAllergens, 
    ...blueTierAllergens
  ]

  const filteredAllergens = allAllergens.filter((allergen) => {
    const matchesSearch =
      allergen.name.toLowerCase().includes(search.toLowerCase()) ||
      allergen.aliases.some((a) => a.toLowerCase().includes(search.toLowerCase()))
    const matchesFilter = filter === "all" || allergen.category === filter
    return matchesSearch && matchesFilter
  })

  function handleAllergenClick(allergen: Allergen) {
    setSelectedAllergen(allergen)
    setModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <ImageUploader />

      <Card className="bg-card/50 backdrop-blur border-blue-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 font-bold text-gray-800">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            allergyZEN Shield Profile
            <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700">
              {allAllergens.length} Active Triggers
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search your triggers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>

          {/* New Category Filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
            {["all", "food", "medicinal", "laboratory", "sensory", "chemical", "fabric"].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "secondary"}
                size="sm"
                onClick={() => setFilter(f as any)}
                className="capitalize whitespace-nowrap rounded-full text-xs"
              >
                {f}
              </Button>
            ))}
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {filteredAllergens.map((allergen) => {
                const config = TIER_CONFIG[allergen.tier as ZenTier]
                const Icon = categoryIcons[allergen.category as keyof typeof categoryIcons] || Info

                return (
                  <motion.div
                    key={allergen.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md border",
                        config.bg,
                        config.border
                      )}
                      onClick={() => handleAllergenClick(allergen)}
                    >
                      <CardContent className="pt-3 pb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg bg-white/50")}>
                            <Icon className={cn("w-4 h-4", config.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-gray-900">{allergen.name}</span>
                              <span className={cn("text-[10px] uppercase font-bold px-1.5 py-0.5 rounded", config.color, "bg-white/50 border")}>
                                {config.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
                              {allergen.category} • {allergen.aliases.length} aliases
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      <AllergyDetailModal allergen={selectedAllergen} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
