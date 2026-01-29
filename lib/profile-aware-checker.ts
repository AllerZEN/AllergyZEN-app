// Profile-aware ingredient checker - ONLY flags items from user's selected sensitivities
// No hardcoded triggers like Water or Sugar

import { normalizeForSearch, fuzzyMatch } from "@/lib/fuzzy-search"

export type IntensityLevel = "high" | "moderate" | "trace"

export interface ProfileCheckResult {
  ingredient: string
  isTrigger: boolean
  matchedTrigger?: string
  allergenCategory?: string
  intensity?: IntensityLevel
  position?: number
  totalIngredients?: number
}

export interface ProfileScreeningResult {
  status: "safe" | "danger" | "warning"
  redFlags: {
    ingredient: string
    allergen: string
    intensity: IntensityLevel
    position: number
  }[]
  yellowFlags: {
    ingredient: string
    reason: string
    intensity?: IntensityLevel
  }[]
  fragranceWarning: boolean
}

// Exclusion terms that negate allergen flags
const exclusionPatterns = ["-free", " free", "free from", "without", "no ", "0%", "does not contain", "allergen-free"]

function isNegatedByExclusion(ingredient: string, trigger: string): boolean {
  const normalized = normalizeForSearch(ingredient)
  const triggerNormalized = normalizeForSearch(trigger)

  // Check if it's a "free from" claim
  for (const pattern of exclusionPatterns) {
    const patternNormalized = normalizeForSearch(pattern)
    if (
      normalized.includes(triggerNormalized + patternNormalized) ||
      normalized.includes(patternNormalized + triggerNormalized) ||
      normalized.includes(patternNormalized + " " + triggerNormalized)
    ) {
      return true
    }
  }
  return false
}

// Calculate intensity based on ingredient position
function calculateIntensity(position: number, totalIngredients: number): IntensityLevel {
  const percentage = position / totalIngredients

  // First 3 ingredients or first 15% = High intensity
  if (position <= 3 || percentage <= 0.15) {
    return "high"
  }
  // Middle of the list (15-75%) = Moderate
  if (percentage <= 0.75) {
    return "moderate"
  }
  // Last 25% = Trace
  return "trace"
}

// Check a single ingredient against user's triggers
export function checkIngredientAgainstProfile(
  ingredient: string,
  userTriggers: string[],
  position: number,
  totalIngredients: number,
): ProfileCheckResult {
  // Normalize the ingredient for comparison
  const normalizedIngredient = normalizeForSearch(ingredient)

  for (const trigger of userTriggers) {
    const normalizedTrigger = normalizeForSearch(trigger)

    // Check if ingredient contains the trigger using fuzzy matching
    // This handles "Cow's milk" being matched when trigger is "cows milk" or "milk cow"
    const directMatch = normalizedIngredient.includes(normalizedTrigger)
    const fuzzyMatchResult = fuzzyMatch(trigger, ingredient)

    if ((directMatch || fuzzyMatchResult) && !isNegatedByExclusion(ingredient, trigger)) {
      return {
        ingredient,
        isTrigger: true,
        matchedTrigger: trigger,
        intensity: calculateIntensity(position, totalIngredients),
        position,
        totalIngredients,
      }
    }
  }

  return {
    ingredient,
    isTrigger: false,
    position,
    totalIngredients,
  }
}

// Check all ingredients against user's profile
export function screenIngredientsWithProfile(
  ingredients: string[],
  userTriggers: string[],
  userSelectedCategories: string[] = [],
): ProfileScreeningResult {
  const totalIngredients = ingredients.length
  const redFlags: ProfileScreeningResult["redFlags"] = []
  const yellowFlags: ProfileScreeningResult["yellowFlags"] = []
  let fragranceWarning = false

  // Check for fragrance warning only if user has fragrance/chemicals selected
  const hasFragranceCategory = userSelectedCategories.includes("fragrance")
  const fragranceTerms = ["fragrance", "parfum", "perfume"]

  for (let i = 0; i < ingredients.length; i++) {
    const ingredient = ingredients[i]
    const normalized = ingredient.toLowerCase().trim()
    const position = i + 1 // 1-indexed position

    // Check fragrance
    if (hasFragranceCategory && fragranceTerms.some((term) => normalized.includes(term))) {
      fragranceWarning = true
    }

    // Check against user triggers
    const result = checkIngredientAgainstProfile(ingredient, userTriggers, position, totalIngredients)

    if (result.isTrigger && result.intensity && result.matchedTrigger) {
      // High and Moderate intensity go to red flags
      if (result.intensity === "high" || result.intensity === "moderate") {
        redFlags.push({
          ingredient: result.ingredient,
          allergen: result.matchedTrigger,
          intensity: result.intensity,
          position,
        })
      } else {
        // Trace amounts go to yellow flags
        yellowFlags.push({
          ingredient: result.ingredient,
          reason: `Trace amount of ${result.matchedTrigger} (position ${position}/${totalIngredients})`,
          intensity: result.intensity,
        })
      }
    }
  }

  // Determine overall status
  let status: "safe" | "danger" | "warning" = "safe"
  if (redFlags.some((f) => f.intensity === "high")) {
    status = "danger"
  } else if (redFlags.length > 0 || yellowFlags.length > 0 || fragranceWarning) {
    status = "warning"
  }

  return {
    status,
    redFlags,
    yellowFlags,
    fragranceWarning,
  }
}
