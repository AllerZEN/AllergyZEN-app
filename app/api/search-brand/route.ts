import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { screenIngredientsWithProfile } from "@/lib/profile-aware-checker"

// Fetch from Open Food Facts API
async function searchOpenFoodFacts(query: string): Promise<
  {
    name: string
    brand: string
    image?: string
    ingredients: string[]
    barcode?: string
  }[]
> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`,
      { next: { revalidate: 3600 } },
    )

    if (!response.ok) return []

    const data = await response.json()

    if (!data.products || data.products.length === 0) return []

    return data.products
      .filter((p: Record<string, unknown>) => p.ingredients_text || p.ingredients_text_en)
      .map((product: Record<string, unknown>) => {
        const ingredientsText = (product.ingredients_text_en || product.ingredients_text || "") as string
        const ingredients = ingredientsText
          .split(/[,;]/)
          .map((i: string) => i.trim())
          .filter((i: string) => i.length > 0)

        return {
          name: (product.product_name || product.product_name_en || "Unknown Product") as string,
          brand: (product.brands || "Unknown Brand") as string,
          image: product.image_front_small_url as string | undefined,
          ingredients,
          barcode: product.code as string | undefined,
        }
      })
  } catch (error) {
    console.error("Open Food Facts API error:", error)
    return []
  }
}

// AI fallback search for ingredients
async function aiSearchIngredients(query: string): Promise<{
  name: string
  brand: string
  ingredients: string[]
} | null> {
  try {
    const { text } = await generateText({
      model: "anthropic/claude-sonnet-4-20250514",
      prompt: `You are a product ingredient database. For the product or brand "${query}", provide the most likely/common ingredients list.

Return ONLY a JSON object in this exact format (no markdown, no explanation):
{"name": "Product Name", "brand": "Brand Name", "ingredients": ["ingredient1", "ingredient2", ...]}

If you cannot find reliable ingredient information, return: {"name": "", "brand": "", "ingredients": []}

Focus on accuracy - list real, verified ingredients commonly found in this type of product.`,
    })

    const cleanedText = text.trim().replace(/```json\n?|\n?```/g, "")
    const result = JSON.parse(cleanedText)

    if (!result.name || result.ingredients.length === 0) {
      return null
    }

    return result
  } catch (error) {
    console.error("AI search error:", error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, userTriggers, userCategories } = await request.json()

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Default to empty array if no triggers provided (everything is safe)
    const triggers: string[] = userTriggers || []
    const categories: string[] = userCategories || []

    const results: {
      product: {
        name: string
        brand: string
        image?: string
        ingredients: string[]
        source: "openfoodfacts" | "ai"
        barcode?: string
      }
      status: "safe" | "danger" | "warning"
      redFlags: { ingredient: string; allergen: string; intensity: string; position: number }[]
      yellowFlags: { ingredient: string; reason: string; intensity?: string }[]
      fragranceWarning: boolean
    }[] = []

    const openFoodFactsResults = await searchOpenFoodFacts(query)

    for (const product of openFoodFactsResults) {
      const screening = screenIngredientsWithProfile(product.ingredients, triggers, categories)
      results.push({
        product: { ...product, source: "openfoodfacts" },
        ...screening,
      })
    }

    if (results.length === 0) {
      const aiResult = await aiSearchIngredients(query)
      if (aiResult) {
        const screening = screenIngredientsWithProfile(aiResult.ingredients, triggers, categories)
        results.push({
          product: { ...aiResult, source: "ai" },
          ...screening,
        })
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
