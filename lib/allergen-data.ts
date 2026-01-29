export interface Allergen {
  id: string
  name: string
  category: "food" | "chemical" | "fabric"
  tier: "red" | "yellow" | "green"
  aliases: string[]
  derivatives?: string[]
}

export interface SafeAlternative {
  id: string
  name: string
  category: string
  description: string
  replaces: string[]
}

// Red Tier - Strict Block
export const redTierAllergens: Allergen[] = [
  // Food Allergens
  {
    id: "dairy",
    name: "All Dairy",
    category: "food",
    tier: "red",
    aliases: ["milk", "cheese", "butter", "cream", "yogurt", "whey", "casein", "lactose", "ghee"],
  },
  {
    id: "rice",
    name: "All Rice",
    category: "food",
    tier: "red",
    aliases: ["rice flour", "rice starch", "rice syrup", "rice bran", "rice protein"],
    derivatives: ["rice bran oil", "rice vinegar", "sake", "mirin", "rice milk"],
  },
  {
    id: "wheat",
    name: "All Wheat/Gluten",
    category: "food",
    tier: "red",
    aliases: ["gluten", "flour", "bread", "pasta", "semolina", "spelt", "kamut", "durum", "farina", "seitan"],
  },
  {
    id: "coconut",
    name: "All Coconut",
    category: "food",
    tier: "red",
    aliases: ["coconut oil", "coconut milk", "coconut cream", "coconut flour", "coco", "copra"],
    derivatives: ["MCT oil", "coconut sugar", "coconut aminos"],
  },
  {
    id: "almonds",
    name: "Almonds",
    category: "food",
    tier: "red",
    aliases: ["almond flour", "almond milk", "almond butter", "marzipan", "frangipane"],
  },
  { id: "walnuts", name: "Walnuts", category: "food", tier: "red", aliases: ["walnut oil", "walnut butter"] },
  {
    id: "sesame",
    name: "Sesame",
    category: "food",
    tier: "red",
    aliases: ["sesame oil", "tahini", "sesame seeds", "halvah", "hummus"],
  },
  {
    id: "sunflower",
    name: "Sunflower",
    category: "food",
    tier: "red",
    aliases: ["sunflower oil", "sunflower seeds", "sunflower lecithin", "sunflower butter"],
    derivatives: ["sunflower lecithin", "high oleic sunflower oil"],
  },

  // Chemical/Contact Block
  {
    id: "e1202",
    name: "E1202 (Polyvinylpolypyrrolidone)",
    category: "chemical",
    tier: "red",
    aliases: ["PVPP", "Polyclar"],
  },
  { id: "e284", name: "E284 (Boric Acid)", category: "chemical", tier: "red", aliases: ["boric acid", "boracic acid"] },
  {
    id: "e515",
    name: "E515 (Potassium Sulphates)",
    category: "chemical",
    tier: "red",
    aliases: ["potassium sulfate", "K2SO4"],
  },
  {
    id: "e553b",
    name: "E553b (Talc)",
    category: "chemical",
    tier: "red",
    aliases: ["talc", "talcum", "magnesium silicate"],
  },

  // Fabric Allergens
  { id: "pique", name: "Piqué Fabric", category: "fabric", tier: "red", aliases: ["pique", "piqué", "waffle weave"] },
  {
    id: "polyester",
    name: "Polyester",
    category: "fabric",
    tier: "red",
    aliases: ["polyester", "PET", "polyethylene terephthalate"],
  },
]

// Cleaning product flags
export const cleaningProductFlags = [
  "synthetic fragrance",
  "fragrance",
  "parfum",
  "plastic softener",
  "phthalates",
  "DEP",
  "DBP",
  "DEHP",
  "fabric softener",
]

// Fabric flags
export const fabricFlags = ["easy-care", "easy care", "wrinkle-free", "permanent press", "formaldehyde"]

export const medicationFillers = [
  { name: "Talc", trigger: "e553b", description: "Magnesium silicate - common tablet filler" },
  { name: "PVP", trigger: "e1202", description: "Polyvinylpyrrolidone - binder/coating agent" },
  { name: "Crospovidone", trigger: "e1202", description: "Cross-linked PVP - tablet disintegrant" },
  { name: "Povidone", trigger: "e1202", description: "Another name for PVP" },
  { name: "Lactose", trigger: "dairy", description: "Milk sugar - common tablet filler" },
  { name: "Lactose Monohydrate", trigger: "dairy", description: "Hydrated milk sugar filler" },
  { name: "Magnesium Stearate", trigger: null, description: "Lubricant - generally safe but watch source" },
  { name: "Pregelatinized Starch", trigger: "wheat", description: "May be wheat-derived" },
  { name: "Corn Starch", trigger: null, description: "Generally safe alternative" },
  { name: "Microcrystalline Cellulose", trigger: null, description: "Wood pulp derived - safe" },
  { name: "Croscarmellose Sodium", trigger: null, description: "Cellulose derivative - safe" },
  { name: "Rice Starch", trigger: "rice", description: "Rice-derived filler" },
  { name: "Coconut Oil", trigger: "coconut", description: "Often in softgel capsules" },
  { name: "MCT Oil", trigger: "coconut", description: "Usually coconut-derived" },
]

