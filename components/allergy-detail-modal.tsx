"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertTriangle, EyeOff, Leaf, Sparkles } from "lucide-react"
import { type Allergen, getSafeAlternativesFor } from "@/lib/allergen-data"

interface AllergyDetailModalProps {
  allergen: Allergen | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface AllergenInfo {
  description: string
  hiddenSources: string[]
  safeAlternatives: string[]
}

export function AllergyDetailModal({ allergen, open, onOpenChange }: AllergyDetailModalProps) {
  const [info, setInfo] = useState<AllergenInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (allergen && open) {
      generateAllergenInfo()
    }
  }, [allergen, open])

  async function generateAllergenInfo() {
    if (!allergen) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/allergen-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allergenName: allergen.name, category: allergen.category }),
      })

      if (!response.ok) throw new Error("Failed to generate info")

      const data = await response.json()
      setInfo(data)
    } catch (err) {
      setError("Unable to load allergen details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const localAlternatives = allergen ? getSafeAlternativesFor(allergen.id) : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            {allergen?.name}
          </DialogTitle>
          <DialogDescription>
            <Badge variant="destructive" className="mt-1">
              {allergen?.category} - Red Tier
            </Badge>
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating allergen details with AI...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-4">
            <p className="text-destructive text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={generateAllergenInfo} className="mt-2 bg-transparent">
              Retry
            </Button>
          </div>
        )}

        {info && !loading && (
          <div className="space-y-4">
            <Card className="bg-card/50 border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <h4 className="font-medium text-sm">What is it?</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{info.description}</p>
              </CardContent>
            </Card>

            <Card className="bg-warning/5 border-warning/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2 mb-2">
                  <EyeOff className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                  <h4 className="font-medium text-sm">Hidden Sources</h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {info.hiddenSources.map((source) => (
                    <Badge key={source} variant="outline" className="text-xs border-warning/30 text-warning">
                      {source}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-success/5 border-success/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2 mb-2">
                  <Leaf className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  <h4 className="font-medium text-sm">Safe Alternatives</h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {info.safeAlternatives.map((alt) => (
                    <Badge key={alt} variant="outline" className="text-xs border-success/30 text-success">
                      {alt}
                    </Badge>
                  ))}
                  {localAlternatives.map((alt) => (
                    <Badge key={alt.id} className="text-xs bg-success/20 text-success border-0">
                      {alt.name} ★
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {allergen?.aliases && allergen.aliases.length > 0 && (
              <div>
                <h4 className="text-xs text-muted-foreground mb-2">Also known as:</h4>
                <div className="flex flex-wrap gap-1">
                  {allergen.aliases.map((alias) => (
                    <Badge key={alias} variant="secondary" className="text-xs">
                      {alias}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
