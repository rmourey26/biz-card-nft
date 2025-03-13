import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getBusinessCardById } from "@/queries/business-card-by-id"
import BusinessCardComponent from "./BusinessCardComponent"
import { generateBusinessCard } from "@/lib/generate-business-card"

export const dynamic = "force-dynamic"

export default async function BusinessCardPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()

  try {
    let card = await getBusinessCardById(supabase, params.id)

    if (!card) {
      notFound()
    }

    // If the card doesn't have an image_url, generate one
    if (!card.image_url) {
      card = await generateBusinessCard(card.user_id, card)
    }

    // Check if the current user is the owner of the card
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const isOwner = user && user.id === card.user_id

    return <BusinessCardComponent card={card} isOwner={isOwner} />
  } catch (error) {
    console.error("Error fetching or generating business card:", error)
    notFound()
  }
}

