"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { SuiWalletStatus } from "@/components/sui-wallet-status"
import { mintSuiNFT } from "@/app/actions/sui-actions"
import { saveSuiNFT } from "@/app/actions/nft"
import { useWallet } from "@suiet/wallet-kit"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { SUI_NETWORK } from "@/lib/sui-client"

interface SuiNFTMintModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  profileId: string
  userData?: {
    full_name?: string
    company?: string
    website?: string
    avatar_url?: string
  }
}

export function SuiNFTMintModal({ isOpen, onClose, userId, profileId, userData }: SuiNFTMintModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [nftName, setNftName] = useState(`${userData?.full_name || "My"} Business Card NFT`)
  const [nftDescription, setNftDescription] = useState(
    `Digital business card for ${userData?.full_name || "a professional"} at ${userData?.company || "company"}`,
  )
  const [nftImageUrl, setNftImageUrl] = useState(userData?.avatar_url || "")
  const [nftUrl, setNftUrl] = useState(userData?.website || "")
  const [mintedObjectId, setMintedObjectId] = useState<string | null>(null)
  const [mintingError, setMintingError] = useState<string | null>(null)

  const wallet = useWallet()

  useEffect(() => {
    if (userData) {
      setNftName(`${userData.full_name || "My"} Business Card NFT`)
      setNftDescription(
        `Digital business card for ${userData.full_name || "a professional"} at ${userData.company || "company"}`,
      )
      setNftImageUrl(userData.avatar_url || "")
      setNftUrl(userData.website || "")
    }
  }, [userData])

  const handleMint = async () => {
    if (!wallet.connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your Sui wallet first",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setMintingError(null)

    try {
      // Call the server action to mint the NFT
      const mintResult = await mintSuiNFT({
        name: nftName,
        description: nftDescription,
        url: nftUrl,
        imageUrl: nftImageUrl,
        walletAddress: wallet.account?.address || "",
      })

      if (mintResult.success) {
        setMintedObjectId(mintResult.objectId)
        // Save the NFT to the database
        const saveResult = await saveSuiNFT({
          userId,
          profileId,
          name: nftName,
          objectId: mintResult.objectId,
          txDigest: mintResult.txDigest,
          imageUrl: nftImageUrl,
        })

        if (saveResult.success) {
          toast({
            title: "NFT Minted",
            description: "Your NFT has been successfully minted on Sui!",
          })
          onClose()
        } else {
          setMintingError(saveResult.error || "NFT was minted but failed to save to your profile")
          toast({
            title: "Minting Incomplete",
            description: saveResult.error || "NFT was minted but failed to save to your profile",
            variant: "destructive",
          })
        }
      } else {
        setMintingError(mintResult.error || "Failed to mint NFT. Please try again.")
        toast({
          title: "Minting Failed",
          description: mintResult.error || "Failed to mint NFT. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error minting NFT:", error)
      setMintingError("An unexpected error occurred. Please try again.")
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mint Your Business Card as NFT on Sui</DialogTitle>
          <DialogDescription>Create a unique NFT of your business card on the Sui network.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!wallet.connected ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-center">Connect your Sui wallet to mint an NFT</p>
              <ConnectWalletButton />
            </div>
          ) : (
            <>
              <SuiWalletStatus />
              <div className="flex flex-col gap-2">
                <Label htmlFor="nft-name">NFT Name</Label>
                <Input
                  id="nft-name"
                  value={nftName}
                  onChange={(e) => setNftName(e.target.value)}
                  placeholder="Enter a name for your NFT"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="nft-description">Description</Label>
                <Input
                  id="nft-description"
                  value={nftDescription}
                  onChange={(e) => setNftDescription(e.target.value)}
                  placeholder="Enter a description for your NFT"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="nft-image">Image URL (optional)</Label>
                <Input
                  id="nft-image"
                  value={nftImageUrl}
                  onChange={(e) => setNftImageUrl(e.target.value)}
                  placeholder="Enter an image URL for your NFT"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="nft-url">Website URL (optional)</Label>
                <Input
                  id="nft-url"
                  value={nftUrl}
                  onChange={(e) => setNftUrl(e.target.value)}
                  placeholder="Enter a website URL for your NFT"
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          {wallet.connected && (
            <Button onClick={handleMint} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting...
                </>
              ) : (
                "Mint NFT"
              )}
            </Button>
          )}
          {mintedObjectId && (
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-sm text-green-500">
                NFT Minted!{" "}
                <a
                  href={`${SUI_NETWORK}/object/${mintedObjectId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  View on Sui Explorer
                </a>
              </p>
            </div>
          )}
          {mintingError && (
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-500">Error: {mintingError}</p>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

