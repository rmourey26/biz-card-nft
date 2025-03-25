"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createSuiClient, SNS_PACKAGE_ID, SNS_REGISTRY_ID } from "@/lib/sui-client"
import { TransactionBlock } from "@mysten/sui.js/transactions"
import { revalidatePath } from "next/cache"

export async function mintSuiNFT({
  profileId,
  name,
  description,
  imageUrl,
}: {
  profileId: string
  name: string
  description: string
  imageUrl: string
}) {
  const supabase = createServerSupabaseClient()

  try {
    // Get the profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .single()

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError)
      return { success: false, error: "Failed to fetch profile" }
    }

    // Create a Sui client
    const suiClient = createSuiClient()

    // Create a transaction block
    const tx = new TransactionBlock()

    // Mint the NFT
    // This is a simplified example - replace with your actual contract call
    const [nft] = tx.moveCall({
      target: `${SNS_PACKAGE_ID}::nft::mint`,
      arguments: [tx.pure(name), tx.pure(description), tx.pure(imageUrl), tx.object(SNS_REGISTRY_ID)],
    })

    // Execute the transaction
    const result = await suiClient.dryRunTransactionBlock({
      transactionBlock: tx,
    })

    console.log("Minted NFT (dry run):", result)

    // In a real implementation, you would execute the transaction
    // const result = await suiClient.signAndExecuteTransactionBlock({
    //   transactionBlock: tx,
    // })

    // For demo purposes, generate a fake object ID
    const objectId = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`

    // Save the NFT to the database
    const { data: nftData, error: nftError } = await supabase
      .from("sui_nfts")
      .insert({
        profile_id: profileId,
        user_id: profile.user_id,
        name,
        object_id: objectId,
        tx_digest: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
        image_url: imageUrl,
      })
      .select()
      .single()

    if (nftError) {
      console.error("Error saving NFT:", nftError)
      return { success: false, error: "Failed to save NFT" }
    }

    revalidatePath("/dashboard")
    return { success: true, nft: nftData }
  } catch (error) {
    console.error("Error in mintSuiNFT:", error)
    return {
      success: false,
      error: "An unexpected error occurred while minting your NFT",
    }
  }
}

