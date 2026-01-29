"use client"

import { useState, useEffect } from "react"
import { X, EyeOff, Leaf, Sparkles, Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusDot } from "@/components/status-dot"
import { IntensityBar } from "@/components/intensity-bar"
import { cn } from "@/lib/utils"
import { getSymptomInsightByAllergen } from "@/lib/symptom-insights"

interface SensitivityInfo {
  name: string
  category: string
  tier: "Red" | "Orange" | "Green"
  description: string
  hiddenSources: string[]
  safeAlternatives: string[]
}

interface SensitivityDetailModalProps {
  isOpen: boolean
  onClose: () => void
  sensitivity: {
    name: string
    category: string
    severity: "high" | "moderate" | "safe"
  } | null
}

const SENSITIVITY_DATABASE: Record<string, Omit<SensitivityInfo, "name" | "category" | "tier">> = {
  // Dairy
  "Almond Milk": {
    description:
      "A plant-based milk made from almonds. While dairy-free, it can trigger reactions in those with tree nut sensitivities.",
    hiddenSources: ["Coffee creamers", "Baked goods", "Protein bars", "Ice cream alternatives", "Smoothies"],
    safeAlternatives: ["Oat Milk", "Tiger Nut Milk", "Hemp Milk", "Pea Milk"],
  },
  "Almond Oil": {
    description:
      "Extracted from almonds, commonly used in cooking and cosmetics. Can cause contact or ingestion reactions.",
    hiddenSources: ["Skincare products", "Hair oils", "Massage oils", "Baked goods", "Asian cuisine"],
    safeAlternatives: ["Olive Oil", "Avocado Oil", "Grapeseed Oil", "Sunflower-free alternatives"],
  },
  Coconut: {
    description:
      "A tropical fruit used in many food products and cosmetics. Despite being a fruit, it can trigger allergic reactions.",
    hiddenSources: ["MCT oil", "Lauric acid", "Glycerin", "Shampoos", "Lotions", "Chocolate bars"],
    safeAlternatives: ["Shea butter", "Olive oil", "Cocoa butter", "Avocado oil"],
  },
  "Coconut Oil": {
    description: "A versatile oil extracted from coconut meat. Found in both food and personal care products.",
    hiddenSources: ["Popcorn", "Baked goods", "Vegan butter", "Hair products", "Moisturizers", "Lip balms"],
    safeAlternatives: ["Olive Oil", "Avocado Oil", "Shea Butter", "Jojoba Oil"],
  },
  "Coconut Milk": {
    description: "A creamy liquid extracted from coconut flesh, used as a dairy alternative in many cuisines.",
    hiddenSources: ["Curries", "Thai food", "Smoothies", "Ice cream", "Coffee creamers", "Protein shakes"],
    safeAlternatives: ["Oat Milk", "Hemp Milk", "Cashew Milk", "Pea Milk"],
  },
  Dairy: {
    description:
      "Products derived from animal milk, containing lactose and casein proteins that can trigger digestive and immune responses.",
    hiddenSources: ["Casein", "Whey", "Lactose", "Ghee", "Caramel coloring", "Natural flavors"],
    safeAlternatives: ["Oat Milk", "Coconut Yogurt", "Cashew Cheese", "Nutritional Yeast"],
  },
  Wheat: {
    description:
      "A cereal grain containing gluten, one of the most common food allergens affecting the digestive and immune systems.",
    hiddenSources: ["Soy sauce", "Modified food starch", "Malt", "Couscous", "Seitan", "Beer"],
    safeAlternatives: ["Quinoa", "Rice", "Buckwheat", "Gluten-free oats", "Corn flour"],
  },
  Gluten: {
    description: "A protein found in wheat, barley, and rye that triggers immune responses in sensitive individuals.",
    hiddenSources: ["Soy sauce", "Salad dressings", "Marinades", "Communion wafers", "Medications"],
    safeAlternatives: ["Rice flour", "Almond flour", "Coconut flour", "Tapioca starch"],
  },
  "Tree Nuts": {
    description:
      "Includes almonds, walnuts, cashews, and others. One of the most common and potentially severe food allergies.",
    hiddenSources: ["Pesto", "Marzipan", "Praline", "Nougat", "Natural extracts", "Asian cuisine"],
    safeAlternatives: ["Seeds (sunflower, pumpkin)", "Tiger nuts", "Coconut", "Soy nuts"],
  },
  Sesame: {
    description: "Seeds and oil used globally in cuisine. Recently recognized as a major allergen requiring labeling.",
    hiddenSources: ["Tahini", "Hummus", "Halvah", "Asian sauces", "Bread toppings", "Falafel"],
    safeAlternatives: ["Sunflower seed butter", "Pumpkin seeds", "Hemp seeds"],
  },
  Rice: {
    description:
      "A staple grain that can cause sensitivity reactions. Often hidden in processed foods as a thickener or filler.",
    hiddenSources: ["Rice syrup", "Rice flour", "Rice starch", "Rice bran oil", "Gluten-free products", "Baby foods"],
    safeAlternatives: ["Quinoa", "Millet", "Buckwheat", "Cauliflower rice", "Potato"],
  },
  Sunflower: {
    description:
      "Seeds and oil commonly used in cooking and snacks. Can cause reactions when consumed or through skin contact.",
    hiddenSources: ["Vegetable oil blends", "Margarine", "Snack bars", "Bread", "Salad dressings"],
    safeAlternatives: ["Olive oil", "Avocado oil", "Pumpkin seeds", "Hemp seeds"],
  },
  Soy: {
    description:
      "A legume used extensively in food production. One of the top allergens, especially in processed foods.",
    hiddenSources: ["Lecithin", "Vegetable protein", "Tofu", "Tempeh", "Soy sauce", "Edamame"],
    safeAlternatives: ["Coconut aminos", "Chickpeas", "Lentils", "Hemp protein"],
  },
  Egg: {
    description:
      "A common allergen found in many baked goods and processed foods. Both whites and yolks can trigger reactions.",
    hiddenSources: ["Mayonnaise", "Meringue", "Pasta", "Baked goods", "Vaccines", "Some wines"],
    safeAlternatives: ["Flax egg", "Chia egg", "Aquafaba", "Commercial egg replacers"],
  },
  Peanuts: {
    description: "A legume (not a tree nut) that's one of the most common causes of severe allergic reactions.",
    hiddenSources: ["Arachis oil", "Ground nut oil", "Asian cuisine", "Candy", "Baked goods"],
    safeAlternatives: ["Sunflower seed butter", "Soy nut butter", "Tahini", "Wow butter"],
  },
  Shellfish: {
    description:
      "Includes crustaceans (shrimp, crab, lobster) and mollusks. A common cause of severe allergic reactions.",
    hiddenSources: ["Fish sauce", "Caesar dressing", "Worcestershire sauce", "Asian soups", "Glucosamine"],
    safeAlternatives: ["White fish", "Chicken", "Tofu", "Jackfruit"],
  },
  Fish: {
    description: "Proteins in fish can trigger allergic reactions. Different from shellfish allergy.",
    hiddenSources: ["Caesar dressing", "Worcestershire sauce", "Asian sauces", "Omega supplements"],
    safeAlternatives: ["Chicken", "Turkey", "Algae-based omega supplements"],
  },
  Sulphites: {
    description: "Preservatives used in foods and drinks. Can trigger respiratory symptoms, especially in asthmatics.",
    hiddenSources: ["Wine", "Dried fruits", "Pickled foods", "Lemon juice", "Grape juice", "Medications"],
    safeAlternatives: ["Fresh fruits", "Fresh vegetables", "Organic wines", "Home-made preserves"],
  },
  E223: {
    description:
      "Sodium metabisulphite, a preservative that can cause respiratory issues, especially in those with asthma.",
    hiddenSources: ["Wine", "Beer", "Dried fruits", "Pickles", "Fruit juices", "Processed meats"],
    safeAlternatives: ["Fresh produce", "Sulphite-free wines", "Home-preserved foods"],
  },
  E1202: {
    description: "Polyvinylpolypyrrolidone, a clarifying agent. May cause sensitivity in some individuals.",
    hiddenSources: ["Wine", "Beer", "Vinegar", "Fruit juices", "Some medications"],
    safeAlternatives: ["Unfiltered beverages", "Fresh juices", "Water"],
  },
  Lactose: {
    description:
      "The natural sugar in milk. Lactose intolerance causes digestive symptoms when the body can't break it down.",
    hiddenSources: ["Bread", "Processed meats", "Salad dressings", "Medications", "Protein powders"],
    safeAlternatives: ["Lactose-free dairy", "Plant milks", "Hard aged cheeses", "Lactase supplements"],
  },
}

