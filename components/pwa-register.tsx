"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCwIcon as Refresh } from "lucide-react"

export function PWARegister() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && window.workbox !== undefined) {
      // Register the service worker
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((reg) => {
          console.log("Service worker registered successfully", reg)
          setRegistration(reg)

          // Check if there's an update available
          reg.onupdatefound = () => {
            const installingWorker = reg.installing
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                  setIsUpdateAvailable(true)
                }
              }
            }
          }
        })
        .catch((error) => {
          console.error("Service worker registration failed:", error)
        })
    }
  }, [])

  const updateServiceWorker = () => {
    if (registration && registration.waiting) {
      // Send a message to the waiting service worker to skip waiting and become active
      registration.waiting.postMessage({ type: "SKIP_WAITING" })

      // Reload the page to load the new version
      window.location.reload()
    }
  }

  if (!isUpdateAvailable) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button onClick={updateServiceWorker} className="flex items-center gap-2">
        <Refresh className="h-4 w-4" />
        <span>Update Available</span>
      </Button>
    </div>
  )
}

