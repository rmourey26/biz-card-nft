"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { generatePDF } from "@/lib/pdf"
import { createClient } from "@/lib/supabase"

interface DownloadPDFButtonProps {
  cardId: string
}

export function DownloadPDFButton({ cardId }: DownloadPDFButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User not authenticated")

      const pdfDataUri = await generatePDF(user.id, cardId)

      // Create a link element and trigger the download
      const link = document.createElement("a")
      link.href = pdfDataUri
      link.download = "business_card.pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "PDF Downloaded",
        description: "Your business card has been downloaded as a PDF.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error Generating PDF",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleDownload} disabled={isLoading}>
      {isLoading ? "Generating..." : "Download PDF"}
    </Button>
  )
}

