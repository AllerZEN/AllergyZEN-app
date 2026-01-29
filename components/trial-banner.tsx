"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Crown, Clock, X, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { SubscriptionTier } from "@/lib/subscription"

interface TrialBannerProps {
  onUpgradeClick: () => void
}

export function TrialBanner({ onUpgradeClick }: TrialBannerProps) {
  const [tier, setTier] = useState<SubscriptionTier | null>(null)
  const [daysRemaining, setDaysRemaining] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    import("@/lib/subscription").then(({ getSubscription, getTrialDaysRemaining }) => {
      const sub = getSubscription()
      setTier(sub.tier)
      setDaysRemaining(getTrialDaysRemaining())
    })
  }, [])

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted || tier === null) return null
  if (dismissed || tier === "pro") return null

  // Trial banner
  if (tier === "trial" && daysRemaining > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-emerald-500/20 border border-primary/30 p-3"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/20">
              <Crown className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">Free Trial Active</p>
                <Badge variant="secondary" className="bg-primary/20 text-primary text-xs gap-1">
                  <Clock className="w-3 h-3" />
                  {daysRemaining} {daysRemaining === 1 ? "day" : "days"} left
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Enjoy unlimited Zen Pro features!</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setDismissed(true)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    )
  }

  // Freemium banner
  if (tier === "freemium") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-amber-500/20 border border-amber-500/30 p-3"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-500/20">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">Trial Ended</p>
              <p className="text-xs text-muted-foreground">Upgrade to Zen Pro for unlimited scans</p>
            </div>
          </div>
          <Button size="sm" className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white" onClick={onUpgradeClick}>
            Upgrade
          </Button>
        </div>
      </motion.div>
    )
  }

  return null
}
