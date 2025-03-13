"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { saveAs } from "file-saver"
import QRCode from "qrcode"
import { jsPDF } from "jspdf"
import {
  Mail,
  Globe,
  Briefcase,
  LayoutGridIcon as LayoutHorizontal,
  LayoutGridIcon as LayoutVertical,
  Linkedin,
  Twitter,
  BadgeCheck,
} from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { BusinessCardEditor } from "@/components/business-card-editor"
import { useRouter } from "next/navigation"

interface BusinessCardPreviewProps {
  card: {
    id: string
    businesscard_name: string
    company_name: string
    image_url: string
    style: {
      backgroundColor: string
      textColor: string
      primaryColor: string
      backgroundImage?: string
    }
    user_id: string
  }
  userData: {
    full_name: string
    company: string
    job_title?: string
    email: string
    website: string
    linkedin_url?: string
    avatar_url: string
    company_logo_url: string
    xhandle?: string
    waddress?: string
  }
  showEditor?: boolean
}

export function BusinessCardPreview({ card, userData, showEditor = true }: BusinessCardPreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isVertical, setIsVertical] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (card.image_url) {
      const img = new Image()
      img.onload = () => setImageLoaded(true)
      img.onerror = () => setImageLoaded(false)
      img.src = card.image_url
    }
  }, [card.image_url])

  // Generate vCard format for contact information
  const generateVCard = () => {
    let vCard = `BEGIN:VCARD
VERSION:3.0
FN:${userData.full_name}
ORG:${userData.company}
EMAIL:${userData.email}
URL:${userData.website}`

    if (userData.job_title) {
      vCard += `
TITLE:${userData.job_title}`
    }

    if (userData.linkedin_url) {
      vCard += `
X-SOCIALPROFILE;type=linkedin:${userData.linkedin_url}`
    }

    if (userData.xhandle) {
      vCard += `
X-SOCIALPROFILE;type=twitter:https://twitter.com/${userData.xhandle.replace("@", "")}`
    }

    vCard += `
END:VCARD`
    return vCard
  }

  const handleDownload = async () => {
    // Set PDF dimensions based on orientation
    const pdfOptions = isVertical
      ? { orientation: "portrait", unit: "mm", format: [51, 89] }
      : { orientation: "landscape", unit: "mm", format: [89, 51] }

    const pdf = new jsPDF(pdfOptions)

    // Create a canvas to draw the business card
    const canvas = document.createElement("canvas")

    // Set canvas dimensions based on orientation
    if (isVertical) {
      canvas.width = 510
      canvas.height = 890
    } else {
      canvas.width = 890
      canvas.height = 510
    }

    const ctx = canvas.getContext("2d")

    if (ctx) {
      // Draw background
      ctx.fillStyle = card.style.backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw background image if available
      if (imageLoaded && card.image_url) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        await new Promise((resolve) => {
          img.onload = resolve
          img.src = card.image_url
        })
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      }

      if (isVertical) {
        // Draw company logo at the top (banner style)
        if (userData.company_logo_url) {
          const logo = new Image()
          logo.crossOrigin = "anonymous"
          await new Promise((resolve) => {
            logo.onload = resolve
            logo.src = userData.company_logo_url
          })

          // Calculate aspect ratio to preserve the full logo
          const logoAspect = logo.width / logo.height
          let logoWidth = 510
          let logoHeight = logoWidth / logoAspect

          // If logo is too tall, adjust height and center horizontally
          if (logoHeight > 200) {
            logoHeight = 200
            logoWidth = logoHeight * logoAspect
            // Center horizontally
            const xOffset = (510 - logoWidth) / 2
            ctx.drawImage(logo, xOffset, 0, logoWidth, logoHeight)
          } else {
            // Center horizontally
            const xOffset = (510 - logoWidth) / 2
            // Center vertically within the 200px banner area
            const yOffset = (200 - logoHeight) / 2
            ctx.drawImage(logo, xOffset, yOffset, logoWidth, logoHeight)
          }

          // Add a gradient overlay to make text more readable
          const gradient = ctx.createLinearGradient(0, 0, 0, 200)
          gradient.addColorStop(0, "rgba(0,0,0,0.1)")
          gradient.addColorStop(1, "rgba(0,0,0,0.5)")
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, 510, 200)
        }

        // Draw avatar overlaying the top banner
        if (userData.avatar_url) {
          const avatar = new Image()
          avatar.crossOrigin = "anonymous"
          await new Promise((resolve) => {
            avatar.onload = resolve
            avatar.src = userData.avatar_url
          })
          // Position avatar to overlap the bottom of the banner
          ctx.save()
          ctx.beginPath()
          ctx.arc(120, 180, 80, 0, Math.PI * 2, true)
          ctx.closePath()
          ctx.clip()
          ctx.drawImage(avatar, 40, 100, 160, 160)
          ctx.restore()

          // Add a white border around the avatar
          ctx.strokeStyle = "white"
          ctx.lineWidth = 5
          ctx.beginPath()
          ctx.arc(120, 180, 80, 0, Math.PI * 2, true)
          ctx.closePath()
          ctx.stroke()
        }

        // Draw text
        ctx.fillStyle = card.style.textColor

        // Name
        ctx.font = "bold 32px Arial"
        ctx.textAlign = "left"
        ctx.fillText(userData.full_name, 40, 320)

        // Job Title
        if (userData.job_title) {
          ctx.font = "24px Arial"
          ctx.fillText(userData.job_title, 40, 360)
        }

        // Company
        ctx.font = "italic 24px Arial"
        ctx.fillText(userData.company, 40, userData.job_title ? 400 : 360)

        // Email
        ctx.font = "20px Arial"
        const emailY = userData.job_title ? 460 : 420
        ctx.fillText(userData.email, 40, emailY)

        // Website
        const websiteY = userData.job_title ? 500 : 460
        ctx.fillText(userData.website, 40, websiteY)

        // LinkedIn
        if (userData.linkedin_url) {
          const linkedinY = userData.job_title ? 540 : 500
          ctx.fillText(userData.linkedin_url, 40, linkedinY)
        }

        // X Handle
        if (userData.xhandle) {
          const xhandleY = userData.job_title ? (userData.linkedin_url ? 580 : 540) : userData.linkedin_url ? 540 : 500
          ctx.fillText(userData.xhandle, 40, xhandleY)
        }
      } else {
        // Horizontal layout
        // Draw company logo if available
        if (userData.company_logo_url) {
          const logo = new Image()
          logo.crossOrigin = "anonymous"
          await new Promise((resolve) => {
            logo.onload = resolve
            logo.src = userData.company_logo_url
          })

          // Calculate aspect ratio to preserve the full logo
          const logoAspect = logo.width / logo.height
          let logoWidth = 150
          let logoHeight = logoWidth / logoAspect

          // If logo is too tall, adjust height
          if (logoHeight > 150) {
            logoHeight = 150
            logoWidth = logoHeight * logoAspect
          }

          // Position in top right
          ctx.drawImage(logo, 890 - logoWidth - 20, 20, logoWidth, logoHeight)
        }

        // Draw avatar if available
        if (userData.avatar_url) {
          const avatar = new Image()
          avatar.crossOrigin = "anonymous"
          await new Promise((resolve) => {
            avatar.onload = resolve
            avatar.src = userData.avatar_url
          })
          ctx.drawImage(avatar, 40, 40, 120, 120)
        }

        // Draw text
        ctx.fillStyle = card.style.textColor

        // Name
        ctx.font = "bold 36px Arial"
        ctx.textAlign = "left"
        ctx.fillText(userData.full_name, 200, 100)

        // Job Title
        if (userData.job_title) {
          ctx.font = "24px Arial"
          ctx.fillText(userData.job_title, 200, 140)
        }

        // Company
        ctx.font = "italic 24px Arial"
        ctx.fillText(userData.company, 200, userData.job_title ? 180 : 140)

        // Email
        ctx.font = "20px Arial"
        const emailY = userData.job_title ? 240 : 200
        ctx.fillText(userData.email, 200, emailY)

        // Website
        const websiteY = userData.job_title ? 280 : 240
        ctx.fillText(userData.website, 200, websiteY)

        // LinkedIn
        if (userData.linkedin_url) {
          const linkedinY = userData.job_title ? 320 : 280
          ctx.fillText(userData.linkedin_url, 200, linkedinY)
        }

        // X Handle
        if (userData.xhandle) {
          const xhandleY = userData.job_title ? (userData.linkedin_url ? 360 : 320) : userData.linkedin_url ? 320 : 280
          ctx.fillText(userData.xhandle, 200, xhandleY)
        }
      }
    }

    // Add the canvas content to the PDF
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, isVertical ? 51 : 89, isVertical ? 89 : 51)
    pdf.save(`${userData.full_name}-business-card.pdf`)
  }

  const handleShareQR = async () => {
    // Generate QR code with vCard data for contact saving
    const vCardData = generateVCard()
    const qr = await QRCode.toDataURL(vCardData)
    saveAs(qr, `${userData.full_name}-contact-qr.png`)
  }

  const handleEditorUpdate = () => {
    router.refresh()
  }

  // Render horizontal business card layout
  const renderHorizontalCard = () => (
    <div
      className="w-full max-w-[890px] mx-auto aspect-[890/510] rounded-lg shadow-lg relative overflow-hidden"
      style={{
        backgroundColor: card.style.backgroundColor,
        backgroundImage: card.image_url ? `url(${card.image_url})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Editor Button */}
      {showEditor && (
        <BusinessCardEditor
          userId={card.user_id}
          cardId={card.id}
          initialData={userData}
          onUpdate={handleEditorUpdate}
        />
      )}

      {/* Company Logo */}
      {userData.company_logo_url && (
        <div className="absolute top-[3.9%] right-[2.2%] w-[16.9%] h-[29.4%]">
          <Image
            src={userData.company_logo_url || "/placeholder.svg"}
            alt="Company Logo"
            fill
            className="object-contain"
          />
        </div>
      )}

      {/* Left side content */}
      <div className="absolute top-0 left-0 h-full p-[5.6%] flex flex-col justify-center">
        {/* Avatar */}
        {userData.avatar_url && (
          <div className="mb-[5.6%]">
            <div className="relative w-[120px] h-[120px] sm:w-[100px] sm:h-[100px] xs:w-[80px] xs:h-[80px]">
              <Image
                src={userData.avatar_url || "/placeholder.svg"}
                alt="User Avatar"
                fill
                className="rounded-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="space-y-[3.9%]">
          <h2 className="text-4xl font-bold sm:text-3xl xs:text-2xl" style={{ color: card.style.primaryColor }}>
            {userData.full_name}
          </h2>

          {/* Job Title */}
          {userData.job_title && (
            <div className="flex items-center space-x-2">
              <BadgeCheck className="w-5 h-5 flex-shrink-0" style={{ color: card.style.textColor }} />
              <p className="text-xl sm:text-lg xs:text-base" style={{ color: card.style.textColor }}>
                {userData.job_title}
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5 flex-shrink-0" style={{ color: card.style.textColor }} />
            <p className="text-xl italic sm:text-lg xs:text-base" style={{ color: card.style.textColor }}>
              {userData.company}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 flex-shrink-0" style={{ color: card.style.textColor }} />
            <p className="text-lg sm:text-base xs:text-sm break-all" style={{ color: card.style.textColor }}>
              {userData.email}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 flex-shrink-0" style={{ color: card.style.textColor }} />
            <p className="text-lg sm:text-base xs:text-sm break-all" style={{ color: card.style.textColor }}>
              {userData.website}
            </p>
          </div>

          {/* LinkedIn */}
          {userData.linkedin_url && (
            <div className="flex items-center space-x-2">
              <Linkedin className="w-5 h-5 flex-shrink-0" style={{ color: card.style.textColor }} />
              <p className="text-lg sm:text-base xs:text-sm break-all" style={{ color: card.style.textColor }}>
                {userData.linkedin_url}
              </p>
            </div>
          )}

          {/* X Handle */}
          {userData.xhandle && (
            <div className="flex items-center space-x-2">
              <Twitter className="w-5 h-5 flex-shrink-0" style={{ color: card.style.textColor }} />
              <p className="text-lg sm:text-base xs:text-sm" style={{ color: card.style.textColor }}>
                {userData.xhandle}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Render vertical business card layout
  const renderVerticalCard = () => (
    <div
      className="w-full max-w-[510px] mx-auto aspect-[510/890] rounded-lg shadow-lg relative overflow-hidden"
      style={{
        backgroundColor: card.style.backgroundColor,
        backgroundImage: card.image_url ? `url(${card.image_url})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Editor Button */}
      {showEditor && (
        <BusinessCardEditor
          userId={card.user_id}
          cardId={card.id}
          initialData={userData}
          onUpdate={handleEditorUpdate}
        />
      )}

      {/* Company Logo Banner */}
      {userData.company_logo_url && (
        <div className="relative w-full h-[22.5%] flex items-center justify-center overflow-hidden">
          <Image
            src={userData.company_logo_url || "/placeholder.svg"}
            alt="Company Logo"
            fill
            className="object-contain"
            style={{ objectPosition: "center" }}
          />
          {/* Gradient overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50"></div>
        </div>
      )}

      {/* Avatar overlaying the banner */}
      {userData.avatar_url && (
        <div className="absolute top-[11.2%] left-[7.8%] w-[31.4%] h-[18%] rounded-full border-4 border-white overflow-hidden shadow-lg">
          <Image src={userData.avatar_url || "/placeholder.svg"} alt="User Avatar" fill className="object-cover" />
        </div>
      )}

      {/* Contact Information */}
      <div className="absolute top-[31.5%] left-0 w-full px-[7.8%] space-y-[2.5%]">
        <h2 className="text-4xl font-bold sm:text-3xl xs:text-2xl" style={{ color: card.style.primaryColor }}>
          {userData.full_name}
        </h2>

        {/* Job Title */}
        {userData.job_title && (
          <div className="flex items-center space-x-2">
            <BadgeCheck className="w-5 h-5 flex-shrink-0" style={{ color: card.style.textColor }} />
            <p className="text-xl sm:text-lg xs:text-base" style={{ color: card.style.textColor }}>
              {userData.job_title}
            </p>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Briefcase className="w-5 h-5 flex-shrink-0" style={{ color: card.style.textColor }} />
          <p className="text-xl italic sm:text-lg xs:text-base" style={{ color: card.style.textColor }}>
            {userData.company}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Mail className="w-5 h-5 flex-shrink-0" style={{ color: card.style.textColor }} />
          <p className="text-lg sm:text-base xs:text-sm break-all" style={{ color: card.style.textColor }}>
            {userData.email}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 flex-shrink-0" style={{ color: card.style.textColor }} />
          <p className="text-lg sm:text-base xs:text-sm break-all" style={{ color: card.style.textColor }}>
            {userData.website}
          </p>
        </div>

        {/* LinkedIn */}
        {userData.linkedin_url && (
          <div className="flex items-center space-x-2">
            <Linkedin className="w-5 h-5 flex-shrink-0" style={{ color: card.style.textColor }} />
            <p className="text-lg sm:text-base xs:text-sm break-all" style={{ color: card.style.textColor }}>
              {userData.linkedin_url}
            </p>
          </div>
        )}

        {/* X Handle */}
        {userData.xhandle && (
          <div className="flex items-center space-x-2">
            <Twitter className="w-5 h-5 flex-shrink-0" style={{ color: card.style.textColor }} />
            <p className="text-lg sm:text-base xs:text-sm" style={{ color: card.style.textColor }}>
              {userData.xhandle}
            </p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Layout toggle */}
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-sm font-medium">Layout:</span>
        <Toggle pressed={!isVertical} onPressedChange={() => setIsVertical(false)} aria-label="Horizontal layout">
          <LayoutHorizontal className="h-4 w-4" />
          <span className="ml-2">Horizontal</span>
        </Toggle>
        <Toggle pressed={isVertical} onPressedChange={() => setIsVertical(true)} aria-label="Vertical layout">
          <LayoutVertical className="h-4 w-4" />
          <span className="ml-2">Vertical</span>
        </Toggle>
      </div>

      {/* Card container with responsive padding */}
      <div className="w-full px-3 sm:px-0">
        {/* Render the appropriate card layout */}
        {isVertical ? renderVerticalCard() : renderHorizontalCard()}
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-2">
        <Button onClick={handleDownload}>Download PDF</Button>
        <Button onClick={handleShareQR}>Share Contact QR</Button>
      </div>
    </div>
  )
}

