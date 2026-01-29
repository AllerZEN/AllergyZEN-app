export interface SymptomInsight {
  trigger: string
  keywords: string[]
  severity: "red" | "orange"
  description: string
  commonSymptoms: string[]
}

export const SYMPTOM_INSIGHTS: SymptomInsight[] = [
  // Red tier triggers
  {
    trigger: "Lactose",
    keywords: ["lactose", "dairy", "milk", "cream", "cheese", "whey", "casein", "butter"],
    severity: "red",
    description: "Commonly causes bloating, cramps, or digestive flare-ups.",
    commonSymptoms: ["Bloating", "Cramps", "Digestive discomfort", "Nausea"],
  },
  {
    trigger: "E223/Sulphites",
    keywords: ["e223", "sulphite", "sulfite", "sodium metabisulphite", "metabisulfite", "so2", "sulphur dioxide"],
    severity: "red",
    description: "May cause respiratory issues like a tight chest, wheezing, or coughing.",
    commonSymptoms: ["Tight chest", "Wheezing", "Coughing", "Shortness of breath"],
  },
  {
    trigger: "Wheat",
    keywords: ["wheat", "gluten", "flour", "bread", "semolina", "durum", "spelt", "seitan"],
    severity: "red",
    description: "Potential for skin irritation or digestive discomfort.",
    commonSymptoms: ["Skin irritation", "Digestive discomfort", "Bloating", "Fatigue"],
  },
  {
    trigger: "Rice",
    keywords: ["rice", "rice flour", "rice syrup", "rice bran", "rice milk", "rice starch"],
    severity: "red",
    description: "May cause digestive issues or skin reactions in sensitive individuals.",
    commonSymptoms: ["Digestive upset", "Skin rash", "Itching", "Nausea"],
  },
  {
    trigger: "Coconut",
    keywords: ["coconut", "coconut oil", "coconut milk", "coconut cream", "coco", "mct"],
    severity: "red",
    description: "Can trigger skin reactions, digestive issues, or respiratory symptoms.",
    commonSymptoms: ["Skin irritation", "Hives", "Stomach pain", "Nausea"],
  },
  {
    trigger: "Almonds",
    keywords: ["almond", "almond flour", "almond milk", "almond oil", "marzipan"],
    severity: "red",
    description: "Tree nut sensitivity may cause oral or systemic reactions.",
    commonSymptoms: ["Oral itching", "Swelling", "Hives", "Digestive upset"],
  },
  {
    trigger: "Sesame",
    keywords: ["sesame", "tahini", "sesame oil", "sesame seed"],
    severity: "red",
    description: "Can cause skin reactions and potentially severe allergic responses.",
    commonSymptoms: ["Skin rash", "Hives", "Itching", "Swelling"],
  },
  {
    trigger: "Sunflower",
    keywords: ["sunflower", "sunflower oil", "sunflower seed", "sunflower lecithin"],
    severity: "red",
    description: "May cause skin irritation or digestive discomfort.",
    commonSymptoms: ["Skin rash", "Digestive issues", "Itching"],
  },
  // Orange tier triggers
  {
    trigger: "Corn",
    keywords: ["corn", "maize", "corn starch", "corn syrup", "cornflakes", "popcorn"],
    severity: "orange",
    description: "May cause mild digestive sensitivity in some individuals.",
    commonSymptoms: ["Mild bloating", "Digestive discomfort"],
  },
  {
    trigger: "Fragrance",
    keywords: ["fragrance", "parfum", "perfume", "scent"],
    severity: "orange",
    description: "Undisclosed chemicals may trigger respiratory or skin reactions.",
    commonSymptoms: ["Headache", "Skin irritation", "Respiratory sensitivity"],
  },
]

export function getSymptomInsight(ingredient: string): SymptomInsight | null {
  const lowerIngredient = ingredient.toLowerCase()

  for (const insight of SYMPTOM_INSIGHTS) {
    if (insight.keywords.some((keyword) => lowerIngredient.includes(keyword))) {
      return insight
    }
  }

  return null
}

export function getSymptomInsightByAllergen(allergen: string): SymptomInsight | null {
  const lowerAllergen = allergen.toLowerCase()

  return (
    SYMPTOM_INSIGHTS.find(
      (insight) =>
        insight.trigger.toLowerCase() === lowerAllergen ||
        insight.keywords.some((keyword) => lowerAllergen.includes(keyword)),
    ) || null
  )
}
