"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Heart, Utensils, Droplets, Layers, Plus, X,
  FileText, CheckCircle2, Thermometer, Palette,
  Scale, Blend, ShieldCheck, Timer
} from "lucide-react"
import { cn } from "@/lib/utils"
import userProfile, { type BoundaryPreferences } from "@/lib/profile"

export function BoundariesPanel() {
  const [boundaries, setBoundaries] = useState<BoundaryPreferences>({
    softTextures: false,
    noSaltSauce: false,
    deconstructed: false,
    deconstructedNotes: "",
    temperatureSensitive: false,
    temperaturePreference: "",
    singleColorMeals: false,
    singleColorPreference: "",
    noMixedTextures: false,
    specificPortions: false,
    portionNotes: "",
    customNotes: []
  })
  const [newNote, setNewNote] = useState("")
  const [saved, setSaved] = useState(false)
  const [handshakeActive, setHandshakeActive] = useState(false)

  useEffect(() => {
    const profile = userProfile.getActiveProfile()
    if (profile?.boundaries) {
      setBoundaries(profile.boundaries)
    }
    setHandshakeActive(userProfile.isProtectionActive())
    
    const interval = setInterval(() => {
      setHandshakeActive(userProfile.isProtectionActive())
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const updateBoundary = <K extends keyof BoundaryPreferences>(
    key: K, 
    value: BoundaryPreferences[K]
  ) => {
    const updated = { ...boundaries, [key]: value }
    setBoundaries(updated)
    userProfile.updateBoundaries(userProfile.session.activeProfileIndex, updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const activeCount = [
    boundaries.softTextures, boundaries.noSaltSauce,
    boundaries.deconstructed, boundaries.temperatureSensitive,
    boundaries.singleColorMeals, boundaries.noMixedTextures,
    boundaries.specificPortions, boundaries.customNotes.length > 0
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Handshake Quick-Action (Bulletproof Requirement) */}
      {!handshakeActive && activeCount > 0 && (
        <Card className="border-blue-500 border-2 bg-blue-50 animate-in fade-in slide-in-from-top-4">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-full">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-blue-900 leading-tight">Activate Protection</p>
                <p className="text-[10px] font-bold text-blue-600 uppercase">Ready for Business Scan</p>
              </div>
            </div>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
              onClick={() => {
                userProfile.startHandshake(180) // Standard 3-hour handshake
                window.dispatchEvent(new Event('themeChanged'))
              }}
            >
              Start Handshake
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-100 shadow-xl rounded-[2rem] overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
              <Heart className="w-6 h-6 fill-white" />
              BLUE SHIELD
            </h2>
            <Badge className="bg-white/20 text-white border-none">{activeCount} Set</Badge>
          </div>
          <p className="text-xs font-bold opacity-80 uppercase tracking-widest leading-relaxed">
            Define your sensory & ED boundaries for a shame-free dining experience.
          </p>
        </div>

        <CardContent className="p-6 space-y-4">
          {/* SENSORY TOGGLES */}
          <div className="grid gap-3">
            {[
              { id: "softTextures", label: "Soft Textures Only", icon: Utensils, sub: "No crunchy or hard items" },
              { id: "noSaltSauce", label: "No Salt or Sauce", icon: Droplets, sub: "Seasonings on side only" },
              { id: "deconstructed", label: "Deconstructed", icon: Layers, sub: "Serve components separately" },
              { id: "noMixedTextures", label: "Uniform Texture", icon: Blend, sub: "No chunks or mixed consistency" }
            ].map((item) => (
              <div key={item.id} className={cn(
                "flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer",
                boundaries[item.id as keyof BoundaryPreferences] ? "border-blue-500 bg-blue-50" : "border-slate-50 bg-slate-50/50"
              )}
              onClick={() => updateBoundary(item.id as any, !boundaries[item.id as keyof BoundaryPreferences])}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5", boundaries[item.id as keyof BoundaryPreferences] ? "text-blue-600" : "text-slate-400")} />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{item.label}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.sub}</p>
                  </div>
                </div>
                <Switch 
                  checked={!!boundaries[item.id as keyof BoundaryPreferences]} 
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            ))}
          </div>

          {/* DECONSTRUCTION NOTES */}
          {boundaries.deconstructed && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-blue-600 ml-1">Deconstruction Instructions</Label>
              <Textarea
                placeholder="e.g. Please put the pasta, sauce, and cheese in three separate bowls."
                value={boundaries.deconstructedNotes}
                onChange={(e) => updateBoundary("deconstructedNotes", e.target.value)}
                className="rounded-xl border-blue-100 focus:ring-blue-500 min-h-[80px]"
              />
            </motion.div>
          )}

          {/* PREVIEW TICKET (The 'Business View' Bridge) */}
          {activeCount > 0 && (
            <div className="mt-6 p-5 rounded-[1.5rem] bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck className="w-12 h-12" />
              </div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3">Kitchen Ticket Preview</p>
              <div className="space-y-2 font-mono text-xs uppercase tracking-wider">
                {boundaries.softTextures && <p className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-blue-400" /> Soft Textures Only</p>}
                {boundaries.noSaltSauce && <p className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-blue-400" /> No Salt / No Sauce</p>}
                {boundaries.deconstructed && (
                  <div className="bg-white/10 p-2 rounded">
                    <p className="text-blue-300 mb-1">DECONSTRUCT MEAL:</p>
                    <p className="text-[10px] normal-case italic">{boundaries.deconstructedNotes || "Components separate"}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
