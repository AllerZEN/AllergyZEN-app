"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertTriangle, Search, Utensils, FlaskConical, Shirt, ChevronRight } from "lucide-react"
import { redTierAllergens, type Allergen } from "@/lib/allergen-data"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { AllergyDetailModal } from "./allergy-detail-modal"
import { ImageUploader } from "./image-uploader"

export function AllergenList() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "food" | "chemical" | "fabric">("all")
  const [selectedAllergen, setSelectedAllergen] = useState<Allergen | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const categoryIcons = {
    food: Utensils,
    chemical: FlaskConical,
    fabric: Shirt,
  }

  const filteredAllergens = redTierAllergens.filter((allergen) => {
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

      <Card className="bg-card/50 backdrop-blur border-destructive/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Red Tier - Strict Block
            <Badge variant="destructive" className="ml-auto">
              {redTierAllergens.length} Items
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search allergens..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {(["all", "food", "chemical", "fabric"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(f)}
                className="capitalize whitespace-nowrap"
              >
                {f}
              </Button>
            ))}
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {filteredAllergens.map((allergen) => {
                const Icon = categoryIcons[allergen.category]

                return (
                  <motion.div
                    key={allergen.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card
                      className={cn(
                        "bg-destructive/5 border-destructive/20 cursor-pointer transition-colors hover:bg-destructive/10",
                      )}
                      onClick={() => handleAllergenClick(allergen)}
                    >
                      <CardContent className="pt-3 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded bg-destructive/10">
                            <Icon className="w-4 h-4 text-destructive" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-sm">{allergen.name}</span>
                            {allergen.derivatives && allergen.derivatives.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {allergen.derivatives.length} hidden derivatives
                              </p>
                            )}
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
