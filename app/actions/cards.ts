"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCards() {
  const supabase = createServerSupabaseClient()
  const { data: cards, error } = await supabase
    .from("business_cards")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching cards:", error)
    throw error
  }

  return cards
}

export async function createCard(cardData: any) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("business_cards").insert(cardData).select().single()

  if (error) {
    console.error("Error creating card:", error)
    throw error
  }

  revalidatePath("/cards")
  return data
}

export async function updateCard(cardId: string, cardData: any) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("business_cards").update(cardData).eq("id", cardId).select().single()

  if (error) {
    console.error("Error updating card:", error)
    throw error
  }

  revalidatePath("/cards")
  return data
}

export async function deleteCard(cardId: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from("business_cards").delete().eq("id", cardId)

  if (error) {
    console.error("Error deleting card:", error)
    throw error
  }

  revalidatePath("/cards")
}

