export interface SafeAlternative {
  name: string
  brand: string
  description: string
  whyItsSafe: string
  imageQuery?: string
  purchaseUrl?: string
}

export interface ProductAlternatives {
  triggers: string[]
  category: "food" | "cleaning" | "beauty" | "medication"
  alternatives: SafeAlternative[]
}

// Database of safe alternatives for common triggering products
export const safeAlternativesDatabase: Record<string, ProductAlternatives> = {
  // Food Products
  nutella: {
    triggers: ["dairy", "milk", "skim milk powder"],
    category: "food",
    alternatives: [
      {
        name: "Nocciolata Dairy-Free",
        brand: "Rigoni di Asiago",
        description: "Organic hazelnut spread made without dairy",
        whyItsSafe: "Uses rice milk instead of dairy, certified dairy-free",
        imageQuery: "rigoni nocciolata dairy free spread",
      },
      {
        name: "Justin's Chocolate Hazelnut Butter",
        brand: "Justin's",
        description: "Organic chocolate hazelnut spread",
        whyItsSafe: "Dairy-free, uses sustainably sourced ingredients",
        imageQuery: "justins chocolate hazelnut butter",
      },
      {
        name: "Artisana Hazelnut Cacao Spread",
        brand: "Artisana",
        description: "Raw organic hazelnut spread with cacao",
        whyItsSafe: "Dairy-free, no refined sugars, minimal ingredients",
        imageQuery: "artisana hazelnut cacao spread",
      },
    ],
  },

  dove: {
    triggers: ["fragrance", "parfum", "sodium lauryl sulfate"],
    category: "beauty",
    alternatives: [
      {
        name: "Pure-Castile Soap",
        brand: "Dr. Bronner's",
        description: "Organic, fair trade, 18-in-1 pure castile soap",
        whyItsSafe: "No synthetic fragrances, no detergents, certified organic",
        imageQuery: "dr bronners pure castile soap unscented",
      },
      {
        name: "Sensitive Skin Bar",
        brand: "Vanicream",
        description: "Fragrance-free cleansing bar for sensitive skin",
        whyItsSafe: "Free from dyes, fragrance, parabens, and lanolin",
        imageQuery: "vanicream cleansing bar sensitive",
      },
      {
        name: "Baby Dove Sensitive Moisture",
        brand: "Dove Baby",
        description: "Fragrance-free baby wash for sensitive skin",
        whyItsSafe: "Hypoallergenic, fragrance-free, pH neutral",
        imageQuery: "baby dove sensitive moisture fragrance free",
      },
    ],
  },

  tide: {
    triggers: ["fragrance", "optical brighteners", "synthetic surfactants"],
    category: "cleaning",
    alternatives: [
      {
        name: "Free & Clear Laundry Detergent",
        brand: "Seventh Generation",
        description: "Plant-based, fragrance-free laundry detergent",
        whyItsSafe: "No dyes, no synthetic fragrances, hypoallergenic",
        imageQuery: "seventh generation free clear laundry",
      },
      {
        name: "Sensitive Skin Detergent",
        brand: "All Free Clear",
        description: "Dermatologist recommended for sensitive skin",
        whyItsSafe: "100% free of perfumes and dyes",
        imageQuery: "all free clear sensitive laundry detergent",
      },
      {
        name: "Laundry Detergent Sheets",
        brand: "Earth Breeze",
        description: "Eco-friendly, plastic-free detergent sheets",
        whyItsSafe: "Fragrance-free option, no harsh chemicals",
        imageQuery: "earth breeze laundry sheets fragrance free",
      },
    ],
  },

  cheerios: {
    triggers: ["wheat", "oat", "barley"],
    category: "food",
    alternatives: [
      {
        name: "Gorilla Munch",
        brand: "Nature's Path",
        description: "Organic corn puffs cereal",
        whyItsSafe: "Gluten-free, corn-based, no wheat or oats",
        imageQuery: "natures path gorilla munch cereal",
      },
      {
        name: "Puffins Original",
        brand: "Barbara's",
        description: "Crunchy corn cereal",
        whyItsSafe: "Wheat-free, made with corn",
        imageQuery: "barbaras puffins original cereal",
      },
      {
        name: "LOVE Crunch",
        brand: "Nature's Path",
        description: "Organic granola (check specific variety)",
        whyItsSafe: "Multiple varieties available, some gluten-free",
        imageQuery: "natures path love crunch granola",
      },
    ],
  },

  oreo: {
    triggers: ["wheat", "flour", "dairy", "milk"],
    category: "food",
    alternatives: [
      {
        name: "Creme Filled Cookies",
        brand: "Partake",
        description: "Vegan, gluten-free chocolate sandwich cookies",
        whyItsSafe: "Free from top 9 allergens including wheat and dairy",
        imageQuery: "partake chocolate creme cookies",
      },
      {
        name: "Chocolate O's",
        brand: "Back to Nature",
        description: "Classic sandwich cookies",
        whyItsSafe: "Check label - some varieties are dairy-free",
        imageQuery: "back to nature chocolate os cookies",
      },
      {
        name: "Joe-Joe's (Check Label)",
        brand: "Trader Joe's",
        description: "Sandwich cookies - verify ingredients",
        whyItsSafe: "Some seasonal varieties are dairy-free",
        imageQuery: "trader joes joe joes cookies",
      },
    ],
  },

  // Skincare Products
  cetaphil: {
    triggers: ["propylene glycol", "parabens", "fragrance"],
    category: "beauty",
    alternatives: [
      {
        name: "Gentle Cleanser",
        brand: "Vanicream",
        description: "Free and clear gentle facial cleanser",
        whyItsSafe: "No dyes, fragrance, parabens, or formaldehyde releasers",
        imageQuery: "vanicream gentle facial cleanser",
      },
      {
        name: "Ultra Gentle Cleanser",
        brand: "Neutrogena",
        description: "Fragrance-free, soap-free cleanser",
        whyItsSafe: "Dermatologist tested, fragrance-free",
        imageQuery: "neutrogena ultra gentle cleanser fragrance free",
      },
    ],
  },

  nivea: {
    triggers: ["fragrance", "parfum", "lanolin", "mineral oil"],
    category: "beauty",
    alternatives: [
      {
        name: "Moisturizing Skin Cream",
        brand: "Vanicream",
        description: "Non-greasy, fragrance-free moisturizer",
        whyItsSafe: "Free from dyes, fragrance, lanolin, parabens",
        imageQuery: "vanicream moisturizing skin cream",
      },
      {
        name: "Daily Moisturizing Lotion",
        brand: "CeraVe",
        description: "Fragrance-free with ceramides",
        whyItsSafe: "Developed with dermatologists, fragrance-free",
        imageQuery: "cerave daily moisturizing lotion",
      },
    ],
  },

  // Cleaning Products
  clorox: {
    triggers: ["chlorine bleach", "fragrance", "sodium hypochlorite"],
    category: "cleaning",
    alternatives: [
      {
        name: "Disinfecting Multi-Surface Cleaner",
        brand: "Seventh Generation",
        description: "Botanical disinfectant",
        whyItsSafe: "No chlorine bleach, thymol-based, fragrance options",
        imageQuery: "seventh generation disinfecting cleaner",
      },
      {
        name: "Multi-Surface Everyday Cleaner",
        brand: "Branch Basics",
        description: "Concentrate-based non-toxic cleaner",
        whyItsSafe: "Fragrance-free, plant and mineral-based",
        imageQuery: "branch basics concentrate cleaner",
      },
    ],
  },

  lysol: {
    triggers: ["fragrance", "quaternary ammonium compounds", "ethanol"],
    category: "cleaning",
    alternatives: [
      {
        name: "Disinfectant Spray",
        brand: "Force of Nature",
        description: "Electrolyzed water cleaner",
        whyItsSafe: "Made from salt, water, vinegar - no toxic chemicals",
        imageQuery: "force of nature disinfectant spray",
      },
      {
        name: "Disinfecting Wipes",
        brand: "Seventh Generation",
        description: "Botanical disinfecting wipes",
        whyItsSafe: "Fragrance-free option available, no harsh chemicals",
        imageQuery: "seventh generation disinfecting wipes",
      },
    ],
  },

  // Medications/Supplements
  tylenol: {
    triggers: ["corn starch", "cellulose", "povidone"],
    category: "medication",
    alternatives: [
      {
        name: "Pure Encapsulations Acetaminophen",
        brand: "Pure Encapsulations",
        description: "Hypoallergenic acetaminophen",
        whyItsSafe: "Free from many common allergens and fillers",
        imageQuery: "pure encapsulations supplements",
      },
    ],
  },

  advil: {
    triggers: ["corn starch", "lactose", "titanium dioxide"],
    category: "medication",
    alternatives: [
      {
        name: "Liquid-Filled Ibuprofen",
        brand: "Advil Liqui-Gels",
        description: "Liquid-filled capsules with fewer fillers",
        whyItsSafe: "Fewer inactive ingredients than tablets",
        imageQuery: "advil liqui gels ibuprofen",
      },
    ],
  },
}

