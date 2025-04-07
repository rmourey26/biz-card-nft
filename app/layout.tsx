import type React from "react"
import type { Metadata, Viewport } from "next"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "Digital Business Card NFT",
  description: "Create and mint your digital business card as an NFT",
  generator: "v0.dev",
  manifest: "/manifest",
  applicationName: "CardChain",
  appleWebApp: {
    capable: true,
    title: "CardChain",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "CardChain",
    title: "CardChain - Digital Business Cards",
    description: "Create and mint your digital business card as an NFT",
  },
}

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CardChain" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="CardChain" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}



import './globals.css'