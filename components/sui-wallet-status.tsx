"use client"

import { Button } from "@/components/ui/button"

export function SuiWalletStatus() {
  return (
    <div className="flex flex-col gap-2 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">Wallet Status</h3>
      <p className="text-sm text-gray-500">Wallet connection is currently disabled due to compatibility issues.</p>
      <Button variant="outline" className="mt-2" disabled>
        Connect Wallet
      </Button>
    </div>
  )
}

