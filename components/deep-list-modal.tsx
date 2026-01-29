"use client"

import { useState, useMemo, useCallback } from "react"
import { X, Search, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusDot } from "@/components/status-dot"
import { IntensityBar } from "@/components/intensity-bar"
import { SensitivityDetailModal } from "@/components/sensitivity-detail-modal"
import { cn } from "@/lib/utils"

import rawAllergensData from "@/allergens.json"

interface AllergenItem {
  name: string
  category?: string
}

interface AllergensJSON {
  metadata?: {
    lastUpdated?: string
    totalItems?: number
    source?: string
  }
  high_reactivity?: AllergenItem[]
  moderate_reactivity?: AllergenItem[]
  no_reactivity?: AllergenItem[]
}

const allergensData = rawAllergensData as AllergensJSON

interface TriggerItem {
  name: string
  category: string
  severity: "high" | "moderate" | "safe"
}

interface DeepListModalProps {
  isOpen: boolean
  onClose: () => void
  triggers: TriggerItem[]
  totalCount: number
}

function loadAllergensFromJSON(): TriggerItem[] {
  const items: TriggerItem[] = []

  // Get arrays from the JSON - use empty array as fallback
  const highReactivity = allergensData?.high_reactivity || []
  const moderateReactivity = allergensData?.moderate_reactivity || []
  const noReactivity = allergensData?.no_reactivity || []

  // Add high reactivity items
  for (const item of highReactivity) {
    if (item?.name) {
      items.push({
        name: item.name,
        category: item.category || "High Reactivity",
        severity: "high",
      })
    }
  }

  // Add moderate reactivity items
  for (const item of moderateReactivity) {
    if (item?.name) {
      items.push({
        name: item.name,
        category: item.category || "Moderate Reactivity",
        severity: "moderate",
      })
    }
  }

  // Add no reactivity (safe) items
  for (const item of noReactivity) {
    if (item?.name) {
      items.push({
        name: item.name,
        category: item.category || "Safe",
        severity: "safe",
      })
    }
  }

  return items
}

function matchesSearch(itemName: string, searchQuery: string): boolean {
  if (!itemName || !searchQuery) return false

  // Normalize both strings: lowercase, trim, remove apostrophes
  const normalizedName = itemName.toLowerCase().trim().replace(/[''`]/g, "")
  const normalizedQuery = searchQuery.toLowerCase().trim().replace(/[''`]/g, "")

  // Simple includes check - "cow" finds "Cow's milk" and "Cows milk"
  if (normalizedName.includes(normalizedQuery)) {
    return true
  }

  // Check if all query words appear in name (any order)
  const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 0)
  if (queryWords.length > 0) {
    return queryWords.every((word) => normalizedName.includes(word))
  }

  return false
}

