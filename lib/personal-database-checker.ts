import personalDatabase from "./personal_database.json"

export type ReactivityLevel = "high" | "moderate" | "safe" | "unknown"

export interface CheckResult {
  item: string
  level: ReactivityLevel
  category: string
  matchedTerm: string
}

const exclusionTerms = [
  "gluten-free",
  "gluten free",
  "dairy-free",
  "dairy free",
  "nut-free",
  "nut free",
  "wheat-free",
  "wheat free",
  "rice-free",
  "rice free",
  "coconut-free",
  "coconut free",
  "sugar-free",
  "sugar free",
  "lactose-free",
  "lactose free",
  "allergen-free",
  "allergen free",
  "free from",
  "does not contain",
  "no added",
  "without",
  "0% wheat",
  "0% dairy",
  "0% gluten",
  "certified gluten-free",
  "certified dairy-free",
]

function isExclusionTerm(ingredient: string): boolean {
  const normalized = ingredient.toLowerCase().trim()
  return exclusionTerms.some((term) => normalized.includes(term))
}

// Flatten all items into searchable arrays with their categories
function getAllHighReactivityItems(): { term: string; category: string }[] {
  const items: { term: string; category: string }[] = []
  const high = personalDatabase.highReactivity

  for (const [category, terms] of Object.entries(high)) {
    for (const term of terms as string[]) {
      items.push({ term: term.toLowerCase(), category })
    }
  }
  return items
}

function getAllModerateItems(): { term: string; category: string }[] {
  const items: { term: string; category: string }[] = []
  const moderate = personalDatabase.moderate

  for (const [category, terms] of Object.entries(moderate)) {
    for (const term of terms as string[]) {
      items.push({ term: term.toLowerCase(), category })
    }
  }
  return items
}

function getAllSafeItems(): { term: string; category: string }[] {
  const items: { term: string; category: string }[] = []
  const safe = personalDatabase.safe

  for (const [category, terms] of Object.entries(safe)) {
    for (const term of terms as string[]) {
      items.push({ term: term.toLowerCase(), category })
    }
  }
  return items
}

// Pre-compute flattened lists
const highReactivityItems = getAllHighReactivityItems()
const moderateItems = getAllModerateItems()
const safeItems = getAllSafeItems()

// Hidden derivatives and aliases for common triggers
const hiddenDerivatives: Record<string, string[]> = {
  rice: [
    "rice flour",
    "rice starch",
    "rice syrup",
    "rice bran",
    "rice protein",
    "rice bran oil",
    "rice vinegar",
    "sake",
    "mirin",
    "rice milk",
    "rice extract",
    "hydrolyzed rice",
    "fermented rice",
    "rice powder",
    "glutinous rice",
    "wild rice",
  ],
  coconut: [
    "coconut oil",
    "coconut milk",
    "coconut cream",
    "coconut flour",
    "coco",
    "copra",
    "mct oil",
    "coconut sugar",
    "coconut aminos",
    "coconut butter",
    "coconut water",
    "coconut extract",
    "cocos nucifera",
  ],
  wheat: [
    "gluten",
    "flour",
    "semolina",
    "spelt",
    "kamut",
    "durum",
    "farina",
    "seitan",
    "vital wheat gluten",
    "wheat starch",
    "wheat germ",
    "wheat bran",
    "hydrolyzed wheat",
    "triticum",
  ],
  dairy: [
    "milk",
    "cheese",
    "butter",
    "cream",
    "yogurt",
    "whey",
    "casein",
    "lactose",
    "ghee",
    "buttermilk",
    "curds",
    "lactalbumin",
    "lactoglobulin",
    "milk solids",
    "milk powder",
    "skim milk",
  ],
  sunflower: ["sunflower oil", "sunflower seeds", "sunflower lecithin", "sunflower butter", "high oleic sunflower"],
  sesame: ["sesame oil", "tahini", "sesame seeds", "halvah", "hummus", "sesame paste"],
  almonds: ["almond flour", "almond milk", "almond butter", "marzipan", "frangipane", "almond extract", "almond oil"],
  walnuts: ["walnut oil", "walnut butter", "walnut extract"],
  corn: [
    "maize",
    "corn starch",
    "corn syrup",
    "corn flour",
    "cornmeal",
    "polenta",
    "hominy",
    "grits",
    "popcorn",
    "corn oil",
    "dextrose",
    "maltodextrin",
    "corn gluten",
  ],
  mushroom: ["shiitake", "portobello", "button mushroom", "oyster mushroom", "chestnut mushroom", "fungus", "mycelia"],
  e1202: ["pvpp", "polyclar", "polyvinylpolypyrrolidone", "crospovidone", "povidone"],
  e553b: ["talc", "talcum", "magnesium silicate"],
  e515: ["potassium sulfate", "potassium sulphate", "k2so4"],
  e284: ["boric acid", "boracic acid"],
}

