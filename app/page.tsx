import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"

export const metadata: Metadata = {
  title: "Home | Digital Business Card NFT",
  description: "Create and mint your digital business card as an NFT",
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Navbar showAuth={true} isLoggedIn={false} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-12 md:py-24 lg:py-32">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2 max-w-[600px]">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Digital Business Cards as NFTs
                  </h1>
                  <p className="text-gray-500 md:text-xl dark:text-gray-400 mt-4">
                    Create stunning digital business cards, mint them as NFTs on the Base blockchain, and download them
                    as PDFs. Share your professional identity in a modern way.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Link href="/signup">
                    <Button size="lg" className="inline-flex items-center">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center lg:justify-end">
                <div className="relative w-full max-w-[500px] aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 z-10 rounded-lg"></div>
                  <Image
                    src="/placeholder.svg?height=600&width=800"
                    alt="Business Card Preview"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 z-20">
                    <h3 className="text-white font-bold text-xl">Professional Digital Identity</h3>
                    <p className="text-white/80 text-sm mt-1">Customizable business cards for the digital age</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-1/4 right-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-30 dark:bg-blue-900"></div>
          <div className="absolute bottom-1/4 left-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-30 dark:bg-purple-900"></div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Everything you need to create and share your digital business cards
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8">
              <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                <div className="rounded-full bg-gray-200 p-4 dark:bg-gray-700">
                  <svg
                    className="h-6 w-6 text-gray-500 dark:text-gray-400"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m2 12 3.5 3.5L12 9" />
                    <path d="m15 9 3 3L22 8" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">AI-Generated Designs</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Create beautiful business cards with AI-powered design suggestions
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                <div className="rounded-full bg-gray-200 p-4 dark:bg-gray-700">
                  <svg
                    className="h-6 w-6 text-gray-500 dark:text-gray-400"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M19.5 12.572 12 17l-7.5-4.428V7.572L12 3l7.5 4.572v5" />
                    <path d="M12 17v4" />
                    <path d="M12 12 4.5 7.572" />
                    <path d="m12 12 7.5-4.428" />
                    <path d="M12 12v5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">NFT Minting</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Mint your business cards as NFTs on the Base blockchain
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                <div className="rounded-full bg-gray-200 p-4 dark:bg-gray-700">
                  <svg
                    className="h-6 w-6 text-gray-500 dark:text-gray-400"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">PDF Download</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Download your business cards as PDF files for easy sharing
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 CardChain. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}

