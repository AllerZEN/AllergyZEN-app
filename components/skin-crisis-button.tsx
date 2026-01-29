"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Droplets, Wind, ThermometerSnowflake, Clock, Pill, Phone, ShieldAlert } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useWellnessStore } from "@/lib/wellness-store"

export function SkinCrisisButton() {
  const [open, setOpen] = useState(false)
  const {
    skinCrisisFlashing,
    brandShieldAlert,
    clearBrandShieldAlert,
    lastScanResult,
    skinCrisisMode,
    toggleSkinCrisisMode,
  } = useWellnessStore()

  useEffect(() => {
    if (brandShieldAlert && skinCrisisFlashing) {
      if (
        lastScanResult?.productType === "cleaning" ||
        lastScanResult?.productType === "beauty" ||
        lastScanResult?.productType === "clothing"
      ) {
        setOpen(true)
      }
    }
  }, [brandShieldAlert, skinCrisisFlashing, lastScanResult])

  const steps = [
    {
      icon: ThermometerSnowflake,
      title: "Cool Down",
      description: "Apply a cold compress or take a cool (not cold) shower to reduce inflammation",
    },
    {
      icon: Droplets,
      title: "Moisturize",
      description: "Apply fragrance-free, hypoallergenic moisturizer to damp skin",
    },
    {
      icon: Wind,
      title: "Loose Clothing",
      description: "Wear loose, 100% cotton clothing. Avoid polyester and piqué fabrics",
    },
    {
      icon: Pill,
      title: "Antihistamine",
      description: "Consider taking an oral antihistamine if symptoms persist",
    },
    {
      icon: Clock,
      title: "Track It",
      description: "Note what you ate, touched, or wore in the last 24 hours",
    },
  ]

  return (
    <>
      <motion.div
        initial={{ scale: 1 }}
        animate={{
          scale: skinCrisisFlashing ? [1, 1.05, 1] : [1, 1.02, 1],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: skinCrisisFlashing ? 0.5 : 2,
          ease: "easeInOut",
        }}
        className={cn(skinCrisisFlashing && "flash-alert")}
      >
        <Button
          onClick={() => {
            setOpen(true)
            clearBrandShieldAlert()
          }}
          variant="destructive"
          size="lg"
          className={cn(
            "w-full gap-2 h-14 text-base font-semibold shadow-lg",
            skinCrisisFlashing
              ? "shadow-destructive/50 ring-2 ring-destructive ring-offset-2 ring-offset-background"
              : skinCrisisMode
                ? "shadow-destructive/50 ring-2 ring-orange-500 ring-offset-2 ring-offset-background"
                : "shadow-destructive/25",
          )}
        >
          <AlertTriangle className="w-5 h-5" />
          {skinCrisisFlashing
            ? "⚠️ BRAND SHIELD ALERT ⚠️"
            : skinCrisisMode
              ? "🔴 Skin Crisis Mode ON"
              : "Skin Crisis Mode"}
        </Button>
      </motion.div>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen)
          if (!isOpen) clearBrandShieldAlert()
        }}
      >
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              {brandShieldAlert ? "Brand Shield Alert!" : "Skin Crisis Relief"}
            </DialogTitle>
            <DialogDescription>
              {brandShieldAlert && lastScanResult
                ? `"${lastScanResult.productName}" contains ${lastScanResult.redFlags.length} trigger ingredient(s)!`
                : "Quick relief steps for when you're experiencing a flare-up"}
            </DialogDescription>
          </DialogHeader>

          <Card className="bg-orange-500/10 border-orange-500/30 mb-3">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-orange-500" />
                  <div>
                    <Label htmlFor="crisis-mode" className="font-semibold text-orange-600 dark:text-orange-400">
                      Skin Crisis Mode
                    </Label>
                    <p className="text-xs text-muted-foreground">Elevate all caution items to danger</p>
                  </div>
                </div>
                <Switch
                  id="crisis-mode"
                  checked={skinCrisisMode}
                  onCheckedChange={toggleSkinCrisisMode}
                  className="data-[state=checked]:bg-orange-500"
                />
              </div>
            </CardContent>
          </Card>

          {brandShieldAlert && lastScanResult && lastScanResult.redFlags.length > 0 && (
            <Card className="bg-destructive/10 border-destructive/30 mb-3">
              <CardContent className="pt-3 pb-3">
                <p className="text-sm font-semibold text-destructive mb-2">Triggers Detected:</p>
                <div className="flex flex-wrap gap-1">
                  {lastScanResult.redFlags.map((flag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-destructive/20 text-destructive text-xs rounded-full">
                      {flag.ingredient}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {steps.map((step, index) => (
              <Card key={index} className="bg-card border-destructive/20">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-destructive/10 shrink-0">
                      <step.icon className="w-4 h-4 text-destructive" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-0.5">
                        {index + 1}. {step.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-warning/10 border-warning/30 mt-2">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-warning" />
                <p className="text-xs">
                  <strong>Seek medical help</strong> if you experience difficulty breathing, swelling of face/throat, or
                  severe widespread hives.
                </p>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  )
}
