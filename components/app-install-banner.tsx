"use client"

import { useState, useEffect } from "react"
import { X, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AppInstallBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Check if the app is already installed
    const isAppInstalled = window.matchMedia("(display-mode: standalone)").matches
    setIsStandalone(isAppInstalled)

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(iOS)

    // Detect Android
    const android = /Android/.test(navigator.userAgent)
    setIsAndroid(android)

    // Listen for the beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      // Only show the banner if on mobile and not already installed
      if ((iOS || android) && !isAppInstalled) {
        // Check if user has dismissed the banner before
        const dismissed = localStorage.getItem("app-install-banner-dismissed")
        if (!dismissed) {
          setShowBanner(true)
        }
      }
    })

    // Clean up
    return () => {
      window.removeEventListener("beforeinstallprompt", () => {})
    }
  }, [])

  const dismissBanner = () => {
    setShowBanner(false)
    localStorage.setItem("app-install-banner-dismissed", "true")
  }

  const installApp = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null)

    // Hide the banner
    dismissBanner()
  }

  if (!showBanner || isStandalone) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 shadow-lg z-50 border-t">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-medium">Install CardChain App</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isIOS ? "Tap the share button and select 'Add to Home Screen'" : "Install our app for a better experience"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isIOS && deferredPrompt && (
            <Button variant="default" size="sm" onClick={installApp}>
              <Download className="h-4 w-4 mr-2" />
              Install
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={dismissBanner}>
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