// Green Zone - Super-Safe Substitutes
export const safeAlternatives: SafeAlternative[] = [
  {
    id: "quinoa",
    name: "Quinoa",
    category: "Grain Alternative",
    description: "Complete protein, gluten-free grain substitute",
    replaces: ["rice", "wheat"],
  },
  {
    id: "tiger-nut",
    name: "Tiger Nut",
    category: "Nut Alternative",
    description: "Nut-free tuber, great for milk and flour",
    replaces: ["almonds", "walnuts", "coconut"],
  },
  {
    id: "olive-oil",
    name: "Olive Oil",
    category: "Oil Alternative",
    description: "Heart-healthy cooking oil",
    replaces: ["coconut", "sunflower", "sesame"],
  },
]

export const greenListFoods = [
  { name: "Quinoa", category: "grain" },
  { name: "Tiger Nut", category: "nut-alternative" },
  { name: "Olive Oil", category: "oil" },
  { name: "Turkey", category: "protein" },
  { name: "Chicken", category: "protein" },
  { name: "Salmon", category: "protein" },
  { name: "Sweet Potato", category: "vegetable" },
  { name: "Spinach", category: "vegetable" },
  { name: "Broccoli", category: "vegetable" },
  { name: "Zucchini", category: "vegetable" },
  { name: "Carrots", category: "vegetable" },
  { name: "Avocado", category: "fat" },
  { name: "Eggs", category: "protein" },
  { name: "Beef", category: "protein" },
  { name: "Lamb", category: "protein" },
  { name: "Buckwheat", category: "grain" },
  { name: "Millet", category: "grain" },
  { name: "Apple", category: "fruit" },
  { name: "Blueberries", category: "fruit" },
  { name: "Lemon", category: "fruit" },
]

export function checkIngredient(ingredient: string): { safe: boolean; matches: Allergen[]; warnings: string[] } {
  const normalizedIngredient = ingredient.toLowerCase().trim()
  const matches: Allergen[] = []
  const warnings: string[] = []

  for (const allergen of redTierAllergens) {
    // Check main name
    if (normalizedIngredient.includes(allergen.name.toLowerCase())) {
      matches.push(allergen)
      continue
    }

    // Check aliases
    for (const alias of allergen.aliases) {
      if (normalizedIngredient.includes(alias.toLowerCase())) {
        matches.push(allergen)
        break
      }
    }

    // Check derivatives
    if (allergen.derivatives) {
      for (const derivative of allergen.derivatives) {
        if (normalizedIngredient.includes(derivative.toLowerCase())) {
          matches.push(allergen)
          warnings.push(`Hidden derivative detected: ${derivative} (from ${allergen.name})`)
          break
        }
      }
    }
  }

  // Check cleaning product flags
  for (const flag of cleaningProductFlags) {
    if (normalizedIngredient.includes(flag.toLowerCase())) {
      warnings.push(`Cleaning product flag: ${flag}`)
    }
  }

  // Check fabric flags
  for (const flag of fabricFlags) {
    if (normalizedIngredient.includes(flag.toLowerCase())) {
      warnings.push(`Fabric treatment flag: ${flag}`)
    }
  }

  return {
    safe: matches.length === 0 && warnings.length === 0,
    matches: [...new Set(matches)],
    warnings: [...new Set(warnings)],
  }
}

export function checkIngredientWithMedication(ingredient: string): {
  safe: boolean
  matches: Allergen[]
  warnings: string[]
  medicationWarnings: { name: string; trigger: string | null; description: string }[]
} {
  const baseResult = checkIngredient(ingredient)
  const normalizedIngredient = ingredient.toLowerCase().trim()
  const medicationWarnings: { name: string; trigger: string | null; description: string }[] = []

  for (const filler of medicationFillers) {
    if (normalizedIngredient.includes(filler.name.toLowerCase())) {
      medicationWarnings.push(filler)
      if (filler.trigger) {
        const triggerAllergen = redTierAllergens.find((a) => a.id === filler.trigger)
        if (triggerAllergen && !baseResult.matches.some((m) => m.id === filler.trigger)) {
          baseResult.matches.push(triggerAllergen)
        }
      }
    }
  }

  return {
    ...baseResult,
    safe: baseResult.safe && medicationWarnings.filter((m) => m.trigger).length === 0,
    medicationWarnings,
  }
}

export function getSafeAlternativesFor(allergenId: string): SafeAlternative[] {
  return safeAlternatives.filter((alt) => alt.replaces.includes(allergenId))
}
