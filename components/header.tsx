'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, User, LogOut } from 'lucide-react'
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
      <div className="container max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-primary">LuxeHair</span>
          </Link>

          {/* Navigation - Center */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm hover:text-primary transition">
              Home
            </Link>
            <Link href="/products" className="text-sm hover:text-primary transition">
              Shop
            </Link>
            <Link href="/about" className="text-sm hover:text-primary transition">
              About
            </Link>
          </nav>

          {/* Actions - Right */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/wishlist" className="p-2 hover:bg-muted rounded-lg transition">
                  <Heart className="w-5 h-5" />
                </Link>
                <Link href="/cart" className="p-2 hover:bg-muted rounded-lg transition">
                  <ShoppingCart className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-2">
                  <div className="flex-col hidden sm:flex">
                    <span className="text-sm font-medium">{user.name || user.email}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
