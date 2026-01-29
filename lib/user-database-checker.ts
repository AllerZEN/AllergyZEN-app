// User-specific allergen checking based on their profile
import { getUserProfile, getUserTriggers, ALLERGY_CATEGORIES } from "./user-profile"
import {
  checkIngredientAgainstPersonalDatabase,
  type CheckResult,
  type ReactivityLevel,
} from "./personal-database-checker"

export interface UserCheckResult extends CheckResult {
  userTrigger?: boolean
  categoryName?: string
}

// Exclusion terms that negate allergen flags
const exclusionTerms = [
  "free",
  "-free",
  "free from",
  "without",
  "no ",
  "0%",
  "does not contain",
  "allergen-free",
  "allergen free",
]

function isNegatedByExclusion(ingredient: string, trigger: string): boolean {
  const normalized = ingredient.toLowerCase()
  const patterns = [
    `${trigger}-free`,
    `${trigger} free`,
    `no ${trigger}`,
    `without ${trigger}`,
    `free from ${trigger}`,
    `0% ${trigger}`,
    `${trigger}-less`,
    `${trigger}less`,
  ]
  return patterns.some((pattern) => normalized.includes(pattern))
}

export function checkIngredientForUser(ingredient: string): UserCheckResult {
  const normalized = ingredient.toLowerCase().trim()
  const userTriggers = getUserTriggers()

  // First check if it matches any user-selected triggers
  for (const trigger of userTriggers) {
    if (normalized.includes(trigger) && !isNegatedByExclusion(normalized, trigger)) {
      // Find which category this trigger belongs to
      const profile = getUserProfile()
      let categoryName = "Custom"

      if (profile) {
        for (const allergyId of profile.selectedAllergies) {
          const category = ALLERGY_CATEGORIES.find((c) => c.id === allergyId)
          if (category?.commonTriggers.some((t) => t.toLowerCase() === trigger)) {
            categoryName = category.name
            break
          }
        }
      }

      return {
        item: ingredient,
        level: "high" as ReactivityLevel,
        category: categoryName,
        matchedTerm: trigger,
        userTrigger: true,
        categoryName,
      }
    }
  }

  // Fall back to the full personal database check
  const dbResult = checkIngredientAgainstPersonalDatabase(ingredient)
  return {
    ...dbResult,
    userTrigger: false,
  }
}

export function checkMultipleIngredientsForUser(ingredients: string[]): {
  results: UserCheckResult[]
  summary: {
    high: number
    moderate: number
    safe: number
    unknown: number
    userTriggers: number
    overallStatus: "danger" | "caution" | "safe" | "unknown"
  }
} {
  const results = ingredients.map(checkIngredientForUser)

  const summary = {
    high: results.filter((r) => r.level === "high").length,
    moderate: results.filter((r) => r.level === "moderate").length,
    safe: results.filter((r) => r.level === "safe").length,
    unknown: results.filter((r) => r.level === "unknown").length,
    userTriggers: results.filter((r) => r.userTrigger).length,
    overallStatus: "safe" as "danger" | "caution" | "safe" | "unknown",
  }

  if (summary.high > 0) {
    summary.overallStatus = "danger"
  } else if (summary.moderate > 0) {
    summary.overallStatus = "caution"
  } else if (summary.unknown === results.length) {
    summary.overallStatus = "unknown"
  }

  return { results, summary }
}

export function getUserAllergyCategories(): { id: string; name: string; icon: string }[] {
  const profile = getUserProfile()
  if (!profile) return []

  return profile.selectedAllergies
    .map((id) => ALLERGY_CATEGORIES.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => c !== undefined)
    .map((c) => ({ id: c.id, name: c.name, icon: c.icon }))
}
