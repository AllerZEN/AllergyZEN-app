"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Droplets, Wind, ThermometerSnowflake, Clock, Pill, Phone, Heart } from "lucide-react"

export function EmergencyButton() {
  const [open, setOpen] = useState(false)

  const steps = [
    {
      icon: ThermometerSnowflake,
      title: "Cool Down",
      description: "Apply a cold compress or take a cool shower to reduce inflammation",
    },
    {
      icon: Droplets,
      title: "Moisturize",
      description: "Apply fragrance-free, hypoallergenic moisturizer to damp skin",
    },
    {
      icon: Wind,
      title: "Loose Clothing",
      description: "Wear loose, 100% cotton clothing. Avoid synthetic fabrics",
    },
    {
      icon: Pill,
      title: "Medication",
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
      {/* Static, non-floating emergency button at top of dashboard */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-3">
          <Button
            onClick={() => setOpen(true)}
            variant="outline"
            className="w-full gap-2 h-12 border-amber-500/50 hover:bg-amber-500/10 hover:border-amber-500 text-amber-700 dark:text-amber-400"
          >
            <Heart className="w-5 h-5" />
            <span className="font-medium">Emergency Relief Guide</span>
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Heart className="w-5 h-5" />
              Relief Guide
            </DialogTitle>
            <DialogDescription>
              Calming steps for when you need support
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <Card key={index} className="bg-card border-border">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
                      <step.icon className="w-4 h-4 text-amber-600" />
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

          <Card className="bg-blue-500/10 border-blue-500/30 mt-2">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500" />
                <p className="text-xs">
                  <strong>Seek medical help</strong> if you experience difficulty breathing, swelling, or severe symptoms.
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-center text-muted-foreground mt-2">
            You are safe. You are prepared. You have this.
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
