"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { businessCardSchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"
import { getImageColors } from "@/lib/imageAnalysis"
import { createCard } from "./cards"

function extractJSONFromText(text: string): object | null {
  const jsonRegex = /{[\s\S]*}/
  const match = text.match(jsonRegex)
  if (match) {
    try {
      return JSON.parse(match[0])
    } catch (error) {
      console.error("Failed to parse JSON:", error)
    }
  }
  return null
}

export async function generateBusinessCard(userId: string, businesscardName: string, style: string) {
  const supabase = createServerSupabaseClient()

  try {
    console.log("Generating business card for user:", userId, "with name:", businesscardName, "and style:", style)

    // First, get the user profile data
    const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      throw new Error(`Failed to fetch user profile: ${profileError.message}`)
    }

    if (!profile) {
      throw new Error("User profile not found")
    }

    // Analyze the company logo if available
    let logoColors = []
    if (profile.company_logo_url) {
      try {
        logoColors = await getImageColors(profile.company_logo_url)
      } catch (error) {
        console.error("Error analyzing logo colors:", error)
        // Continue with default colors if analysis fails
      }
    }

    // Prepare the prompt for OpenAI
    const prompt = `Generate a business card design in JSON format with the following properties:
      - businesscard_name: "${businesscardName}"
      - style: an object containing:
        - backgroundColor: a suitable hex color for the background
        - textColor: a suitable hex color for the text
        - primaryColor: a suitable hex color for primary elements
      
      The response should be valid JSON only, with no additional text.
      
      The style should be "${style}" themed.
      ${logoColors.length > 0 ? `Incorporate these colors from the company logo: ${logoColors.join(", ")}` : ""}
      ${profile.company_logo_url ? `The card should complement this company logo: ${profile.company_logo_url}` : ""}
      Consider the company name "${profile.company}" and industry when designing the card.
      Ensure the design is professional and aligns with the company's branding.`

    console.log("Sending prompt to OpenAI:", prompt)

    // Generate card style with text model
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
      temperature: 0.7,
    })

    console.log("AI generated text:", text)

    // Extract JSON from the generated text
    const cardDataFromAI = extractJSONFromText(text)
    if (!cardDataFromAI) {
      throw new Error("Failed to extract valid JSON from AI response")
    }

    console.log("Parsed card data:", cardDataFromAI)

    // Validate the card data and adapt to new schema
    const validatedCardData = businessCardSchema.parse({
      ...cardDataFromAI,
      name: cardDataFromAI.businesscard_name || businesscardName,
    })
    console.log("Validated card data:", validatedCardData)

    // Generate a background image using DALL-E
    const imagePrompt = `Create a business card background image for ${profile.company} in a ${style} style. The image should be subtle and not interfere with text readability.`
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
    })

    const backgroundImageUrl = imageResponse.data[0].url

    // Save the background image to Supabase storage
    const { data: imageData, error: imageError } = await supabase.storage
      .from("business-cards")
      .upload(`${userId}/${validatedCardData.name}.png`, await (await fetch(backgroundImageUrl)).arrayBuffer(), {
        contentType: "image/png",
      })

    if (imageError) {
      console.error("Error saving background image:", imageError)
      throw new Error("Failed to save background image")
    }

    // Get the public URL of the saved image
    const { data: publicUrlData } = supabase.storage
      .from("business-cards")
      .getPublicUrl(`${userId}/${validatedCardData.name}.png`)

    const cardData = {
      user_id: userId,
      businesscard_name: businesscardName,
      company_name: profile.company || "",
      website: profile.website || "",
      style: {
        ...validatedCardData.style,
        backgroundImage: publicUrlData.publicUrl,
      },
      image_url: publicUrlData.publicUrl,
    }

    const newCard = await createCard(cardData)

    revalidatePath("/dashboard")
    return { success: true, cardId: newCard.id }
  } catch (error) {
    console.error("Error generating business card with AI:", error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    } else {
      return { success: false, error: "An unexpected error occurred while generating the business card" }
    }
  }
}

export async function getBusinessCards(userId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("business_cards")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching business cards:", error)
    throw error
  }

  return data
}

export async function getBusinessCard(cardId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("business_cards").select("*, profiles(*)").eq("id", cardId).single()

  if (error) {
    console.error("Error fetching business card:", error)
    throw error
  }

  return data
}

export async function updateBusinessCardInfo(userId: string, cardId: string, formData: any) {
  const supabase = createServerSupabaseClient()

  try {
    // Validate input
    if (!userId || !cardId) {
      return { success: false, error: "Missing required parameters" }
    }

    // Ensure website has http/https prefix if provided
    let website = formData.website
    if (website && !website.startsWith("http")) {
      website = `https://${website}`
    }

    // Ensure LinkedIn URL has http/https prefix if provided
    let linkedinUrl = formData.linkedin_url
    if (linkedinUrl && !linkedinUrl.startsWith("http")) {
      linkedinUrl = `https://${linkedinUrl}`
    }

    // First, update the profile information
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        company: formData.company,
        job_title: formData.job_title || null,
        website: website,
        linkedin_url: linkedinUrl || null,
        avatar_url: formData.avatar_url || null,
        company_logo_url: formData.company_logo_url || null,
        xhandle: formData.xhandle || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (profileError) {
      console.error("Error updating profile:", profileError)
      return { success: false, error: "Failed to update profile information" }
    }

    // Then, update the business card with company-related information
    const { error: cardError } = await supabase
      .from("business_cards")
      .update({
        company_name: formData.company,
        website: website,
      })
      .eq("id", cardId)
      .eq("user_id", userId)

    if (cardError) {
      console.error("Error updating business card:", cardError)
      return { success: false, error: "Failed to update business card information" }
    }

    // Update user metadata as well
    try {
      await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          company: formData.company,
          job_title: formData.job_title || "",
          website: website,
          linkedin_url: linkedinUrl || "",
          avatar_url: formData.avatar_url || "",
          company_logo_url: formData.company_logo_url || "",
          xhandle: formData.xhandle || "",
        },
      })
    } catch (metadataError) {
      console.error("Error updating user metadata:", metadataError)
      // Continue even if metadata update fails
    }

    revalidatePath("/dashboard")
    revalidatePath(`/card/${cardId}`)

    return { success: true }
  } catch (error) {
    console.error("Error in updateBusinessCardInfo:", error)
    return {
      success: false,
      error: "An unexpected error occurred while updating your business card",
    }
  }
}

