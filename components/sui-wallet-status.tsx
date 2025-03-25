"use client"

import { useWalletKit } from "@mysten/wallet-kit"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export function SuiWalletStatus() {
  const { currentAccount, connect, disconnect } = useWalletKit()
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()

  const handleConnect = async () => {
    if (currentAccount) {
      disconnect()
      return
    }

    setIsConnecting(true)
    try {
      await connect()
      toast({
        title: "Wallet Connected",
        description: "Your Sui wallet has been connected successfully.",
      })
    } catch (error) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect your wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Button
      onClick={handleConnect}
      variant={currentAccount ? "outline" : "ghost"}
      size="sm"
      className="ml-2"
      disabled={isConnecting}
    >
      <Wallet className="mr-2 h-4 w-4" />
      {isConnecting
        ? "Connecting..."
        : currentAccount
          ? `${currentAccount.address.slice(0, 6)}...${currentAccount.address.slice(-4)}`
          : "Connect Wallet"}
    </Button>
  )
}

