"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { nftSchema } from "@/lib/schemas"

// This is a mock function. In a real-world scenario, you'd interact with the blockchain here.
async function mintNFTOnBlockchain(userId: string, cardId: string): Promise<{ txHash: string; tokenId: string }> {
  // Simulate blockchain interaction
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return {
    txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    tokenId: Math.floor(Math.random() * 1000000).toString(),
  }
}

export async function mintNFT(userId: string, cardId: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Mint NFT on the blockchain (mock function)
    const { txHash, tokenId } = await mintNFTOnBlockchain(userId, cardId)

    // Get the business card details
    const { data: card, error: cardError } = await supabase
      .from("business_cards")
      .select("name")
      .eq("id", cardId)
      .single()

    if (cardError) throw cardError

    // Create NFT data
    const nftData = {
      name: `${card.name} NFT`,
      txHash,
      tokenId,
    }

    // Validate NFT data
    const validatedNFTData = nftSchema.parse(nftData)

    // Store the minted NFT in Supabase
    const { data, error } = await supabase
      .from("nfts")
      .insert({
        user_id: userId,
        card_id: cardId,
        name: validatedNFTData.name,
        tx_hash: validatedNFTData.txHash,
        token_id: validatedNFTData.tokenId,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/dashboard")
    return { success: true, nft: data }
  } catch (error) {
    console.error("Error minting NFT:", error)
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" }
  }
}