// Generic alternatives by category for products not in database
export const genericAlternatives: Record<string, SafeAlternative[]> = {
  food: [
    {
      name: "Whole Foods 365 Brand",
      brand: "Whole Foods",
      description: "Store brand with cleaner ingredient lists",
      whyItsSafe: "Often has fewer additives, check labels",
    },
    {
      name: "Thrive Market Products",
      brand: "Thrive Market",
      description: "Curated clean-ingredient products",
      whyItsSafe: "Focus on allergen-friendly options",
    },
  ],
  beauty: [
    {
      name: "Vanicream Products",
      brand: "Vanicream",
      description: "Full line of sensitive skin products",
      whyItsSafe: "Free from common irritants and allergens",
    },
    {
      name: "Free & Clear Line",
      brand: "Pharmaceutical Specialties",
      description: "Hair and skin care for sensitive individuals",
      whyItsSafe: "Dermatologist recommended, fragrance-free",
    },
  ],
  cleaning: [
    {
      name: "Seventh Generation Free & Clear",
      brand: "Seventh Generation",
      description: "Full line of fragrance-free cleaners",
      whyItsSafe: "Plant-based, no synthetic fragrances",
    },
    {
      name: "Branch Basics",
      brand: "Branch Basics",
      description: "Concentrate system for all cleaning needs",
      whyItsSafe: "Non-toxic, fragrance-free, minimal ingredients",
    },
  ],
  medication: [
    {
      name: "Consult with Pharmacist",
      brand: "Compounding Pharmacy",
      description: "Custom compounded medications",
      whyItsSafe: "Can be made without specific fillers/binders",
    },
  ],
}

