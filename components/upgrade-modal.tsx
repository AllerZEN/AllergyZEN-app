"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Crown, Check, X, Scan, UtensilsCrossed, Infinity, Shield, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  reason?: "scan_limit" | "meal_limit" | "general"
}

export function UpgradeModal({ isOpen, onClose, reason = "general" }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpgrade = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const origin = window.location.origin

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          successUrl: `${origin}/success`,
          cancelUrl: `${origin}?tab=settings`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (err) {
      console.error("Checkout error:", err)
      setError(err instanceof Error ? err.message : "Failed to start checkout")
      setIsLoading(false)
    }
  }

  const features = [
    { icon: Scan, text: "Unlimited product scans", free: "3/day" },
    { icon: UtensilsCrossed, text: "Unlimited meal suggestions", free: "2/day" },
    { icon: Shield, text: "Priority Brand Shield alerts", free: "Basic" },
    { icon: Sparkles, text: "AI-powered alternatives", free: "Limited" },
  ]

  const reasonMessages = {
    scan_limit: "You've reached your daily scan limit",
    meal_limit: "You've reached your daily meal suggestion limit",
    general: "Unlock the full power of AllergyZEN",
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card border border-primary/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
                <Crown className="w-3 h-3" />
                proZEN
              </Badge>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} disabled={isLoading}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                <Crown className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold mb-2">Upgrade to proZEN</h2>
              <p className="text-sm text-muted-foreground">{reasonMessages[reason]}</p>
            </div>

            {/* Features comparison */}
            <div className="space-y-3 mb-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <feature.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm">{feature.text}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground line-through">{feature.free}</span>
                    <Infinity className="w-4 h-4 text-amber-500" />
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="text-center mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold">£6.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">Includes 7-day free trial</p>
              <p className="text-xs text-muted-foreground mt-1">Cancel anytime</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                {error}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="space-y-2">
              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                onClick={handleUpgrade}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redirecting to Checkout...
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Start Free Trial
                  </>
                )}
              </Button>
              <Button variant="ghost" className="w-full" onClick={onClose} disabled={isLoading}>
                Maybe Later
              </Button>
            </div>

            {/* Trust badge */}
            <p className="text-xs text-center text-muted-foreground mt-4">
              <Check className="w-3 h-3 inline mr-1" />
              Secure payment via Stripe
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
