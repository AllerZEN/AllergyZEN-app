"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  X, 
  Info,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Heart,
  ThumbsDown,
  ExternalLink
} from "lucide-react"
import userProfile from "@/lib/profile"
import { cn } from "@/lib/utils"

interface IngredientInfo {
  name: string
  category?: string
  nutritionalInfo?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    fiber?: number
  }
  commonAllergens?: string[]
  shieldCode?: "green" | "amber" | "red" | "unknown"
  description?: string
}

interface ZenInfoModalProps {
  ingredient: IngredientInfo
  isOpen: boolean
  onClose: () => void
  onDislikeToggle?: (itemName: string, isDisliked: boolean) => void
}

const SHIELD_CODES = {
  green: { label: "Safe", icon: ShieldCheck, color: "text-green-500", bgColor: "bg-green-50", borderColor: "border-green-200" },
  amber: { label: "Caution", icon: ShieldAlert, color: "text-amber-500", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
  red: { label: "Danger", icon: ShieldX, color: "text-red-500", bgColor: "bg-red-50", borderColor: "border-red-200" },
  unknown: { label: "Unknown", icon: Info, color: "text-gray-500", bgColor: "bg-gray-50", borderColor: "border-gray-200" }
}

export function ZenInfoModal({ ingredient, isOpen, onClose, onDislikeToggle }: ZenInfoModalProps) {
  const [isDisliked, setIsDisliked] = useState(() => userProfile.isDisliked(ingredient.name))
  
  if (!isOpen) return null

  const shieldConfig = SHIELD_CODES[ingredient.shieldCode || "unknown"]
  const ShieldIcon = shieldConfig.icon

  const handleDislikeToggle = () => {
    const newDislikedState = !isDisliked
    if (newDislikedState) {
      userProfile.addDislike(ingredient.name)
    } else {
      userProfile.removeDislike(ingredient.name)
    }
    setIsDisliked(newDislikedState)
    onDislikeToggle?.(ingredient.name, newDislikedState)
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto z-50">
        <Card className={cn("border-2", shieldConfig.borderColor, shieldConfig.bgColor)}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-full", shieldConfig.bgColor)}>
                  <ShieldIcon className={cn("w-6 h-6", shieldConfig.color)} />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-800">{ingredient.name}</CardTitle>
                  <Badge variant="outline" className={cn("mt-1", shieldConfig.color)}>
                    {shieldConfig.label}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Description */}
            {ingredient.description && (
              <div className="p-3 rounded-lg bg-white border border-gray-200">
                <p className="text-sm text-gray-600">{ingredient.description}</p>
              </div>
            )}

            {/* Nutritional Info */}
            {ingredient.nutritionalInfo && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800 text-sm">Nutritional Info (per 100g)</h4>
                <div className="grid grid-cols-3 gap-2">
                  {ingredient.nutritionalInfo.calories !== undefined && (
                    <div className="p-2 rounded bg-white border border-gray-200 text-center">
                      <p className="text-lg font-bold text-gray-800">{ingredient.nutritionalInfo.calories}</p>
                      <p className="text-xs text-gray-500">kcal</p>
                    </div>
                  )}
                  {ingredient.nutritionalInfo.protein !== undefined && (
                    <div className="p-2 rounded bg-white border border-gray-200 text-center">
                      <p className="text-lg font-bold text-gray-800">{ingredient.nutritionalInfo.protein}g</p>
                      <p className="text-xs text-gray-500">Protein</p>
                    </div>
                  )}
                  {ingredient.nutritionalInfo.carbs !== undefined && (
                    <div className="p-2 rounded bg-white border border-gray-200 text-center">
                      <p className="text-lg font-bold text-gray-800">{ingredient.nutritionalInfo.carbs}g</p>
                      <p className="text-xs text-gray-500">Carbs</p>
                    </div>
                  )}
                  {ingredient.nutritionalInfo.fat !== undefined && (
                    <div className="p-2 rounded bg-white border border-gray-200 text-center">
                      <p className="text-lg font-bold text-gray-800">{ingredient.nutritionalInfo.fat}g</p>
                      <p className="text-xs text-gray-500">Fat</p>
                    </div>
                  )}
                  {ingredient.nutritionalInfo.fiber !== undefined && (
                    <div className="p-2 rounded bg-white border border-gray-200 text-center">
                      <p className="text-lg font-bold text-gray-800">{ingredient.nutritionalInfo.fiber}g</p>
                      <p className="text-xs text-gray-500">Fiber</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Common Allergens Warning */}
            {ingredient.commonAllergens && ingredient.commonAllergens.length > 0 && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <h4 className="font-semibold text-red-600 text-sm mb-2">Common Allergen Warnings</h4>
                <div className="flex flex-wrap gap-1">
                  {ingredient.commonAllergens.map(allergen => (
                    <Badge key={allergen} variant="outline" className="bg-white text-red-600 border-red-300">
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Dislike Button */}
            <div className="pt-2 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleDislikeToggle}
                className={cn(
                  "w-full border-2",
                  isDisliked 
                    ? "border-red-500 bg-red-50 text-red-600 hover:bg-red-100" 
                    : "border-gray-300 text-gray-600 hover:border-gray-400"
                )}
              >
                <ThumbsDown className={cn("w-4 h-4 mr-2", isDisliked && "fill-red-500")} />
                {isDisliked ? "Disliked - Excluded from Meal Plans" : "Dislike (Exclude from Meal Plans)"}
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Disliked items will never appear in generated meal suggestions, regardless of safety status.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// Clickable ingredient component for scan results
interface ClickableIngredientProps {
  name: string
  shieldCode?: "green" | "amber" | "red" | "unknown"
  onClick?: () => void
  className?: string
}

export function ClickableIngredient({ name, shieldCode = "unknown", onClick, className }: ClickableIngredientProps) {
  const isDisliked = userProfile.isDisliked(name)
  const shieldConfig = SHIELD_CODES[shieldCode]
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all",
        "hover:opacity-80 cursor-pointer border",
        shieldConfig.bgColor,
        shieldConfig.borderColor,
        isDisliked && "line-through opacity-60",
        className
      )}
    >
      <div className={cn("w-2 h-2 rounded-full", 
        shieldCode === "green" ? "bg-green-500" :
        shieldCode === "amber" ? "bg-amber-500" :
        shieldCode === "red" ? "bg-red-500" : "bg-gray-400"
      )} />
      <span className={shieldConfig.color}>{name}</span>
      {isDisliked && <ThumbsDown className="w-3 h-3 text-red-400" />}
    </button>
  )
}
