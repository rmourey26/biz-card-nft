import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"
import { decode } from "base64-arraybuffer"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateBusinessCard(userId: string, cardData: any) {
  try {
    // Generate the business card image using DALL-E
    const response = await openai.images.generate({
      prompt: `Create a professional business card design for ${cardData.name} working at ${cardData.company}. The card should include their name, company name, and a modern, sleek design.`,
      n: 1,
      size: "1024x512",
      response_format: "b64_json",
    })

    const image_b64 = response.data[0].b64_json

    if (!image_b64) {
      throw new Error("Failed to generate image")
    }

    // Save the image to Supabase Storage
    const { data, error } = await supabase.storage
      .from("business-cards")
      .upload(`${userId}/${cardData.id}.png`, decode(image_b64), {
        contentType: "image/png",
      })

    if (error) throw error

    // Get the public URL of the saved image
    const {
      data: { publicUrl },
    } = supabase.storage.from("business-cards").getPublicUrl(`${userId}/${cardData.id}.png`)

    // Update the business card record with the image URL
    const { data: updatedCard, error: updateError } = await supabase
      .from("business_cards")
      .update({ image_url: publicUrl })
      .eq("id", cardData.id)
      .select()
      .single()

    if (updateError) throw updateError

    return updatedCard
  } catch (error) {
    console.error("Error generating business card:", error)
    throw error
  }
}

