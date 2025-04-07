"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"

export function ConnectWalletButton() {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      // Simplified wallet connection logic
      alert("Wallet connection is currently disabled due to compatibility issues. Please try again later.")
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Button onClick={handleConnect} disabled={isConnecting} variant="outline" className="w-full">
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}

