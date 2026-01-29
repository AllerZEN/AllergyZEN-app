"use client"

import { AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { getSymptomInsight, getSymptomInsightByAllergen, type SymptomInsight } from "@/lib/symptom-insights"

interface SymptomInsightProps {
  ingredient?: string
  allergen?: string
  className?: string
}

export function SymptomInsightDisplay({ ingredient, allergen, className }: SymptomInsightProps) {
  let insight: SymptomInsight | null = null

  if (ingredient) {
    insight = getSymptomInsight(ingredient)
  } else if (allergen) {
    insight = getSymptomInsightByAllergen(allergen)
  }

  if (!insight) return null

  const isRed = insight.severity === "red"

  return (
    <div
      className={cn(
        "flex items-start gap-2 mt-1 p-2 rounded-md text-xs",
        isRed
          ? "bg-destructive/10 text-destructive border border-destructive/20"
          : "bg-warning/10 text-warning border border-warning/20",
        className,
      )}
    >
      {isRed ? (
        <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
      ) : (
        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
      )}
      <div>
        <p className="font-medium">Why? {insight.trigger}</p>
        <p className="opacity-90">{insight.description}</p>
      </div>
    </div>
  )
}

// Compact inline version for scan results
export function SymptomBadge({ ingredient, allergen }: SymptomInsightProps) {
  let insight: SymptomInsight | null = null

  if (ingredient) {
    insight = getSymptomInsight(ingredient)
  } else if (allergen) {
    insight = getSymptomInsightByAllergen(allergen)
  }

  if (!insight) return null

  const isRed = insight.severity === "red"

  return (
    <span className={cn("text-[10px] block mt-0.5 italic", isRed ? "text-destructive/80" : "text-warning/80")}>
      {insight.description}
    </span>
  )
}