// Function to get alternatives for a product
export function getAlternativesForProduct(
  productName: string,
  category?: "food" | "cleaning" | "beauty" | "medication",
): SafeAlternative[] {
  const normalizedName = productName.toLowerCase().trim()

  // Check for exact or partial match in database
  for (const [key, data] of Object.entries(safeAlternativesDatabase)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return data.alternatives
    }
  }

  // Return generic alternatives for the category
  if (category && genericAlternatives[category]) {
    return genericAlternatives[category]
  }

  // Default to beauty/cleaning generics if no category specified
  return genericAlternatives.beauty
}

// Detect product category from name/ingredients
export function detectProductCategory(
  productName: string,
  ingredients: string[] = [],
): "food" | "cleaning" | "beauty" | "medication" {
  const name = productName.toLowerCase()
  const allText = [name, ...ingredients.map((i) => i.toLowerCase())].join(" ")

  const foodKeywords = [
    "cereal",
    "chocolate",
    "cookie",
    "bread",
    "milk",
    "cream",
    "spread",
    "sauce",
    "snack",
    "bar",
    "chips",
  ]
  const cleaningKeywords = ["detergent", "cleaner", "wipes", "spray", "bleach", "soap", "dish", "laundry", "disinfect"]
  const beautyKeywords = [
    "lotion",
    "shampoo",
    "conditioner",
    "moisturizer",
    "cream",
    "body wash",
    "soap",
    "deodorant",
    "sunscreen",
  ]
  const medicationKeywords = [
    "tablet",
    "capsule",
    "mg",
    "medicine",
    "supplement",
    "vitamin",
    "pain relief",
    "ibuprofen",
    "acetaminophen",
  ]

  if (medicationKeywords.some((k) => allText.includes(k))) return "medication"
  if (cleaningKeywords.some((k) => allText.includes(k))) return "cleaning"
  if (beautyKeywords.some((k) => allText.includes(k))) return "beauty"
  if (foodKeywords.some((k) => allText.includes(k))) return "food"

  return "food" // default
}
