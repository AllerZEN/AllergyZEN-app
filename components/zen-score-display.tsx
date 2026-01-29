"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, TrendingUp, Sparkles } from "lucide-react"
import { calculateZenScore, getScoreColor, getScoreBgColor } from "@/lib/zen-score"

export function ZenScoreDisplay() {
  const [scoreData, setScoreData] = useState({
    score: 0,
    safePercentage: 0,
    handshakeBonus: 0,
    status: "moderate" as const,
    message: "Calculating..."
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const updateScore = () => {
      setScoreData(calculateZenScore())
    }
    
    updateScore()
    const interval = setInterval(updateScore, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="animate-pulse h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <div 
            className={`absolute inset-0 opacity-10 ${getScoreBgColor(scoreData.status)}`}
          />
          <div className="relative p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${getScoreBgColor(scoreData.status)} text-white shadow-lg`}>
                  <span className="text-xl font-bold">{scoreData.score}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    Zen Score
                    {scoreData.handshakeBonus > 0 && (
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">{scoreData.message}</p>
                </div>
              </div>
              <Shield className={`w-8 h-8 ${getScoreColor(scoreData.status)}`} />
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Protection Level</span>
                <span className={`font-medium capitalize ${getScoreColor(scoreData.status)}`}>
                  {scoreData.status.replace("-", " ")}
                </span>
              </div>
              
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${getScoreBgColor(scoreData.status)}`}
                  style={{ width: `${scoreData.score}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Base: {scoreData.safePercentage}%</span>
                {scoreData.handshakeBonus > 0 && (
                  <span className="flex items-center gap-1 text-primary">
                    <TrendingUp className="w-3 h-3" />
                    +{scoreData.handshakeBonus}% Handshake Bonus
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