function generateGenericInfo(name: string, category: string): Omit<SensitivityInfo, "name" | "category" | "tier"> {
  return {
    description: `${name} is a ${category.toLowerCase()} item that may cause sensitivity reactions in susceptible individuals. Always check product labels carefully.`,
    hiddenSources: ["Processed foods", "Restaurant meals", "Imported products", "Cosmetics", "Medications"],
    safeAlternatives: ["Consult with your healthcare provider for personalized alternatives"],
  }
}

export function SensitivityDetailModal({ isOpen, onClose, sensitivity }: SensitivityDetailModalProps) {
  const [info, setInfo] = useState<SensitivityInfo | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sensitivity && isOpen) {
      setLoading(true)

      // Simulate loading for smooth UX
      setTimeout(() => {
        const tier = sensitivity.severity === "high" ? "Red" : sensitivity.severity === "moderate" ? "Orange" : "Green"

        // Look up in database or generate generic info
        const dbInfo =
          SENSITIVITY_DATABASE[sensitivity.name] ||
          SENSITIVITY_DATABASE[sensitivity.category] ||
          generateGenericInfo(sensitivity.name, sensitivity.category)

        setInfo({
          name: sensitivity.name,
          category: sensitivity.category,
          tier,
          ...dbInfo,
        })
        setLoading(false)
      }, 300)
    }
  }, [sensitivity, isOpen])

  const symptomInsight = sensitivity
    ? getSymptomInsightByAllergen(sensitivity.name) || getSymptomInsightByAllergen(sensitivity.category)
    : null

  if (!isOpen || !sensitivity) return null

  const tierColors = {
    Red: { bg: "bg-destructive/10", border: "border-destructive/30", text: "text-destructive" },
    Orange: { bg: "bg-warning/10", border: "border-warning/30", text: "text-warning" },
    Green: { bg: "bg-success/10", border: "border-success/30", text: "text-success" },
  }

  const currentTier = info?.tier || "Red"
  const colors = tierColors[currentTier]

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={cn("p-4 border-b flex items-start justify-between rounded-t-2xl", colors.bg, colors.border)}>
          <div className="flex items-start gap-3">
            <StatusDot
              status={
                sensitivity.severity === "high" ? "danger" : sensitivity.severity === "moderate" ? "warning" : "safe"
              }
              size="lg"
              pulse={sensitivity.severity === "high"}
            />
            <div>
              <h2 className="text-lg font-bold">{sensitivity.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={cn("text-xs", colors.text, colors.border)}>
                  {sensitivity.category} - {currentTier} Tier
                </Badge>
                {(sensitivity.severity === "high" || sensitivity.severity === "moderate") && (
                  <IntensityBar intensity={sensitivity.severity === "high" ? "high" : "moderate"} showLabel={false} />
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading details...</p>
            </div>
          ) : info ? (
            <>
              {/* What is it? */}
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="font-medium text-sm">What is it?</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{info.description}</p>
              </div>

              {/* Symptom Insight (if available) */}
              {symptomInsight && (
                <div className={cn("rounded-xl p-4", colors.bg)}>
                  <div className="flex items-center gap-2 mb-2">
                    <Info className={cn("w-4 h-4", colors.text)} />
                    <h3 className={cn("font-medium text-sm", colors.text)}>Why it's flagged</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-2">{symptomInsight.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {symptomInsight.commonSymptoms.map((symptom) => (
                      <Badge key={symptom} variant="secondary" className="text-xs">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Hidden Sources */}
              <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <EyeOff className="w-4 h-4 text-warning" />
                  <h3 className="font-medium text-sm">Hidden Sources</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {info.hiddenSources.map((source) => (
                    <Badge
                      key={source}
                      variant="outline"
                      className="text-xs border-warning/30 text-warning bg-warning/5"
                    >
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Safe Alternatives */}
              <div className="bg-success/5 border border-success/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Leaf className="w-4 h-4 text-success" />
                  <h3 className="font-medium text-sm">Safe Alternatives</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {info.safeAlternatives.map((alt) => (
                    <Badge
                      key={alt}
                      className="text-xs bg-success/20 text-success border-0 hover:bg-success/30 cursor-pointer transition-colors"
                    >
                      {alt}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border text-xs text-muted-foreground text-center">
          <p>Always verify with product labels and consult healthcare professionals</p>
        </div>
      </div>
    </div>
  )
}
