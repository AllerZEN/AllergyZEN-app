"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Droplets, Wind, ThermometerSnowflake, Clock, Pill, 
  Phone, Heart, ArrowLeft, ShieldAlert, Sparkles 
} from "lucide-react"

// FIX: Added 'default' and 'onBack' prop for dashboard navigation
export default function EmergencyButton({ onBack }: { onBack?: () => void }) {
  const [open, setOpen] = useState(false)

  const steps = [
    {
      icon: ThermometerSnowflake,
      title: "Cool Down",
      description: "Apply a cold compress or take a cool shower to reduce inflammation immediately.",
    },
    {
      icon: Droplets,
      title: "Skin Crisis Protocol",
      description: "Apply fragrance-free, hypoallergenic moisturizer to damp skin. Avoid all 'Modern Materials' textiles.",
    },
    {
      icon: Wind,
      title: "Fiber Shift",
      description: "Switch to loose, 100% organic cotton. Avoid synthetic PLA or luxury animal fibers for now.",
    },
    {
      icon: Pill,
      title: "Medication",
      description: "Consider your prescribed oral antihistamine if symptoms persist beyond 15 minutes.",
    },
    {
      icon: Clock,
      title: "The 24-Hour Audit",
      description: "Note new detergents, wood dusts, or fermented foods (Kimchi/Natto) consumed recently.",
    },
  ]

  return (
    <div className="min-h-screen bg-white p-4 space-y-6">
      {/* Navigation - Only shows if onBack is provided */}
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest mb-4 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      )}

      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-red-50 text-red-600 mb-2">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>
        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">
          Emergency <span className="text-red-600">Relief</span>
        </h1>
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-gray-400">Skin Crisis & Reaction Support</p>
      </div>

      <div className="grid gap-3">
        {steps.map((step, index) => (
          <Card key={index} className="border-none shadow-sm bg-slate-50 rounded-[24px] overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                  <step.icon className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight">
                    {index + 1}. {step.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-600 rounded-[32px] border-none shadow-lg text-white mt-4">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Medical Alert</p>
              <p className="text-sm font-bold leading-tight">
                Seek immediate help if you have difficulty breathing or severe swelling.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="py-6 text-center">
        <p className="text-[10px] font-black uppercase tracking-[.3em] text-gray-300">
          You are safe • You are prepared • You have this
        </p>
      </div>
    </div>
  )
}
