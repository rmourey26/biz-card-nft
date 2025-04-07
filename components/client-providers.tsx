"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { ReactQueryClientProvider } from "@/components/providers/query-provider"
import type { ReactNode } from "react"

interface ClientProvidersProps {
  children: ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ReactQueryClientProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </ReactQueryClientProvider>
  )
}

