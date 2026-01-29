"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  AlertTriangle, AlertCircle, CheckCircle, Plus,
  MapPin, Pill, Utensils, Info
} from "lucide-react"
import userProfile from "@/lib/profile"

interface StatusDetailModalProps {
  isOpen: boolean
  onClose: () => void
  item: {
    name: string
    category: string
    status: "red" | "amber" | "green"
  } | null
}

// Sample data for where items are found
const ITEM_SOURCES: Record<string, string[]> = {
  "Peanuts": ["Peanut butter", "Thai cuisine", "Some chocolates", "Satay sauce", "Ice cream"],
  "Lactose": ["Milk products", "Cheese", "Cream", "Some medications", "Bread"],
  "Gluten": ["Bread", "Pasta", "Cereals", "Beer", "Soy sauce"],
  "Croscarmellose Sodium": ["Tablets", "Capsules", "Ibuprofen", "Acetaminophen", "Vitamins"],
  "Magnesium Stearate": ["Supplements", "Medications", "Capsule coatings"],
}

const SYMPTOMS: Record<string, string[]> = {
  red: ["Anaphylaxis risk", "Severe swelling", "Difficulty breathing", "Rapid heartbeat", "Loss of consciousness"],
  amber: ["Mild hives", "Digestive discomfort", "Headache", "Fatigue", "Skin irritation"],
  green: ["Generally safe", "No known reactions", "Well tolerated"],
}

const COOKING_TIPS: Record<string, { taste: string; texture: string; tips: string[] }> = {
  "Oat Milk": { taste: "Mild, slightly sweet", texture: "Creamy", tips: ["Great in coffee", "Works in baking", "Shake before use"] },
  "Sunflower Butter": { taste: "Nutty, earthy", texture: "Smooth", tips: ["Peanut-free alternative", "Rich in vitamin E", "Great in smoothies"] },
  "Rice Pasta": { taste: "Neutral", texture: "Slightly softer", tips: ["Don't overcook", "Rinse after cooking", "Works in cold salads"] },
}

export function StatusDetailModal({ isOpen, onClose, item }: StatusDetailModalProps) {
  const [addedToSpectrum, setAddedToSpectrum] = useState(false)

  if (!item) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "red": return "bg-red-500"
      case "amber": return "bg-orange-500"
      case "green": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "red": return <AlertTriangle className="w-5 h-5 text-red-600" />
      case "amber": return <AlertCircle className="w-5 h-5 text-orange-600" />
      case "green": return <CheckCircle className="w-5 h-5 text-green-600" />
      default: return <Info className="w-5 h-5" />
    }
  }

  const sources = ITEM_SOURCES[item.name] || ["Common foods", "Various products", "Check labels"]
  const symptoms = SYMPTOMS[item.status] || SYMPTOMS.amber
  const cookingInfo = COOKING_TIPS[item.name]

  const handleAddToSpectrum = () => {
    const dotColor = item.status === "red" ? "red" : item.status === "amber" ? "amber" : "green"
    userProfile.addItem(item.name, item.category, dotColor)
    setAddedToSpectrum(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full ${getStatusColor(item.status)} flex items-center justify-center`}>
              {getStatusIcon(item.status)}
            </div>
            {item.name}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge variant="outline">{item.category}</Badge>
            <Badge className={`${getStatusColor(item.status)} text-white`}>
              {item.status.toUpperCase()}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Red/Amber: Show sources and symptoms */}
          {(item.status === "red" || item.status === "amber") && (
            <>
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    Where It's Found
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((source, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                    <Pill className="w-4 h-4 text-gray-500" />
                    Excipients & Hidden Sources
                  </h4>
                  <p className="text-sm text-gray-600">
                    May also be found in medications containing Croscarmellose Sodium, Magnesium Stearate, or similar binding agents.
                  </p>
                </CardContent>
              </Card>

              <Card className={item.status === "red" ? "border-red-200 bg-red-50" : "border-orange-200 bg-orange-50"}>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                    {getStatusIcon(item.status)}
                    Potential Symptoms
                  </h4>
                  <ul className="space-y-1">
                    {symptoms.map((symptom, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(item.status)}`} />
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}

          {/* Green: Show cooking tips */}
          {item.status === "green" && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                  <Utensils className="w-4 h-4 text-green-600" />
                  Safe Alternative Info
                </h4>
                {cookingInfo ? (
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-medium text-gray-500">Taste:</span>
                      <p className="text-sm text-gray-700">{cookingInfo.taste}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Texture:</span>
                      <p className="text-sm text-gray-700">{cookingInfo.texture}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Tips:</span>
                      <ul className="mt-1 space-y-1">
                        {cookingInfo.tips.map((tip, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    This item is generally well-tolerated and can be used as a safe substitute.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Add Button */}
          <Button
            onClick={handleAddToSpectrum}
            disabled={addedToSpectrum}
            className={`w-full ${addedToSpectrum ? "bg-gray-400" : getStatusColor(item.status)}`}
          >
            {addedToSpectrum ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Added to Zen Spectrum
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Quick Add to Zen Spectrum
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
