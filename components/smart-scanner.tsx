"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Scan, Utensils, Shirt, Sparkles, AlertTriangle, CheckCircle2, X, ChevronRight, Leaf } from "lucide-react"
import { checkIngredient, getSafeAlternativesFor, type Allergen } from "@/lib/allergen-data"
import { cn } from "@/lib/utils"
import { CameraScanner } from "@/components/camera-scanner"

type ScanMode = "food" | "clothing" | "cleaning"

interface ScanResult {
  ingredient: string
  safe: boolean
  matches: Allergen[]
  warnings: string[]
}

export function SmartScanner() {
  const [mode, setMode] = useState<ScanMode>("food")
  const [input, setInput] = useState("")
  const [results, setResults] = useState<ScanResult[]>([])
  const [isScanning, setIsScanning] = useState(false)

  const modes = [
    { id: "food" as const, label: "Food", icon: Utensils, hint: "Enter ingredients (comma separated)" },
    { id: "clothing" as const, label: "Clothing", icon: Shirt, hint: "Enter fabric composition & labels" },
    { id: "cleaning" as const, label: "Cleaning", icon: Sparkles, hint: "Enter product ingredients" },
  ]

  const handleScan = () => {
    if (!input.trim()) return

    setIsScanning(true)

    // Simulate scanning delay
    setTimeout(() => {
      const ingredients = input
        .split(/[,\n]/)
        .map((i) => i.trim())
        .filter(Boolean)
      const scanResults: ScanResult[] = ingredients.map((ingredient) => ({
        ingredient,
        ...checkIngredient(ingredient),
      }))

      setResults(scanResults)
      setIsScanning(false)
    }, 800)
  }

  const clearResults = () => {
    setResults([])
    setInput("")
  }

  const safeCount = results.filter((r) => r.safe).length
  const unsafeCount = results.filter((r) => !r.safe).length

  return (
    <div className="space-y-4">
      <CameraScanner />

      {/* Mode Selector */}
      <Card className="bg-card/50 backdrop-blur border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scan className="w-5 h-5 text-primary" />
            Manual Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Tabs */}
          <div className="flex gap-2">
            {modes.map((m) => (
              <Button
                key={m.id}
                variant={mode === m.id ? "default" : "secondary"}
                size="sm"
                onClick={() => {
                  setMode(m.id)
                  clearResults()
                }}
                className="flex-1"
              >
                <m.icon className="w-4 h-4 mr-1" />
                {m.label}
              </Button>
            ))}
          </div>

          {/* Input Area */}
          <div className="space-y-2">
            <Textarea
              placeholder={modes.find((m) => m.id === mode)?.hint}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-24 bg-background/50 resize-none"
            />
            <div className="flex gap-2">
              <Button onClick={handleScan} disabled={!input.trim() || isScanning} className="flex-1">
                {isScanning ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <Scan className="w-4 h-4 mr-2" />
                    </motion.div>
                    Scanning...
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4 mr-2" />
                    Scan {mode === "food" ? "Ingredients" : mode === "clothing" ? "Labels" : "Product"}
                  </>
                )}
              </Button>
              {results.length > 0 && (
                <Button variant="outline" size="icon" onClick={clearResults}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence mode="wait">
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            {/* Summary */}
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <span className="font-medium">{safeCount} Safe</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      <span className="font-medium">{unsafeCount} Flagged</span>
                    </div>
                  </div>
                  <Badge variant={unsafeCount === 0 ? "default" : "destructive"}>
                    {unsafeCount === 0 ? "All Clear" : "Caution"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Individual Results */}
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={cn(
                    "bg-card/50 backdrop-blur",
                    result.safe ? "border-success/30" : "border-destructive/30",
                  )}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {result.safe ? (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                          )}
                          <span className="font-medium capitalize">{result.ingredient}</span>
                        </div>

                        {/* Matched allergens */}
                        {result.matches.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 ml-7">
                            {result.matches.map((match) => (
                              <Badge key={match.id} variant="destructive" className="text-xs">
                                {match.name}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Warnings */}
                        {result.warnings.length > 0 && (
                          <div className="ml-7 space-y-1">
                            {result.warnings.map((warning, i) => (
                              <p key={i} className="text-xs text-warning flex items-center gap-1">
                                <ChevronRight className="w-3 h-3" />
                                {warning}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Safe Alternatives */}
                        {result.matches.length > 0 && (
                          <div className="ml-7 pt-2">
                            {result.matches
                              .flatMap((match) => getSafeAlternativesFor(match.id))
                              .slice(0, 2)
                              .map((alt) => (
                                <div key={alt.id} className="flex items-center gap-2 text-xs text-success">
                                  <Leaf className="w-3 h-3" />
                                  <span>
                                    Try: <span className="font-medium">{alt.name}</span>
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
