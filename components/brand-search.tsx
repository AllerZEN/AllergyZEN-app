"use client"

import React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, AlertTriangle, Loader2, X, Sparkles, Lock, HelpCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useWellnessStore, detectProductType, type ScanResult } from "@/lib/wellness-store"
import { SafeAlternatives } from "@/components/safe-alternatives"
import { canPerformScan, recordScan, getSubscription } from "@/lib/subscription"
import { StatusDot } from "@/components/status-dot"
import { SymptomInsightDisplay, SymptomBadge } from "@/components/symptom-insight"
import { IntensityBar, type IntensityLevel } from "@/components/intensity-bar"
import { getUserTriggers, getUserProfile, getDetailedTriggerList } from "@/lib/user-profile"
import { logScan, logAlternativeClick } from "@/lib/analytics-logger"
import nutritionTracker from "@/lib/nutrition-tracker"

interface ProductResult {
  name: string
  brand: string
  image?: string
  ingredients: string[]
  source: "openfoodfacts" | "ai"
  barcode?: string
}

interface ScreeningResult {
  product: ProductResult
  status: "safe" | "danger" | "warning" | "unknown"
  redFlags: { ingredient: string; allergen: string; intensity: string; position: number }[]
  yellowFlags: { ingredient: string; reason: string; intensity?: string }[]
  fragranceWarning: boolean
  incompleteData?: boolean
}

interface BrandSearchProps {
  onLimitReached?: () => void
}

function isDataIncomplete(ingredients: string[]): boolean {
  if (!ingredients || ingredients.length === 0) return true
  if (ingredients.length < 3) return true

  const garbledPatterns = [/^[^a-zA-Z]*$/, /[\x00-\x1F]/, /(.)\1{4,}/, /^[0-9\s,]+$/]

  const garbledCount = ingredients.filter(
    (ing) => garbledPatterns.some((pattern) => pattern.test(ing)) || ing.length < 2 || ing.length > 100,
  ).length

  return garbledCount > ingredients.length / 2
}

