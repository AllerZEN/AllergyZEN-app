"use client"

import React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AlertTriangle, 
  ShieldCheck, 
  ThumbsDown, 
  Leaf, 
  Heart,
  ChefHat,
  MapPin,
  Sparkles,
  AlertCircle,
  Eye,
  Zap,
  BookOpen,
  ArrowRight
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
  label: string
  bgClass: string
  borderClass: string
  textClass: string
  icon: React.ReactNode
  description: string
}> = {
  red: {
    label: "Danger",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/30",
    textClass: "text-red-600",
    icon: <AlertTriangle className="w-5 h-5" />,
    description: "High-alert item - avoid completely"
  },
  amber: {
    label: "Caution",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/30",
    textClass: "text-amber-600",
    icon: <AlertCircle className="w-5 h-5" />,
    description: "Proceed with caution - check carefully"
  },
  brown: {
    label: "Dislike",
    bgClass: "bg-stone-500/10",
    borderClass: "border-stone-500/30",
    textClass: "text-stone-600",
    icon: <ThumbsDown className="w-5 h-5" />,
    description: "Personal preference - not a medical concern"
  },
  green: {
    label: "Safe",
    bgClass: "bg-green-500/10",
    borderClass: "border-green-500/30",
    textClass: "text-green-600",
    icon: <ShieldCheck className="w-5 h-5" />,
    description: "Safe for you - enjoy freely"
  },
  blue: {
    label: "Boundary",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/30",
    textClass: "text-blue-600",
    icon: <Heart className="w-5 h-5" />,
    description: "Sensory or ED boundary preference"
  }
}

