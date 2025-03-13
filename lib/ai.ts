"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createServerClientForSSR } from "@/lib/supabase-server"
import { businessCardSchema } from "@/lib/schemas"

export async function generateBusinessCard(userId: string, name: string, style: string): Promise<string> {
  try {
    console.log("Generating business card for user:", userId, "with name:", name, "and style:", style)

    // Generate card design suggestions using AI
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Generate a business card design in JSON format with the following properties:
        - name: "${name}"
        - style: "${style}"
        - backgroundColor: a suitable hex color for the background
        - textColor: a suitable hex color for the text
        - primaryColor: a suitable hex color for primary elements
        
        The response should be valid JSON only, with no additional text.`,
      temperature: 0.7,
    })

    console.log("AI generated text:", text)

    // Parse the AI-generated JSON
    const cardData = JSON.parse(text)

    console.log("Parsed card data:", cardData)

    // Validate the card data
    const validatedCardData = businessCardSchema.parse(cardData)

    console.log("Validated card data:", validatedCardData)

    // Store the generated card in Supabase
    const supabase = await createServerClientForSSR()
    const { data, error } = await supabase
      .from("business_cards")
      .insert({
        user_id: userId,
        name: validatedCardData.name,
        style: validatedCardData.style,
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    console.log("Stored card data:", data)

    return data.id
  } catch (error) {
    console.error("Error generating business card with AI:", error)
    if (error instanceof Error) {
      throw new Error(`Failed to generate business card: ${error.message}`)
    } else {
      throw new Error("Failed to generate business card: Unknown error")
    }
  }
}

