import { generateObject } from "ai"
import { z } from "zod"

const allergenInfoSchema = z.object({
  description: z.string().describe("A 2-3 sentence description of what this allergen is and why it causes reactions"),
  hiddenSources: z
    .array(z.string())
    .describe("6-10 common hidden sources or names this allergen appears under in food labels, products, or materials"),
  safeAlternatives: z.array(z.string()).describe("5-8 safe alternatives or substitutes for this allergen"),
})

export async function POST(req: Request) {
  const { allergenName, category } = await req.json()

  const { object } = await generateObject({
    model: "openai/gpt-4o-mini",
    schema: allergenInfoSchema,
    prompt: `You are an allergy specialist. Provide detailed information about the allergen "${allergenName}" (category: ${category}).
    
For hidden sources, think about:
- Alternative names on ingredient labels
- Processed foods that commonly contain it
- Unexpected products where it might appear
- For food: derivatives like maltodextrin (wheat), casein (dairy), etc.
- For chemicals: products that commonly contain them
- For fabrics: clothing items or treatments that use them

For safe alternatives, suggest:
- Direct substitutes that serve the same purpose
- Products that are naturally free of this allergen
- Brands or types that are generally safe`,
  })

  return Response.json(object)
}
