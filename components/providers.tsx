"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { WalletKitProvider } from "@mysten/wallet-kit"
import type { ReactNode } from "react"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <WalletKitProvider features={["sui:signAndExecuteTransaction"]}>{children}</WalletKitProvider>
    </ThemeProvider>
  )
}

