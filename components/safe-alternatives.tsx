"use client"

import { motion } from "framer-motion"
import { ShieldCheck, ExternalLink, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAlternativesForProduct, detectProductCategory } from "@/lib/safe-alternatives"

interface SafeAlternativesProps {
  productName: string
  ingredients?: string[]
  status: "danger" | "warning" | "caution" | "safe"
  onAlternativeClick?: (alternativeName: string) => void
}

export function SafeAlternatives({ productName, ingredients = [], status, onAlternativeClick }: SafeAlternativesProps) {
  if (status === "safe") {
    return null
  }

  const category = detectProductCategory(productName, ingredients)
  const alternatives = getAlternativesForProduct(productName, category)

  if (alternatives.length === 0) {
    return null
  }

  const handleClick = (alt: { name: string; brand: string; purchaseUrl?: string }) => {
    onAlternativeClick?.(`${alt.brand} ${alt.name}`)
    if (alt.purchaseUrl) {
      window.open(alt.purchaseUrl, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="border-success/30 bg-success/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-success text-lg">
            <ShieldCheck className="w-5 h-5" />
            Safe Alternatives
          </CardTitle>
          <p className="text-sm text-muted-foreground">Try these safer options that avoid your triggers</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {alternatives.map((alt, index) => (
            <motion.div
              key={`${alt.brand}-${alt.name}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="bg-card/50 border-success/20 hover:border-success/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Product Image Placeholder */}
                    <div className="w-16 h-16 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-success" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-foreground leading-tight">{alt.name}</h4>
                          <p className="text-sm text-muted-foreground">{alt.brand}</p>
                        </div>
                        <Badge variant="outline" className="border-success/50 text-success text-xs flex-shrink-0">
                          Safe
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{alt.description}</p>

                      <div className="mt-2 p-2 rounded bg-success/10 border border-success/20">
                        <p className="text-xs text-success">
                          <span className="font-semibold">Why it&apos;s safe:</span> {alt.whyItsSafe}
                        </p>
                      </div>

                      {alt.purchaseUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 h-8 text-xs border-success/30 text-success hover:bg-success/10 bg-transparent"
                          onClick={() => handleClick(alt)}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Where to Buy
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}
