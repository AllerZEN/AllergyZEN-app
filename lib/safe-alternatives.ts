"use client"

// The Master 5-Color Spectrum Type
export type ZenSpectrumColor = "🔴" | "🟠" | "🟤" | "🟢" | "💙";

export interface SafeAlternative {
  id: string
  name: string
  brand: string
  description: string
  whyItsSafe: string
  imageQuery?: string
  purchaseUrl?: string
  colorCode: "🟢" // Alternatives themselves should always be the Green result
}

export interface ProductAlternatives {
  triggers: string[]
  category: "food" | "cleaning" | "beauty" | "medication" | "laboratory"
  alternatives: SafeAlternative[]
}

export const safeAlternativesDatabase: Record<string, ProductAlternatives> = {
  // Medicinal Excipients
  tylenol: {
    triggers: ["corn starch", "croscarmellose sodium", "povidone"],
    category: "medication",
    alternatives: [
      {
        id: "alt-1",
        name: "Excipient-Free Acetaminophen",
        brand: "Custom Compound",
        description: "Compounded without fillers like croscarmellose sodium",
        whyItsSafe: "Eliminates hidden medicinal triggers",
        colorCode: "🟢"
      }
    ]
  },
  // Laboratory Chemicals
  "sds-solution": {
    triggers: ["sodium dodecyl sulfate", "detergent"],
    category: "laboratory",
    alternatives: [
      {
        id: "lab-1",
        name: "EDTA-Free Buffer",
        brand: "BioTech Clean",
        description: "Alternative lab stabilizer",
        whyItsSafe: "Removes SDS exposure risk",
        colorCode: "🟢"
      }
    ]
  },
  nutella: {
    triggers: ["dairy", "hazelnut"],
    category: "food",
    alternatives: [
      {
        id: "food-1",
        name: "Nocciolata Dairy-Free",
        brand: "Rigoni di Asiago",
        description: "Organic dairy-free spread",
        whyItsSafe: "Rice milk substitution",
        colorCode: "🟢"
      }
    ]
  }
}

/**
 * 2026 Master Logic: Determine immediate result color
 * Returns the exact emoji based on the 5-color rule.
 */
export function getZenStatus(
  productName: string, 
  userRisks: { red: string[], amber: string[], brown: string[], blue: string[] }
): ZenSpectrumColor {
  const normalizedName = productName.toLowerCase().trim();
  const productData = safeAlternativesDatabase[normalizedName];

  if (!productData) return "🟢";

  // Check priorities in order: Red -> Amber -> Brown -> Blue
  if (productData.triggers.some(t => userRisks.red.includes(t))) return "🔴";
  if (productData.triggers.some(t => userRisks.amber.includes(t))) return "🟠";
  if (productData.triggers.some(t => userRisks.brown.includes(t))) return "🟤";
  if (productData.triggers.some(t => userRisks.blue.includes(t))) return "💙";
  
  return "🟢"; 
}

export function getSafeTabContent(productName: string): SafeAlternative[] {
  const normalizedName = productName.toLowerCase().trim();
  return safeAlternativesDatabase[normalizedName]?.alternatives || [];
}

export function detectProductCategory(
  productName: string,
  ingredients: string[] = [],
): "food" | "cleaning" | "beauty" | "medication" | "laboratory" {
  const allText = [productName, ...ingredients].join(" ").toLowerCase();

  if (allText.match(/sds|edta|dmso|laboratory|reagent/)) return "laboratory";
  if (allText.match(/tablet|excipient|capsule|mg|medicine/)) return "medication";
  if (allText.match(/detergent|cleaner|soap|bleach/)) return "cleaning";
  if (allText.match(/lotion|shampoo|cream|beauty/)) return "beauty";
  
  return "food"; 
}
