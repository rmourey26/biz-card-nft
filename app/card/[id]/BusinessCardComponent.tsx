import { BusinessCardPreview } from "@/components/business-card-preview"
import { Navbar } from "@/components/navbar"

interface BusinessCardComponentProps {
  card: any // Replace 'any' with your actual business card type
  isOwner?: boolean
}

export default function BusinessCardComponent({ card, isOwner = false }: BusinessCardComponentProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar showAuth={true} isLoggedIn={false} />

      <div className="flex flex-1 items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
        <div className="w-full max-w-2xl">
          <BusinessCardPreview card={card} userData={card.profiles} showEditor={isOwner} />
        </div>
      </div>
    </div>
  )
}

