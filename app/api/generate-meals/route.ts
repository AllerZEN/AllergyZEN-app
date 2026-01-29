import { generateObject } from "ai"
import { z } from "zod"

const mealSchema = z.object({
  name: z.string().describe("Creative name for the meal"),
  ingredients: z.array(z.string()).describe("List of 4-6 main ingredients used"),
  description: z.string().describe("Brief 1-sentence description of the dish"),
})

const mealPlanSchema = z.object({
  breakfast: mealSchema,
  lunch: mealSchema,
  dinner: mealSchema,
})

export async function POST(req: Request) {
  const { greenList } = await req.json()

  const safeIngredients = greenList.map((f: { name: string }) => f.name).join(", ")

  const { object } = await generateObject({
    model: "openai/gpt-4o-mini",
    schema: mealPlanSchema,
    prompt: `You are a chef specializing in allergy-friendly cooking. Create a full day's meal plan using ONLY these safe ingredients: ${safeIngredients}

IMPORTANT RULES:
- ONLY use ingredients from the safe list provided
- NO dairy, rice, wheat/gluten, coconut, almonds, walnuts, sesame, or sunflower
- Make meals nutritious, balanced, and appetizing
- Use olive oil for cooking (safe)
- Be creative with combinations

Generate breakfast, lunch, and dinner with varied proteins and vegetables.`,
  })

  return Response.json(object)
}
