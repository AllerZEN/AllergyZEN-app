// allergyZEN Wellness Assistant App - Master Data Structure
// 🔴 Red | 🟠 Amber | 🟤 Brown | 🟢 Green | 💙 Blue

export type ZenTier = "red" | "amber" | "brown" | "green" | "blue";

export interface Allergen {
  id: string
  name: string
  category: "food" | "chemical" | "fabric" | "laboratory" | "medicinal" | "material" | "sensory"
  tier: ZenTier
  aliases: string[]
  derivatives?: string[]
}

// RED TIER - Severe Reactivity 🔴
export const redTierAllergens: Allergen[] = [
  {
    id: "sds",
    name: "SDS (Sodium Dodecyl Sulfate)",
    category: "laboratory",
    tier: "red",
    aliases: ["sodium lauryl sulfate", "SLS", "laurilsulfate"],
  },
  {
    id: "croscarmellose",
    name: "Croscarmellose Sodium",
    category: "medicinal",
    tier: "red",
    aliases: ["cross-linked sodium carboxymethylcellulose", "E468"],
    derivatives: ["tablet disintegrants"],
  },
  {
    id: "dairy",
    name: "All Dairy",
    category: "food",
    tier: "red",
    aliases: ["milk", "whey", "casein", "lactose"],
  }
];

// AMBER TIER - Moderate Reactivity 🟠
export const amberTierAllergens: Allergen[] = [
  {
    id: "fragrance",
    name: "Synthetic Fragrance",
    category: "chemical",
    tier: "amber",
    aliases: ["parfum", "fragrance", "scent"],
  }
];

// BROWN TIER - Dislikes/Sensitivities 🟤
export const brownTierAllergens: Allergen[] = [
  {
    id: "wenge",
    name: "Wenge Wood",
    category: "material",
    tier: "brown",
    aliases: ["Millettia laurentii"],
  },
  {
    id: "pla",
    name: "PLA (Polylactic Acid)",
    category: "material",
    tier: "brown",
    aliases: ["corn plastic", "bioplastic"],
  }
];

// BLUE TIER - ED/Sensory Boundaries 💙
export const blueTierAllergens: Allergen[] = [
  {
    id: "crunchy-texture",
    name: "Crunchy Texture",
    category: "sensory",
    tier: "blue",
    aliases: ["hard foods", "crispy bits"],
  }
];

/**
 * Master Ingredient Check Logic
 * Checks against all 5 tiers and returns the highest risk match.
 */
export function checkIngredient(ingredient: string): { safe: boolean; tier: ZenTier; matches: Allergen[] } {
  const normalized = ingredient.toLowerCase().trim();
  const matches: Allergen[] = [];

  const allCheckable = [
    ...redTierAllergens, 
    ...amberTierAllergens, 
    ...brownTierAllergens, 
    ...blueTierAllergens
  ];

  for (const allergen of allCheckable) {
    if (normalized.includes(allergen.name.toLowerCase()) || 
        allergen.aliases.some(a => normalized.includes(a.toLowerCase()))) {
      matches.push(allergen);
    }
  }

  // Determine highest tier found
  let highestTier: ZenTier = "green"; 
  if (matches.some(m => m.tier === "red")) highestTier = "red";
  else if (matches.some(m => m.tier === "amber")) highestTier = "amber";
  else if (matches.some(m => m.tier === "brown")) highestTier = "brown";
  else if (matches.some(m => m.tier === "blue")) highestTier = "blue";

  return {
    safe: highestTier === "green" || highestTier === "blue",
    tier: highestTier,
    matches: [...new Set(matches)],
  };
}

// Temporary bridge to fix the Runtime Error
export const greenListFoods: Allergen[] = [];

// Safe Alternatives Database
export const safeAlternatives: { id: string; name: string; replaces: string; category: string }[] = [
  { id: "oat-milk", name: "Oat Milk", replaces: "dairy", category: "beverages" },
  { id: "almond-milk", name: "Almond Milk", replaces: "dairy", category: "beverages" },
  { id: "coconut-milk", name: "Coconut Milk", replaces: "dairy", category: "beverages" },
  { id: "hemp-milk", name: "Hemp Milk", replaces: "dairy", category: "beverages" },
  { id: "rice-milk", name: "Rice Milk", replaces: "dairy", category: "beverages" },
  { id: "olive-oil", name: "Olive Oil", replaces: "butter", category: "fats" },
  { id: "avocado-oil", name: "Avocado Oil", replaces: "butter", category: "fats" },
  { id: "coconut-oil", name: "Coconut Oil", replaces: "butter", category: "fats" },
  { id: "gluten-free-flour", name: "Gluten-Free Flour", replaces: "wheat", category: "baking" },
  { id: "rice-flour", name: "Rice Flour", replaces: "wheat", category: "baking" },
  { id: "almond-flour", name: "Almond Flour", replaces: "wheat", category: "baking" },
  { id: "coconut-aminos", name: "Coconut Aminos", replaces: "soy-sauce", category: "condiments" },
  { id: "sunflower-butter", name: "Sunflower Butter", replaces: "peanut-butter", category: "spreads" },
  { id: "tahini", name: "Tahini", replaces: "peanut-butter", category: "spreads" },
];

/**
 * Get safe alternatives for a specific allergen ID
 */
export function getSafeAlternativesFor(allergenId: string): string[] {
  const alternativeMap: Record<string, string[]> = {
    "dairy": ["Oat Milk", "Almond Milk", "Coconut Milk", "Hemp Milk", "Rice Milk", "Cashew Milk"],
    "sds": ["SLS-free shampoo", "Castile soap", "Natural cleansers", "Sulfate-free products"],
    "croscarmellose": ["Gelatin capsules", "Liquid medications", "Compounded formulas"],
    "fragrance": ["Fragrance-free products", "Essential oils (patch tested)", "Unscented alternatives"],
    "wenge": ["Oak", "Maple", "Bamboo", "Pine"],
    "pla": ["Glass containers", "Stainless steel", "Natural fiber materials"],
    "crunchy-texture": ["Soft foods", "Pureed options", "Smooth textures"],
  };
  
  return alternativeMap[allergenId] || ["Contact your healthcare provider for alternatives"];
}
