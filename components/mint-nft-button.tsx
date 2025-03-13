"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { mintNFT } from "@/app/actions/nft"

interface MintNFTButtonProps {
  userId: string
  cardId: string
}

export function MintNFTButton({ userId, cardId }: MintNFTButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleMint = async () => {
    setIsLoading(true)
    try {
      const result = await mintNFT(userId, cardId)
      if (result.success) {
        toast({
          title: "NFT Minted Successfully",
          description: `Your business card has been minted as an NFT on the Base blockchain. Transaction hash: ${result.nft.tx_hash}`,
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error minting NFT:", error)
      toast({
        title: "Error Minting NFT",
        description: error instanceof Error ? error.message : "There was an error minting your NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleMint} disabled={isLoading}>
      {isLoading ? "Minting..." : "Mint as NFT"}
    </Button>
  )
}

