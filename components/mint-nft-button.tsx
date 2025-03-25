"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { mintNFT } from "@/app/actions/nft"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface MintNFTButtonProps {
  userId: string
  profileId: string
  name: string
  className?: string
}

export function MintNFTButton({ userId, profileId, name, className }: MintNFTButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleMint = async () => {
    setIsLoading(true)
    try {
      const result = await mintNFT({ userId, profileId, name })
      if (result.success) {
        toast({
          title: "NFT Minted",
          description: "Your NFT has been successfully minted!",
        })
      } else {
        toast({
          title: "Minting Failed",
          description: result.error || "Failed to mint NFT. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error minting NFT:", error)
      toast({
        title: "Minting Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleMint} disabled={isLoading} className={className}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Minting...
        </>
      ) : (
        "Mint NFT"
      )}
    </Button>
  )
}

