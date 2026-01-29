"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, UtensilsCrossed, Sun, Sunset, Moon, RefreshCw, Leaf, Lock, Crown } from "lucide-react"
import { greenListFoods } from "@/lib/allergen-data"
import { canGenerateMeal, recordMealGeneration, getSubscription } from "@/lib/subscription"
import { UpgradeModal } from "./upgrade-modal"
import userProfile from "@/lib/profile"
import { Heart } from "lucide-react"

interface Meal {
  name: string
  ingredients: string[]
  description: string
}

interface MealPlan {
  breakfast: Meal
  lunch: Meal
  dinner: Meal
}

export function MealPlanner() {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [blueMode, setBlueMode] = useState(false)

  // Check if user has boundary preferences set
  const activeProfile = userProfile.getActiveProfile()
  const hasBoundaries = activeProfile?.boundaries && (
    activeProfile.boundaries.softTextures ||
    activeProfile.boundaries.noSaltSauce ||
    activeProfile.boundaries.deconstructed ||
    (activeProfile.boundaries.customNotes?.length ?? 0) > 0
  )

  const mealLimits = canGenerateMeal()
  const subscription = getSubscription()
  const isFreemium = subscription.tier === "freemium"

  async function generateMealPlan() {
    if (!mealLimits.allowed) {
      setShowUpgradeModal(true)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          greenList: greenListFoods,
          blueMode,
          boundaries: activeProfile?.boundaries 
        }),
      })

      if (!response.ok) throw new Error("Failed to generate meals")

      const data = await response.json()
      setMealPlan(data)
      recordMealGeneration()
    } catch (err) {
      setError("Unable to generate meal plan. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const mealIcons = {
    breakfast: Sun,
    lunch: Sunset,
    dinner: Moon,
  }

  const mealLabels = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card/50 backdrop-blur border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
              AI Meal Generator
            </CardTitle>
            {!isFreemium && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs gap-1">
                <Crown className="w-3 h-3" />
                Unlimited
              </Badge>
            )}
          </div>
          <CardDescription>Generate safe meal ideas using only your Green List ingredients</CardDescription>
        </CardHeader>
        {hasBoundaries && (
          <div className="px-6 pb-2">
            <button
              onClick={() => setBlueMode(!blueMode)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all w-full ${
                blueMode 
                  ? "border-blue-500/30 bg-blue-500/10 text-blue-600" 
                  : "border-border hover:border-blue-500/30"
              }`}
            >
              <Heart className={`w-4 h-4 ${blueMode ? "text-blue-600" : "text-muted-foreground"}`} />
              <span className="text-sm font-medium">Blue Mode</span>
              {blueMode && (
                <Badge className="ml-auto bg-blue-500/20 text-blue-600 border-blue-500/30 text-xs">
                  Active
                </Badge>
              )}
            </button>
            {blueMode && (
              <p className="text-xs text-muted-foreground mt-2">
                Meals will prioritize your texture and sensory preferences
              </p>
            )}
          </div>
        )}
        <CardContent className="space-y-4">
          {isFreemium && (
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Daily suggestions remaining
              </span>
              <Badge variant={mealLimits.remaining > 0 ? "secondary" : "destructive"} className="text-xs">
                {mealLimits.remaining} / {mealLimits.limit}
              </Badge>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 p-3 bg-success/5 rounded-lg border border-success/20">
            <p className="w-full text-xs text-muted-foreground mb-1">Your Green List:</p>
            {greenListFoods.slice(0, 8).map((food) => (
              <Badge key={food.name} variant="outline" className="text-xs border-success/30 text-success">
                {food.name}
              </Badge>
            ))}
            <Badge variant="secondary" className="text-xs">
              +{greenListFoods.length - 8} more
            </Badge>
          </div>

          <Button onClick={generateMealPlan} disabled={loading} className="w-full gap-2" size="lg">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Safe Meals...
              </>
            ) : mealPlan ? (
              <>
                <RefreshCw className="w-4 h-4" />
                Generate New Plan
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Safe Meal Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="pt-4">
            <p className="text-sm text-destructive text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {mealPlan && !loading && (
        <div className="space-y-3">
          {(["breakfast", "lunch", "dinner"] as const).map((mealType) => {
            const meal = mealPlan[mealType]
            const Icon = mealIcons[mealType]

            return (
              <Card key={mealType} className="bg-card/50 backdrop-blur border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">
                          {mealLabels[mealType]}
                        </span>
                        <Badge className="bg-success/20 text-success text-xs border-0">
                          <Leaf className="w-3 h-3 mr-1" />
                          Safe
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{meal.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{meal.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {meal.ingredients.map((ingredient) => (
                          <Badge key={ingredient} variant="secondary" className="text-xs">
                            {ingredient}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} reason="meal_limit" />
    </div>
  )
}
