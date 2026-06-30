'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, LogOut, Menu, X } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface HeaderProps {
  user?: {
    id: string
    name?: string
    email: string
  }
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await authClient.signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card">
      <div className="w-full px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-base md:text-lg flex-shrink-0">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center text-white text-xs font-bold">
              LH
            </div>
            <span className="text-primary hidden sm:inline">LuxeHair</span>
          </Link>

          {/* Navigation - Center (Desktop only) */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-sm hover:text-primary transition-colors">
              Shop
            </Link>
            <Link href="/about" className="text-sm hover:text-primary transition-colors">
              About
            </Link>
          </nav>

          {/* Actions - Right */}
          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <>
                {/* Wishlist & Cart icons */}
                <Link
                  href="/wishlist"
                  className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5 md:w-6 md:h-6" />
                </Link>
                <Link
                  href="/cart"
                  className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
                  title="Shopping Cart"
                >
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                </Link>

                {/* User menu - Desktop */}
                <div className="hidden md:flex items-center gap-3 border-l border-border pl-3">
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-medium truncate">{user.name || user.email.split('@')[0]}</span>
                    <span className="text-xs text-muted-foreground">Customer</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="gap-2"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Menu"
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </>
            ) : (
              <>
                {/* Auth buttons - Desktop */}
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                </div>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Menu"
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border mt-3 pt-3 space-y-2">
            {/* Mobile nav links */}
            <Link
              href="/"
              className="block px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/products"
              className="block px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>

            {/* Mobile user section */}
            {user ? (
              <>
                <Link
                  href="/account"
                  className="block px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Account
                </Link>
                <Link
                  href="/orders"
                  className="block px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-destructive"
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="flex-1">
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
