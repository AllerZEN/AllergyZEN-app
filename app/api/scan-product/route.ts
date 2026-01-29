import { generateText } from "ai"

export async function POST(req: Request) {
  const { image, productType } = await req.json()

  if (!image) {
    return Response.json({ error: "No image provided" }, { status: 400 })
  }

  const systemPrompt = `You are an expert ingredient analyzer for allergy management. 
Your task is to extract ALL text from product labels, especially ingredient lists.

For ${productType} products, be extra thorough in finding:
${productType === "medication" ? "- Active ingredients\n- Inactive ingredients\n- Fillers and binders like Talc, PVP, Povidone, Crospovidone, Lactose" : ""}
${productType === "food" ? "- Full ingredient list\n- May contain warnings\n- Hidden derivatives (maltodextrin, modified starch, etc.)" : ""}
${productType === "cleaning" ? "- All chemicals listed\n- Fragrance components\n- Warnings and cautions" : ""}

Return ONLY a JSON object with this exact structure:
{
  "productName": "detected product name or 'Unknown Product'",
  "ingredients": ["ingredient1", "ingredient2", ...],
  "warnings": ["any allergy warnings found"],
  "confidence": "high" | "medium" | "low"
}

Be thorough - extract every single ingredient you can read.`

  try {
    const result = await generateText({
      model: "anthropic/claude-sonnet-4-20250514",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt },
            { type: "image", image },
          ],
        },
      ],
    })

    // Parse the AI response
    const text = result.text
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return Response.json(parsed)
    }

    return Response.json({
      productName: "Unknown Product",
      ingredients: [],
      warnings: ["Could not parse ingredients from image"],
      confidence: "low",
    })
  } catch (error) {
    console.error("Scan error:", error)
    return Response.json({ error: "Failed to analyze image" }, { status: 500 })
  }
}