// Build a reverse lookup for quick matching
const derivativeToTrigger: Map<string, string> = new Map()
for (const [trigger, derivatives] of Object.entries(hiddenDerivatives)) {
  for (const derivative of derivatives) {
    derivativeToTrigger.set(derivative.toLowerCase(), trigger)
  }
}

export function checkIngredientAgainstPersonalDatabase(ingredient: string): CheckResult {
  const normalized = ingredient.toLowerCase().trim()

  if (isExclusionTerm(normalized)) {
    return {
      item: ingredient,
      level: "safe",
      category: "exclusion-claim",
      matchedTerm: "safety claim",
    }
  }

  // Check high reactivity first
  for (const item of highReactivityItems) {
    if (normalized.includes(item.term) || item.term.includes(normalized)) {
      // Make sure it's not part of a "free from" claim
      const freePatterns = [
        `${item.term}-free`,
        `${item.term} free`,
        `no ${item.term}`,
        `without ${item.term}`,
        `free from ${item.term}`,
        `0% ${item.term}`,
      ]
      const isFreeFromClaim = freePatterns.some((pattern) => normalized.includes(pattern))

      if (!isFreeFromClaim) {
        return {
          item: ingredient,
          level: "high",
          category: item.category,
          matchedTerm: item.term,
        }
      }
    }
  }

  // Check hidden derivatives
  for (const [derivative, trigger] of derivativeToTrigger) {
    if (normalized.includes(derivative)) {
      const freePatterns = [`${derivative}-free`, `${derivative} free`, `no ${derivative}`, `without ${derivative}`]
      const isFreeFromClaim = freePatterns.some((pattern) => normalized.includes(pattern))

      if (!isFreeFromClaim) {
        return {
          item: ingredient,
          level: "high",
          category: "hidden-derivative",
          matchedTerm: `${derivative} (contains ${trigger})`,
        }
      }
    }
  }

  // Check moderate reactivity
  for (const item of moderateItems) {
    if (normalized.includes(item.term) || item.term.includes(normalized)) {
      return {
        item: ingredient,
        level: "moderate",
        category: item.category,
        matchedTerm: item.term,
      }
    }
  }

  // Check if it's explicitly safe
  for (const item of safeItems) {
    if (normalized.includes(item.term) || item.term.includes(normalized)) {
      return {
        item: ingredient,
        level: "safe",
        category: item.category,
        matchedTerm: item.term,
      }
    }
  }

  return {
    item: ingredient,
    level: "unknown",
    category: "unknown",
    matchedTerm: "",
  }
}

export function checkMultipleIngredients(ingredients: string[]): {
  results: CheckResult[]
  summary: {
    high: number
    moderate: number
    safe: number
    unknown: number
    overallStatus: "danger" | "caution" | "safe" | "unknown"
  }
} {
  const results = ingredients.map(checkIngredientAgainstPersonalDatabase)

  const summary = {
    high: results.filter((r) => r.level === "high").length,
    moderate: results.filter((r) => r.level === "moderate").length,
    safe: results.filter((r) => r.level === "safe").length,
    unknown: results.filter((r) => r.level === "unknown").length,
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

export function getPersonalDatabaseStats() {
  return personalDatabase.metadata
}

export function searchPersonalDatabase(query: string): CheckResult[] {
  const normalized = query.toLowerCase().trim()
  const results: CheckResult[] = []

  // Search all categories
  for (const item of highReactivityItems) {
    if (item.term.includes(normalized)) {
      results.push({
        item: item.term,
        level: "high",
        category: item.category,
        matchedTerm: item.term,
      })
    }
  }

  for (const item of moderateItems) {
    if (item.term.includes(normalized)) {
      results.push({
        item: item.term,
        level: "moderate",
        category: item.category,
        matchedTerm: item.term,
      })
    }
  }

  for (const item of safeItems) {
    if (item.term.includes(normalized)) {
      results.push({
        item: item.term,
        level: "safe",
        category: item.category,
        matchedTerm: item.term,
      })
    }
  }

  return results.slice(0, 50) // Limit results
}

// Check for fragrance warning
export function hasFragranceWarning(ingredients: string[]): boolean {
  const fragranceTerms = ["fragrance", "parfum", "perfume", "aroma", "scent"]
  return ingredients.some((ing) => fragranceTerms.some((term) => ing.toLowerCase().includes(term)))
}

// Get all items by reactivity level
export function getItemsByLevel(level: ReactivityLevel): { term: string; category: string }[] {
  switch (level) {
    case "high":
      return highReactivityItems
    case "moderate":
      return moderateItems
    case "safe":
      return safeItems
    default:
      return []
  }
}
