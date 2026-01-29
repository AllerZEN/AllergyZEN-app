"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AlertTriangle, ShieldCheck, ThumbsDown, Leaf, Heart,
  ChefHat, MapPin, Sparkles, AlertCircle, Eye, Zap,
  BookOpen, ArrowRight, Microscope, Pill
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { AllergenEntry, ZenSpectrumColor } from "@/lib/allergen-database"

interface ItemDetailModalProps {
  isOpen: boolean
  onClose: () => void
  item: AllergenEntry | null
  status: ZenSpectrumColor
  onAddToList?: (item: AllergenEntry, color: ZenSpectrumColor) => void
  onNavigateToSafe?: () => void
}

const statusConfig: Record<ZenSpectrumColor, { 
  label: string; bgClass: string; borderClass: string; textClass: string; icon: React.ReactNode; description: string;
}> = {
  red: {
    label: "Severe Risk",
    bgClass: "bg-red-50",
    borderClass: "border-red-200",
    textClass: "text-red-600",
    icon: <AlertTriangle className="w-5 h-5" />,
    description: "Strict Block: Exposure may cause severe reaction."
  },
  amber: {
    label: "Moderate",
    bgClass: "bg-orange-50",
    borderClass: "border-orange-200",
    textClass: "text-orange-600",
    icon: <AlertCircle className="w-5 h-5" />,
    description: "Caution: Known sensitivity or moderate reactivity."
  },
  brown: {
    label: "Dislike",
    bgClass: "bg-stone-100",
    borderClass: "border-stone-200",
    textClass: "text-stone-700",
    icon: <ThumbsDown className="w-5 h-5" />,
    description: "Preference: Handshake will notify venue of dislike."
  },
  green: {
    label: "Safe",
    bgClass: "bg-green-50",
    borderClass: "border-green-200",
    textClass: "text-green-600",
    icon: <ShieldCheck className="w-5 h-5" />,
    description: "Verified Safe: No known triggers found."
  },
  blue: {
    label: "Zen Boundary",
    bgClass: "bg-blue-50",
    borderClass: "border-blue-200",
    textClass: "text-blue-600",
    icon: <Heart className="w-5 h-5 fill-blue-600" />,
    description: "Sensory/ED: This boundary removes the need for explanation."
  }
}

export function ItemDetailModal({ isOpen, onClose, item, status, onAddToList, onNavigateToSafe }: ItemDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "safety">("info")
  if (!item) return null
  
  const config = statusConfig[status]
  const isMedical = status === "red" || status === "amber"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl p-0">
        {/* Header - Matches Zen Color */}
        <div className={cn("p-6 transition-colors", config.bgClass)}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
              <span className={config.textClass}>{config.icon}</span>
            </div>
            <div>
              <Badge className={cn("mb-1 border-none font-black uppercase text-[10px]", config.textClass, "bg-white")}>
                {config.label}
              </Badge>
              <DialogTitle className="text-2xl font-black text-gray-900 leading-none">{item.name}</DialogTitle>
              <p className="text-xs font-bold text-gray-500 uppercase mt-1 tracking-widest">{item.category}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2 rounded-xl h-12">
              <TabsTrigger value="info" className="font-bold">General Info</TabsTrigger>
              <TabsTrigger value="safety" className="font-bold">
                {isMedical ? "Life-Saving" : "Zen Details"}
              </TabsTrigger>
            </TabsList>
            
            {/* TAB 1: General Info */}
            <TabsContent value="info" className="space-y-4 mt-6">
              {status === "green" ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-green-50/50 border border-green-100 flex gap-3">
                    <Sparkles className="w-5 h-5 text-green-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-green-900">Benefits</h4>
                      <p className="text-xs text-green-800/70">{item.benefits || "Nutrient-rich and verified safe for your profile."}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 leading-relaxed">{config.description}</p>
                  {item.aliases && item.aliases.length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase mb-2">Also Known As:</h4>
                      <div className="flex flex-wrap gap-2">
                        {item.aliases.map((a) => (
                          <Badge key={a} variant="secondary" className="bg-gray-100 text-gray-700 border-none font-bold">
                            {a}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            {/* TAB 2: Safety/Zen Details */}
            <TabsContent value="safety" className="space-y-4 mt-6">
              {isMedical ? (
                <div className="space-y-4">
                  {/* HIDDEN NAMES - CRITICAL FOR MEDICINAL/LAB */}
                  {(item.hiddenNames || item.eNumbers) && (
                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Eye className="w-4 h-4 text-orange-600" />
                        <h4 className="font-bold text-sm text-orange-900 uppercase tracking-tighter">Hidden Identifiers</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.eNumbers?.map(e => <Badge key={e} className="bg-orange-600">{e}</Badge>)}
                        {item.hiddenNames?.map(n => <Badge key={n} variant="outline" className="border-orange-300 text-orange-700">{n}</Badge>)}
                      </div>
                    </div>
                  )}
                  {/* CROSS-CONTAMINATION - LAB SET */}
                  {item.crossContamination && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Microscope className="w-4 h-4 text-red-600" />
                        <h4 className="font-bold text-sm text-red-900 uppercase tracking-tighter">Lab/Cross Exposure</h4>
                      </div>
                      <p className="text-xs text-red-800 leading-relaxed">{item.crossContamination.join(", ")}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center space-y-3">
                  <div className={cn("mx-auto w-12 h-12 rounded-full flex items-center justify-center", config.bgClass)}>
                    {config.icon}
                  </div>
                  <h4 className="font-bold text-gray-900">Your Zen Profile Setting</h4>
                  <p className="text-xs text-gray-500 italic px-4">"This information will be shared during the 3-hour handshake to ensure your environment is safe and comfortable."</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Action Footer */}
          <div className="mt-8 space-y-3">
            {isMedical && onNavigateToSafe && (
              <Button onClick={onNavigateToSafe} className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-lg font-bold gap-2 shadow-lg">
                <Leaf className="w-5 h-5" /> See Safe Alternatives
              </Button>
            )}
            
            <div className="grid grid-cols-5 gap-2">
              {(["red", "amber", "brown", "green", "blue"] as ZenSpectrumColor[]).map((c) => (
                <button
                  key={c}
                  onClick={() => onAddToList?.(item, c)}
                  className={cn(
                    "h-10 rounded-xl border-2 transition-all flex items-center justify-center",
                    status === c ? "border-black scale-105 shadow-sm" : "border-gray-100 opacity-40 hover:opacity-100"
                  )}
                >
                  <div className={cn("w-3 h-3 rounded-full", 
                    c === 'red' ? 'bg-red-500' : 
                    c === 'amber' ? 'bg-orange-500' : 
                    c === 'brown' ? 'bg-stone-500' : 
                    c === 'green' ? 'bg-green-500' : 'bg-blue-500'
                  )} />
                </button>
              ))}
            </div>
            
            <Button variant="ghost" onClick={onClose} className="w-full font-bold text-gray-400 uppercase text-[10px] tracking-widest">
              Close Details
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ItemDetailModal