export function BrandSearch({ onLimitReached }: BrandSearchProps) {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<ScreeningResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showFragranceModal, setShowFragranceModal] = useState(false)
  const [currentFragranceProduct, setCurrentFragranceProduct] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [currentScanIds, setCurrentScanIds] = useState<Record<string, string>>({})
  const resultsRef = React.useRef<HTMLDivElement>(null)

  const { updateRingsFromScan, triggerBrandShieldAlert, addToHistory, skinCrisisMode } = useWellnessStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = async () => {
    if (!query.trim()) return

    const scanCheck = canPerformScan()
    if (!scanCheck.allowed) {
      onLimitReached?.()
      return
    }

    setIsSearching(true)
    setError(null)
    setResults([])
    setCurrentScanIds({})

    try {
      const userTriggers = getUserTriggers()
      const profile = getUserProfile()
      const userCategories = profile?.selectedAllergies || []
      const detailedTriggers = getDetailedTriggerList()
      const activeSensitivities = detailedTriggers.map((t) => t.name)

      const response = await fetch("/api/search-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          userTriggers,
          userCategories,
        }),
      })

      if (!response.ok) throw new Error("Search failed")

      const data = await response.json()
      const newScanIds: Record<string, string> = {}

      const processedResults = data.results.map((result: ScreeningResult) => {
        const incomplete = isDataIncomplete(result.product.ingredients)

        let finalResult = result

        if (incomplete) {
          finalResult = {
            ...result,
            status: "unknown" as const,
            incompleteData: true,
            redFlags: [],
            yellowFlags: [],
          }
        } else if (skinCrisisMode && result.status === "warning") {
          finalResult = {
            ...result,
            status: "danger" as const,
            redFlags: [
              ...result.redFlags,
              ...result.yellowFlags.map((yf) => ({
                ingredient: yf.ingredient,
                allergen: yf.reason,
                intensity: yf.intensity || "moderate",
                position: 0,
              })),
            ],
            yellowFlags: [],
          }
        }

        const scanId = logScan({
          productName: finalResult.product.name,
          productBrand: finalResult.product.brand,
          resultType: finalResult.status,
          ingredientSnapshot: finalResult.product.ingredients,
          activeSensitivities,
          skinCrisisModeActive: skinCrisisMode,
          incompleteDataWarningShown: finalResult.status === "unknown",
          fragranceWarningShown: finalResult.fragranceWarning,
          triggersFound: finalResult.redFlags.map((f) => ({
            ingredient: f.ingredient,
            allergen: f.allergen,
            intensity: f.intensity,
          })),
          cautionsFound: finalResult.yellowFlags.map((f) => ({
            ingredient: f.ingredient,
            reason: f.reason,
          })),
        })

        newScanIds[finalResult.product.name] = scanId

        return finalResult
      })

      setResults(processedResults)
      setCurrentScanIds(newScanIds)

      recordScan()

      for (const result of processedResults as ScreeningResult[]) {
        if (result.status === "unknown") continue

        const productType = detectProductType(result.product.name, result.product.ingredients)

        const scanResult: ScanResult = {
          productName: result.product.name,
          productType,
          status: result.status === "warning" ? "caution" : result.status,
          redFlags: result.redFlags.map((f) => ({ ingredient: f.ingredient, allergen: f.allergen })),
          yellowFlags: result.yellowFlags,
          fragranceWarning: result.fragranceWarning,
          timestamp: new Date(),
        }

        updateRingsFromScan(scanResult)
        addToHistory(scanResult)

        if (result.status === "danger") {
          triggerBrandShieldAlert()
        }
        
        // AUTO-FLOW: Push food data to Diabetes tracker
        if (result.status === "safe" && result.product.name) {
          // Add to nutrition tracker (estimates carbs/calories)
          const food = nutritionTracker.addFood(result.product.name, "scan")
          
          // Dispatch custom event for diabetes hub to pick up
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("allergyzen:food-scanned", {
              detail: { 
                carbs: food.nutrition.carbs, 
                calories: food.nutrition.calories,
                name: result.product.name
              }
            }))
          }
        }
      }

      const fragranceProduct = processedResults.find(
        (r: ScreeningResult) => r.fragranceWarning && r.status !== "unknown",
      )
      if (fragranceProduct) {
        setCurrentFragranceProduct(fragranceProduct.product.name)
        setShowFragranceModal(true)
      }
    } catch {
      setError("Failed to search. Please try again.")
    } finally {
      setIsSearching(false)
      
      // FIX: Force scroll to results to prevent "silent success" bug
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 100)
    }
  }

  const handleAlternativeClick = (productName: string, alternativeName: string) => {
    const scanId = currentScanIds[productName]
    if (scanId) {
      logAlternativeClick(scanId, alternativeName)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "safe":
        return "SAFE"
      case "danger":
        return "DANGER"
      case "unknown":
        return "UNKNOWN"
      default:
        return "CAUTION"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
        return "border-success/50 bg-success/5"
      case "danger":
        return "border-destructive/50 bg-destructive/5"
      case "unknown":
        return "border-gray-400/50 bg-gray-400/5"
      default:
        return "border-warning/50 bg-warning/5"
    }
  }

  const scanLimits = mounted ? canPerformScan() : { allowed: true, remaining: 3, limit: 3 }
  const subscription = mounted
    ? getSubscription()
    : { tier: "trial" as const, trialStartDate: "", trialEndDate: "", scansToday: 0, mealsToday: 0, lastResetDate: "" }
  const isFreemium = subscription.tier === "freemium"

  return (
    <div className="space-y-4">
      {skinCrisisMode && (
        <div className="p-2 rounded-lg bg-destructive/20 border border-destructive/50 text-center">
          <p className="text-sm font-semibold text-destructive flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Skin Crisis Mode Active - All caution items elevated to danger
          </p>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search Brand or Product..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="pl-10 pr-24 h-12 bg-card/50 border-primary/20 focus:border-primary shadow-sm"
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-10"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
        </Button>
      </div>

      {isFreemium && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Daily scans remaining
          </span>
          <Badge variant={scanLimits.remaining > 0 ? "secondary" : "destructive"} className="text-xs">
            {scanLimits.remaining} / {scanLimits.limit}
          </Badge>
        </div>
      )}

      {/* Quick Search Suggestions */}
      <div className="flex flex-wrap gap-2">
        {["Nutella", "Tide", "Dove", "Allevia"].map((suggestion) => (
          <Button
            key={suggestion}
            variant="outline"
            size="sm"
            className="text-xs border-border bg-card hover:bg-accent"
            onClick={() => {
              setQuery(suggestion)
            }}
          >
            {suggestion}
          </Button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4 text-center text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isSearching && (
        <Card className="border-border">
          <CardContent className="p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Searching databases...</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <AnimatePresence>
        {/* Results Container with ref for auto-scroll fix */}
      <div ref={resultsRef} />
      {results.map((result, index) => (
          <motion.div
            key={`${result.product.barcode || result.product.name}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn("border-2 overflow-hidden shadow-sm", getStatusColor(result.status))}>
              <CardContent className="p-0">
                <div
                  className={cn(
                    "px-4 py-3 flex items-center justify-between",
                    result.status === "safe"
                      ? "bg-success/10"
                      : result.status === "danger"
                        ? "bg-destructive/10"
                        : result.status === "unknown"
                          ? "bg-gray-400/10"
                          : "bg-warning/10",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <StatusDot
                      status={result.status === "warning" ? "caution" : result.status}
                      size="lg"
                      pulse={result.status === "danger"}
                    />
                    <div>
                      <p className="font-bold text-lg">{getStatusLabel(result.status)}</p>
                      <p className="text-xs text-muted-foreground">
                        {result.status === "unknown"
                          ? "Incomplete data"
                          : `${result.redFlags.length} triggers, ${result.yellowFlags.length} cautions`}
                      </p>
                    </div>
                  </div>
                  {result.product.source === "ai" && (
                    <Badge variant="outline" className="gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Found
                    </Badge>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 flex gap-4">
                  {result.product.image ? (
                    <img
                      src={result.product.image || "/placeholder.svg"}
                      alt={result.product.name}
                      className="w-20 h-20 object-contain rounded-lg bg-white"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <StatusDot status={result.status === "warning" ? "caution" : result.status} size="sm" />
                      <h3 className="font-semibold text-lg leading-tight">{result.product.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.product.brand}</p>
                    {result.product.barcode && (
                      <p className="text-xs text-muted-foreground mt-1">Barcode: {result.product.barcode}</p>
                    )}
                  </div>
                </div>

                {result.status === "unknown" && (
                  <div className="mx-4 mb-4 p-3 rounded-lg bg-gray-400/20 border border-gray-400/50">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-gray-500" />
                      <p className="font-semibold text-gray-600 dark:text-gray-400">Incomplete Ingredient Data</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      The ingredient list for this product is missing, incomplete, or contains garbled text.
                      <strong className="text-foreground"> Please check the physical label before consuming.</strong>
                    </p>
                  </div>
                )}

                {/* Fragrance Warning */}
                {result.fragranceWarning && result.status !== "unknown" && (
                  <div className="mx-4 mb-4 p-3 rounded-lg bg-warning/20 border border-warning/50">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                      <p className="font-semibold text-warning">Fragrance Warning</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Contains &quot;Fragrance&quot; or &quot;Parfum&quot; - undisclosed ingredients may include
                      triggers
                    </p>
                  </div>
                )}

                {/* Red Flags with Intensity Bars */}
                {result.redFlags.length > 0 && result.status !== "unknown" && (
                  <div className="px-4 pb-4">
                    <p className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
                      <StatusDot status="danger" size="sm" />
                      Your Triggers Found:
                    </p>
                    <div className="space-y-2">
                      {result.redFlags.map((flag, i) => (
                        <div key={i} className="flex items-center gap-2 flex-wrap">
                          <Badge variant="destructive" className="gap-1">
                            {flag.ingredient}
                          </Badge>
                          <IntensityBar
                            intensity={flag.intensity as IntensityLevel}
                            position={flag.position}
                            total={result.product.ingredients.length}
                          />
                          <span className="text-xs text-muted-foreground">({flag.allergen})</span>
                          <SymptomBadge allergen={flag.allergen} />
                        </div>
                      ))}
                    </div>
                    {result.redFlags[0] && (
                      <SymptomInsightDisplay allergen={result.redFlags[0].allergen} className="mt-3" />
                    )}
                  </div>
                )}

                {/* Yellow Flags */}
                {result.yellowFlags.length > 0 && result.status !== "unknown" && (
                  <div className="px-4 pb-4">
                    <p className="text-sm font-semibold text-warning mb-2 flex items-center gap-2">
                      <StatusDot status="warning" size="sm" />
                      Trace Amounts / Caution:
                    </p>
                    <div className="space-y-2">
                      {result.yellowFlags.map((flag, i) => (
                        <div key={i} className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="border-warning/50 text-warning">
                            {flag.ingredient}
                          </Badge>
                          {flag.intensity && <IntensityBar intensity={flag.intensity as IntensityLevel} />}
                          <span className="text-xs text-muted-foreground">{flag.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Safe Alternatives with click tracking */}
                {(result.status === "danger" || result.status === "warning") && (
                  <div className="px-4 pb-4">
                    <SafeAlternatives
                      productName={result.product.name}
                      ingredients={result.product.ingredients}
                      status={result.status === "warning" ? "caution" : result.status}
                      onAlternativeClick={(altName) => handleAlternativeClick(result.product.name, altName)}
                    />
                  </div>
                )}

                {/* Ingredients List */}
                {result.product.ingredients.length > 0 && (
                  <details className="px-4 pb-4">
                    <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                      View all ingredients ({result.product.ingredients.length})
                    </summary>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      {result.product.ingredients.join(", ")}
                    </p>
                  </details>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Fragrance Warning Modal */}
      <AnimatePresence>
        {showFragranceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowFragranceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-warning/50 rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-warning/20">
                    <AlertTriangle className="w-6 h-6 text-warning" />
                  </div>
                  <h3 className="font-bold text-lg">Fragrance Alert</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowFragranceModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-3">
                <p className="text-sm">
                  <strong>{currentFragranceProduct}</strong> contains &quot;Fragrance&quot; or &quot;Parfum&quot; in its
                  ingredients.
                </p>
                <p className="text-sm text-muted-foreground">
                  This is a blanket term that can hide hundreds of undisclosed chemicals, including potential allergens
                  and irritants.
                </p>
              </div>

              <Button className="w-full mt-4" onClick={() => setShowFragranceModal(false)}>
                I Understand
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
