"use client"

import { AlertCircle, Info, Heart, ShieldAlert, Zap, Brain, MessageSquareQuote } from "lucide-react"
import { cn } from "@/lib/utils"
import { getSymptomInsight, type SymptomInsight } from "@/lib/symptom-insights"

interface SymptomInsightProps {
  ingredient?: string
  allergen?: string
  className?: string
}

const spectrumConfig = {
  red: {
    icon: ShieldAlert,
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    label: "Medical Urgency"
  },
  amber: {
    icon: Zap,
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    label: "Reactivity Insight"
  },
  brown: { // Updated from Yellow to Brown per instructions
    icon: Info,
    bg: "bg-stone-50",
    text: "text-stone-700",
    border: "border-stone-200",
    label: "Preference/Dislike"
  },
  blue: {
    icon: Heart,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    label: "Zen Boundary"
  }
}

export function SymptomInsightDisplay({ ingredient, allergen, className }: SymptomInsightProps) {
  // Pulling from your lib using singular symptom naming convention
  const insight: SymptomInsight | null = ingredient 
    ? getSymptomInsight(ingredient) 
    : null; 

  if (!insight) return null

  const config = spectrumConfig[insight.severity as keyof typeof spectrumConfig] || spectrumConfig.brown
  const Icon = config.icon

  return (
    <div className={cn(
      "flex flex-col gap-2 p-4 rounded-2xl border transition-all animate-in fade-in duration-500",
      config.bg,
      config.border,
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg bg-white shadow-sm", config.text)}>
            <Icon className="w-4 h-4" />
          </div>
          <span className={cn("text-[10px] font-black uppercase tracking-widest opacity-60", config.text)}>
            {config.label}
          </span>
        </div>
        {/* Pulsing Dot Indicator for High Risks */}
        {insight.severity === 'red' && (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="font-black text-sm text-gray-900 tracking-tight leading-tight">
          {insight.severity === 'blue' ? "Zen Note: " : "Symptom Trigger: "} {insight.trigger}
        </p>
        <p className="text-xs font-medium opacity-80 leading-relaxed text-gray-700">
          {insight.description}
        </p>
      </div>

      {/* ED/Sensory Support Footer */}
      {insight.severity === 'blue' && (
        <div className="mt-2 pt-2 border-t border-blue-200/50 flex items-center gap-2 italic text-[10px] text-blue-600 font-bold">
          <MessageSquareQuote className="w-3 h-3" />
          <span>Part of your Neutral Environment Pledge.</span>
        </div>
      )}
    </div>
  )
}

/**
 * Compact Version for Scanner Results
 */
export function SymptomBadge({ ingredient, severity = "brown" }: { ingredient: string, severity?: string }) {
  const config = spectrumConfig[severity as keyof typeof spectrumConfig] || spectrumConfig.brown
  
  return (
    <div className="flex items-center gap-1.5 mt-1">
      <div className={cn(
        "w-2 h-2 rounded-full",
        severity === 'red' ? "bg-red-500 animate-pulse" : 
        severity === 'blue' ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" : 
        "bg-current",
        config.text
      )} />
      <span className={cn("text-[10px] font-bold uppercase tracking-tighter opacity-70", config.text)}>
        {ingredient}
      </span>
    </div>
  )
}
