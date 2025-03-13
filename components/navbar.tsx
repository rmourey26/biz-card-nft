"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

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
        { label: "Profile", href: "/profile" },
      ]
    : [
        { label: "Login", href: "/login" },
        { label: "Sign Up", href: "/signup" },
      ]

  const allItems = showAuth ? [...navItems, ...authItems] : navItems

  return (
    <header className="px-4 lg:px-6 h-14 flex items-center border-b w-full">
      <Link className="flex items-center justify-center" href="/">
        <span className="font-bold text-xl">CardChain</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="ml-auto hidden md:flex gap-4 sm:gap-6">
        {navItems.map((item) => (
          <Link key={item.href} className="text-sm font-medium hover:underline underline-offset-4" href={item.href}>
            {item.label}
          </Link>
        ))}

        {showAuth && (
          <>
            {isLoggedIn ? (
              <>
                <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard">
                  Dashboard
                </Link>
                <Link className="text-sm font-medium hover:underline underline-offset-4" href="/profile">
                  Profile
                </Link>
                <form action="/auth/signout" method="post">
                  <Button variant="outline" size="sm" type="submit">
                    Sign Out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
                  Login
                </Link>
                <Link className="text-sm font-medium hover:underline underline-offset-4" href="/signup">
                  Sign Up
                </Link>
              </>
            )}
          </>
        )}
      </nav>

      {/* Mobile Menu Button */}
      <div className="ml-auto md:hidden">
        <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-14 z-50 bg-background md:hidden">
          <nav className="flex flex-col p-4">
            {allItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`py-3 text-lg font-medium ${pathname === item.href ? "text-primary" : ""}`}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}

            {showAuth && isLoggedIn && (
              <form action="/auth/signout" method="post" className="mt-4">
                <Button variant="outline" type="submit" className="w-full">
                  Sign Out
                </Button>
              </form>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

