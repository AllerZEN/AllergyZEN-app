"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, AlertTriangle, Loader2, X, Sparkles, Lock, HelpCircle, ArrowRightCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { StatusDot } from "@/components/status-dot"
import { IntensityBar, type IntensityLevel } from "@/components/intensity-bar"
import userProfile from "@/lib/profile"

interface ScreeningResult {
  product: {
    name: string;
    brand: string;
    image?: string;
    ingredients: string[];
  };
  status: "safe" | "danger" | "warning" | "brown" | "unknown";
  redFlags: { ingredient: string; allergen: string; intensity: string }[];
  yellowFlags: { ingredient: string; reason: string }[];
  fragranceWarning: boolean;
}

export function BrandSearch({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<ScreeningResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const handleSearch = async () => {
    if (!query.trim()) return
    setIsSearching(true)
    setError(null)
    setResults([])

    try {
      // Pull latest triggers from our mirrored lib/profile
      const activeProfile = userProfile.getActiveProfile()
      const userTriggers = activeProfile?.allergies || []

      const response = await fetch("/api/search-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), userTriggers }),
      })

      if (!response.ok) throw new Error("Search failed")
      const data = await response.json()
      
      setResults(data.results)
      
      // Auto-scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    } catch {
      setError("Search unavailable. Please check your connection.")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Gateway */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[var(--profile-theme)] transition-colors" />
        <Input
          placeholder="Search brand, product or E-number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="pl-12 pr-28 h-14 bg-white border-2 border-slate-100 rounded-2xl shadow-sm focus:border-[var(--profile-theme)] transition-all"
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--profile-theme)] hover:opacity-90 rounded-xl h-10 px-6"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
        </Button>
      </div>

      <div ref={resultsRef} className="space-y-4">
        <AnimatePresence>
          {results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden"
            >
              <Card className={cn(
                "border-2 transition-all shadow-md",
                result.status === "safe" ? "border-green-100" : 
                result.status === "danger" ? "border-red-100" : "border-orange-100"
              )}>
                <CardContent className="p-0">
                  {/* Status Banner */}
                  <div className={cn(
                    "px-4 py-3 flex items-center justify-between border-b-2",
                    result.status === "safe" ? "bg-green-50/50 border-green-50" : 
                    result.status === "danger" ? "bg-red-50/50 border-red-50" : "bg-orange-50/50 border-orange-50"
                  )}>
                    <div className="flex items-center gap-3">
                      <StatusDot 
                        status={result.status === "warning" ? "orange" : result.status as any} 
                        size="md" 
                        pulse={result.status === "danger"} 
                      />
                      <span className="font-black text-sm uppercase tracking-widest">
                        {result.status === "danger" ? "Trigger Found" : result.status === "safe" ? "Clear to Go" : "Caution"}
                      </span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-5">
                    <div className="flex gap-4">
                      {result.product.image && (
                        <img src={result.product.image} className="w-16 h-16 object-contain bg-slate-50 rounded-lg p-1" alt="product" />
                      )}
                      <div>
                        <h3 className="font-bold text-lg leading-tight text-slate-900">{result.product.name}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{result.product.brand}</p>
                      </div>
                    </div>

                    {/* Findings - Red Flags only */}
                    {result.redFlags.length > 0 && (
                      <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100">
                        {result.redFlags.map((flag, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-sm font-bold text-red-700">{flag.ingredient}</span>
                            <Badge variant="destructive" className="text-[10px]">{flag.allergen}</Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* The "Safe Alternative" Logic - Hidden by default per instructions */}
                    {(result.status === "danger" || result.status === "warning") && (
                      <button 
                        onClick={() => onNavigate?.("safe")}
                        className="w-full mt-4 flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all group"
                      >
                        <div className="text-left">
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Action Required</p>
                          <p className="text-sm font-bold">See Safe Alternatives</p>
                        </div>
                        <ArrowRightCircle className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
