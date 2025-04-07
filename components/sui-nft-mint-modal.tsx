"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"

export function SuiNFTMintModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Mint NFT</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mint NFT</DialogTitle>
          <DialogDescription>NFT minting is currently disabled due to compatibility issues.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-500">Please try again later when the wallet integration is fixed.</p>
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

