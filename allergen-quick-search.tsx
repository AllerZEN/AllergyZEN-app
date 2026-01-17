"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { StatusDot } from "./status-dot"
import allergensData from "@/allergens.json"

interface AllergenItem {
  name: string
  category: string
}

interface SearchResult {
  name: string
  category: string
  severity: "high" | "moderate" | "safe"
}

const allAllergens: SearchResult[] = []

// Add high reactivity items
if (allergensData.high_reactivity && Array.isArray(allergensData.high_reactivity)) {
  allergensData.high_reactivity.forEach((item: AllergenItem) => {
    if (item && item.name) {
      allAllergens.push({
        name: item.name,
        category: item.category || "Food",
        severity: "high",
      })
    }
  })
}

// Add moderate reactivity items
if (allergensData.moderate_reactivity && Array.isArray(allergensData.moderate_reactivity)) {
  allergensData.moderate_reactivity.forEach((item: AllergenItem) => {
    if (item && item.name) {
      allAllergens.push({
        name: item.name,
        category: item.category || "Food",
        severity: "moderate",
      })
    }
  })
}

// Add no reactivity items
if (allergensData.no_reactivity && Array.isArray(allergensData.no_reactivity)) {
  allergensData.no_reactivity.forEach((item: AllergenItem) => {
    if (item && item.name) {
      allAllergens.push({
        name: item.name,
        category: item.category || "Food",
        severity: "safe",
      })
    }
  })
}

console.log("[v0] Total allergens loaded:", allAllergens.length)

interface AllergenQuickSearchProps {
  onSelectItem?: (item: SearchResult) => void
  placeholder?: string
}

export function AllergenQuickSearch({
  onSelectItem,
  placeholder = "Search your allergens...",
}: AllergenQuickSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!mounted || !query.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }

    // Normalize query: lowercase, trim, remove apostrophes
    const normalizedQuery = query
      .toLowerCase()
      .trim()
      .replace(/['`'"]/g, "")

    console.log("[v0] Searching for:", normalizedQuery, "in", allAllergens.length, "items")

    // Filter items where item.name includes the search query
    const filtered = allAllergens.filter((item) => {
      const normalizedName = item.name
        .toLowerCase()
        .trim()
        .replace(/['`'"]/g, "")
      return normalizedName.includes(normalizedQuery)
    })

    console.log("[v0] Found", filtered.length, "matches")

    // Sort: high severity first, then moderate, then safe
    filtered.sort((a, b) => {
      const severityOrder = { high: 0, moderate: 1, safe: 2 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    })

    setResults(filtered.slice(0, 20))
    setIsOpen(filtered.length > 0)
  }, [query, mounted])

  const handleSelect = (item: SearchResult) => {
    onSelectItem?.(item)
    setQuery("")
    setIsOpen(false)
  }

  const getSeverityColor = (severity: "high" | "moderate" | "safe") => {
    switch (severity) {
      case "high":
        return "bg-destructive/10 border-destructive/30 text-destructive"
      case "moderate":
        return "bg-warning/10 border-warning/30 text-warning"
      case "safe":
        return "bg-success/10 border-success/30 text-success"
    }
  }

  const getSeverityStatus = (severity: "high" | "moderate" | "safe"): "danger" | "warning" | "safe" => {
    switch (severity) {
      case "high":
        return "danger"
      case "moderate":
        return "warning"
      case "safe":
        return "safe"
    }
  }

  if (!mounted) return null

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-8 h-10 bg-card/50 border-primary/20 focus:border-primary"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("")
              setResults([])
              setIsOpen(false)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          <div className="p-2 text-xs text-muted-foreground border-b border-border">
            Found {results.length} items matching "{query}"
          </div>
          {results.map((item, index) => (
            <button
              key={`${item.name}-${index}`}
              onClick={() => handleSelect(item)}
              className={cn(
                "w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-accent/50 transition-colors",
                "border-b border-border/50 last:border-b-0",
              )}
            >
              <StatusDot status={getSeverityStatus(item.severity)} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground truncate">{item.category}</p>
              </div>
              <Badge variant="outline" className={cn("text-xs shrink-0", getSeverityColor(item.severity))}>
                {item.severity === "high" ? "Red" : item.severity === "moderate" ? "Orange" : "Green"}
              </Badge>
            </button>
          ))}
        </div>
      )}

      {query.length > 0 && results.length === 0 && mounted && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">No items found for "{query}"</p>
          <p className="text-xs text-muted-foreground mt-1">Searched {allAllergens.length} items</p>
        </div>
      )}
    </div>
  )
}
