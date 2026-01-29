"use client"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type IntensityLevel = "high" | "moderate" | "trace"

interface IntensityBarProps {
  intensity: IntensityLevel
  position?: number
  total?: number
  className?: string
}

export function IntensityBar({ intensity, position, total, className }: IntensityBarProps) {
  const bars = intensity === "high" ? 3 : intensity === "moderate" ? 2 : 1

  const intensityLabels = {
    high: "High Intensity - Found in first 3 ingredients",
    moderate: "Moderate Intensity - Found in middle of list",
    trace: "Trace Amount - Found near end of list",
  }

  const intensityColors = {
    high: "bg-destructive",
    moderate: "bg-warning",
    trace: "bg-yellow-400",
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-0.5", className)}>
            {[1, 2, 3].map((bar) => (
              <div
                key={bar}
                className={cn(
                  "w-1 rounded-sm transition-all",
                  bar === 1 ? "h-2" : bar === 2 ? "h-3" : "h-4",
                  bar <= bars ? intensityColors[intensity] : "bg-muted-foreground/20",
                )}
              />
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-semibold text-sm">{intensityLabels[intensity]}</p>
          {position && total && (
            <p className="text-xs text-muted-foreground mt-1">
              Position {position} of {total} ingredients
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