export function ItemDetailModal({ 
  isOpen, 
  onClose, 
  item, 
  status,
  onAddToList,
  onNavigateToSafe
}: ItemDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "safety">("info")
  
  if (!item) return null
  
  const config = statusConfig[status]
  const isLifeSaving = status === "red" || status === "amber"
  const isPositive = status === "green"
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              config.bgClass,
              config.borderClass,
              "border-2"
            )}>
              <span className={config.textClass}>{config.icon}</span>
            </div>
            <div>
              <DialogTitle className="text-xl">{item.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <Badge className={cn(config.bgClass, config.textClass, "border-0")}>
                  {config.label}
                </Badge>
                <span className="text-muted-foreground">{item.category}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "info" | "safety")} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info" className="gap-1">
              <BookOpen className="w-4 h-4" />
              {isPositive ? "Lifestyle" : "Details"}
            </TabsTrigger>
            <TabsTrigger value="safety" className="gap-1">
              {isLifeSaving ? <Zap className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isLifeSaving ? "Life-Saving" : "Info"}
            </TabsTrigger>
          </TabsList>
          
          {/* Info Tab - Lifestyle data for Green, Details for others */}
          <TabsContent value="info" className="space-y-4 mt-4">
            {isPositive ? (
              // GREEN ITEMS: Lifestyle info
              <>
                {item.tasteProfile && (
                  <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ChefHat className="w-4 h-4 text-green-600" />
                        <h4 className="font-semibold text-green-800">Taste Profile</h4>
                      </div>
                      <p className="text-sm text-gray-700">{item.tasteProfile}</p>
                    </CardContent>
                  </Card>
                )}
                
                {item.cookingTips && (
                  <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-green-600" />
                        <h4 className="font-semibold text-green-800">How to Cook/Eat</h4>
                      </div>
                      <p className="text-sm text-gray-700">{item.cookingTips}</p>
                    </CardContent>
                  </Card>
                )}
                
                {item.whereToFind && (
                  <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <h4 className="font-semibold text-green-800">Where to Find</h4>
                      </div>
                      <p className="text-sm text-gray-700">{item.whereToFind}</p>
                    </CardContent>
                  </Card>
                )}
                
                {item.benefits && (
                  <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Leaf className="w-4 h-4 text-green-600" />
                        <h4 className="font-semibold text-green-800">Benefits</h4>
                      </div>
                      <p className="text-sm text-gray-700">{item.benefits}</p>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              // OTHER ITEMS: Basic details
              <>
                <Card className={cn(config.borderClass, config.bgClass)}>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Category</h4>
                    <p className="text-sm text-gray-700">
                      {item.category}
                      {item.subcategory && ` - ${item.subcategory}`}
                    </p>
                  </CardContent>
                </Card>
                
                {item.aliases && item.aliases.length > 0 && (
                  <Card className={cn(config.borderClass, config.bgClass)}>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Also Known As</h4>
                      <div className="flex flex-wrap gap-1">
                        {item.aliases.map((alias, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {alias}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
          
          {/* Safety Tab - Life-saving info for Red/Amber */}
          <TabsContent value="safety" className="space-y-4 mt-4">
            {isLifeSaving ? (
              // RED/AMBER ITEMS: Life-saving info
              <>
                {item.symptoms && item.symptoms.length > 0 && (
                  <Card className="border-red-200 bg-red-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <h4 className="font-semibold text-red-800">Medical Symptoms</h4>
                      </div>
                      <ul className="space-y-1">
                        {item.symptoms.map((symptom, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                            {symptom}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                
                {(item.hiddenNames && item.hiddenNames.length > 0) || (item.eNumbers && item.eNumbers.length > 0) ? (
                  <Card className="border-amber-200 bg-amber-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-amber-600" />
                        <h4 className="font-semibold text-amber-800">Hidden Names & E-Numbers</h4>
                      </div>
                      <div className="space-y-2">
                        {item.eNumbers && item.eNumbers.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">E-Numbers:</p>
                            <div className="flex flex-wrap gap-1">
                              {item.eNumbers.map((e, idx) => (
                                <Badge key={idx} variant="destructive" className="text-xs">
                                  {e}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {item.hiddenNames && item.hiddenNames.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Hidden Names:</p>
                            <div className="flex flex-wrap gap-1">
                              {item.hiddenNames.map((name, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs border-amber-300">
                                  {name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
                
                {item.crossContamination && item.crossContamination.length > 0 && (
                  <Card className="border-orange-200 bg-orange-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-orange-600" />
                        <h4 className="font-semibold text-orange-800">Cross-Contamination Risk</h4>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.crossContamination.map((risk, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs border-orange-300">
                            {risk}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              // GREEN/BLUE/BROWN: General info
              <Card className={cn(config.borderClass, config.bgClass)}>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700">{config.description}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
          {(status === "red" || status === "amber") && onNavigateToSafe && (
            <Button 
              variant="outline" 
              className="w-full bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
              onClick={onNavigateToSafe}
            >
              <Leaf className="w-4 h-4 mr-2" />
              See Safe Alternatives
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          )}
          
          {onAddToList && (
            <div className="grid grid-cols-5 gap-1">
              {(["red", "amber", "brown", "green", "blue"] as ZenSpectrumColor[]).map((color) => (
                <Button
                  key={color}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex-1",
                    status === color && "ring-2 ring-offset-1",
                    color === "red" && "border-red-300 hover:bg-red-50",
                    color === "amber" && "border-amber-300 hover:bg-amber-50",
                    color === "brown" && "border-stone-300 hover:bg-stone-50",
                    color === "green" && "border-green-300 hover:bg-green-50",
                    color === "blue" && "border-blue-300 hover:bg-blue-50"
                  )}
                  onClick={() => onAddToList(item, color)}
                >
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    color === "red" && "bg-red-500",
                    color === "amber" && "bg-amber-500",
                    color === "brown" && "bg-stone-500",
                    color === "green" && "bg-green-500",
                    color === "blue" && "bg-blue-500"
                  )} />
                </Button>
              ))}
            </div>
          )}
          
          <Button variant="ghost" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ItemDetailModal
