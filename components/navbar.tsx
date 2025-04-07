"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react" // Import Menu and X
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet" // Import Sheet

interface NavbarProps {
  showAuth?: boolean
  isLoggedIn?: boolean
}

export function Navbar({ showAuth = true, isLoggedIn = false }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const navItems = [
    { label: "Features", href: "/#features" },
    { label: "About", href: "/#about" },
  ]

  const authItems = isLoggedIn
    ? [
        { label: "Dashboard", href: "/dashboard" },
        { label: "CRM", href: "/admin/crm" },
        { label: "AI Suite", href: "/ai-suite" }, // Add AI Suite link
        { label: "Profile", href: "/profile" },
      ]
    : [
        { label: "Login", href: "/login" },
        { label: "Sign Up", href: "/signup" },
      ]

  const allItems = showAuth ? [...navItems, ...authItems] : navItems

  return (
    <header className="bg-white border-b">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <svg
            className="h-6 w-6"
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
            <rect height="16" rx="2" width="20" x="2" y="4" />
            <path d="M22 7H2" />
            <path d="M18 14h-8" />
            <path d="M18 11h-6" />
            <path d="M8 11H6" />
            <path d="M8 14H6" />
          </svg>
          <span className="text-xl font-bold">Card0</span>
        </Link>

        {/* Mobile Menu Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="lg:hidden">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-xs">
            <div className="flex flex-col h-full justify-center space-y-4 p-4">
              {" "}
              {/* Added padding */}
              {allItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeMenu}
                  className="text-sm font-medium hover:underline underline-offset-4"
                >
                  {item.label}
                </Link>
              ))}
              {isLoggedIn && (
                <form action="/api/auth/signout" method="post">
                  <Button variant="outline" size="sm" type="submit">
                    Sign Out
                  </Button>
                </form>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-4">
          {allItems.map((item) => (
            <Link key={item.label} href={item.href} className="text-sm font-medium hover:underline underline-offset-4">
              {item.label}
            </Link>
          ))}
          {isLoggedIn && (
            <form action="/api/auth/signout" method="post">
              <Button variant="outline" size="sm" type="submit">
                Sign Out
              </Button>
            </form>
          )}
        </nav>
      </div>
    </header>
  )
}