export function DeepListModal({ isOpen, onClose, triggers, totalCount }: DeepListModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<"all" | "high" | "moderate" | "safe">("all")
  const [selectedSensitivity, setSelectedSensitivity] = useState<TriggerItem | null>(null)

  const allItems = useMemo(() => {
    const items = loadAllergensFromJSON()
    return items
  }, [])

  const filteredItems = useMemo(() => {
    let result = allItems

    // Apply severity filter
    if (activeFilter !== "all") {
      result = result.filter((item) => item.severity === activeFilter)
    }

    // Apply search filter using .toLowerCase().includes()
    const query = searchQuery.trim()
    if (query) {
      result = result.filter((item) => matchesSearch(item.name, query))
    }

    // Sort: Red (high) first, then Amber (moderate), then Green (safe), then Unknown last
    result = [...result].sort((a, b) => {
      const severityOrder: Record<string, number> = { high: 0, moderate: 1, safe: 2, unknown: 3 }
      const aSeverity = severityOrder[a.severity] ?? 3
      const bSeverity = severityOrder[b.severity] ?? 3
      if (aSeverity !== bSeverity) return aSeverity - bSeverity
      // Within same severity, sort alphabetically
      return a.name.localeCompare(b.name)
    })

    return result
  }, [allItems, activeFilter, searchQuery])

  // Count items by severity
  const counts = useMemo(
    () => ({
      high: allItems.filter((item) => item.severity === "high").length,
      moderate: allItems.filter((item) => item.severity === "moderate").length,
      safe: allItems.filter((item) => item.severity === "safe").length,
    }),
    [allItems],
  )

  const getSeverityStatus = useCallback((severity: string): "danger" | "warning" | "safe" => {
    if (severity === "high") return "danger"
    if (severity === "moderate") return "warning"
    return "safe"
  }, [])

  const getSeverityIntensity = useCallback((severity: string): "high" | "moderate" | "trace" => {
    if (severity === "high") return "high"
    if (severity === "moderate") return "moderate"
    return "trace"
  }, [])

  const handleItemClick = useCallback((item: TriggerItem) => {
    setSelectedSensitivity(item)
  }, [])

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-lg font-bold">Your Sensitivity List</h2>
              <p className="text-sm text-muted-foreground">Monitoring {allItems.length} items from allergens.json</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-border flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search (e.g. 'cows milk', 'wheat')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {allItems.length === 0 && (
              <div className="mt-2 text-xs text-amber-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                No data loaded from allergens.json
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 mt-3 flex-wrap">
              <Button
                variant={activeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("all")}
                className="text-xs"
              >
                All ({allItems.length})
              </Button>
              <Button
                variant={activeFilter === "high" ? "destructive" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("high")}
                className="text-xs gap-1"
              >
                <StatusDot status="danger" size="sm" />
                Red ({counts.high})
              </Button>
              <Button
                variant={activeFilter === "moderate" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("moderate")}
                className={cn("text-xs gap-1", activeFilter === "moderate" && "bg-warning hover:bg-warning/90")}
              >
                <StatusDot status="warning" size="sm" />
                Orange ({counts.moderate})
              </Button>
              <Button
                variant={activeFilter === "safe" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("safe")}
                className={cn("text-xs gap-1", activeFilter === "safe" && "bg-success hover:bg-success/90")}
              >
                <StatusDot status="safe" size="sm" />
                Safe ({counts.safe})
              </Button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4">
            {searchQuery.trim() && (
              <p className="text-xs text-muted-foreground mb-3">
                Found {filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""} for "{searchQuery}"
              </p>
            )}

            <div className="space-y-2">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  {searchQuery.trim() ? (
                    <>
                      <p>No items found for "{searchQuery}"</p>
                      <p className="text-xs mt-1">Try different spelling</p>
                    </>
                  ) : (
                    <>
                      <p>No items in this category</p>
                    </>
                  )}
                </div>
              ) : (
                filteredItems.slice(0, 100).map((item, index) => (
                  <button
                    key={`${item.name}-${index}`}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg border text-left",
                      "transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]",
                      item.severity === "high"
                        ? "bg-destructive/5 border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40"
                        : item.severity === "moderate"
                          ? "bg-warning/5 border-warning/20 hover:bg-warning/10 hover:border-warning/40"
                          : "bg-success/5 border-success/20 hover:bg-success/10 hover:border-success/40",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <StatusDot status={getSeverityStatus(item.severity)} size="md" />
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                    {(item.severity === "high" || item.severity === "moderate") && (
                      <IntensityBar intensity={getSeverityIntensity(item.severity)} />
                    )}
                  </button>
                ))
              )}
              {filteredItems.length > 100 && (
                <p className="text-xs text-center text-muted-foreground py-2">
                  Showing first 100 results. Use search to narrow down.
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border text-xs text-muted-foreground text-center flex-shrink-0">
            <p>Tap any item for detailed information</p>
          </div>
        </div>
      </div>

      <SensitivityDetailModal
        isOpen={!!selectedSensitivity}
        onClose={() => setSelectedSensitivity(null)}
        sensitivity={selectedSensitivity}
      />
    </>
  )
}
