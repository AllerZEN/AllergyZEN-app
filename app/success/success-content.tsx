"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Crown, Check, Sparkles, ArrowRight, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { upgradeToPro } from "@/lib/subscription"
import Link from "next/link"
import confetti from "canvas-confetti"

export function SuccessContent() {
  const [showContent, setShowContent] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    upgradeToPro()

    const sessionId = searchParams.get("session_id")
    if (sessionId) {
      localStorage.setItem("stripe_session_id", sessionId)
    }

    setTimeout(() => setShowContent(true), 300)

    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ["#f59e0b", "#f97316", "#10b981"],
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ["#f59e0b", "#f97316", "#10b981"],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 flex flex-col">
      <header className="p-4">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold">AllergyZEN</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.9 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
          >
            <Crown className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold mb-4"
          >
            Welcome to{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">proZEN</span>!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mb-8"
          >
            Your subscription is now active. Enjoy unlimited access to all premium features.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-primary/20 rounded-2xl p-6 mb-8"
          >
            <h2 className="font-semibold mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Features Unlocked
            </h2>
            <div className="space-y-3 text-left">
              {[
                "Unlimited product scans",
                "Unlimited AI meal suggestions",
                "Priority Brand Shield alerts",
                "Advanced AI-powered alternatives",
                "Early access to new features",
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
            <Link href="/">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                Start Exploring
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-xs text-muted-foreground mt-6"
          >
            Your 7-day free trial has begun. You can manage your subscription anytime in Settings.
          </motion.p>
        </motion.div>
      </div>

      <footer className="p-4 text-center border-t border-border">
        <p className="text-xs text-muted-foreground">© 2026 AllergyZEN. All rights reserved.</p>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs">
          <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
            Privacy
          </Link>
        </div>
      </footer>
    </div>
  )
}
