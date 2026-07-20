'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, LogOut, Menu, X, User, Package, ChevronRight } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/lib/store'
import { ThemeToggle } from '@/components/theme-toggle'
import { SearchModal } from '@/components/search-modal'
import { CurrencySwitcher } from '@/components/currency-switcher'

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
  const [cartCount, setCartCount] = useState(0)
  const getItemCount = useCartStore((s) => s.getItemCount)

  // Hydration-safe cart count
  useEffect(() => {
    setCartCount(getItemCount())
    // Subscribe to store changes
    const unsub = useCartStore.subscribe(() => {
      setCartCount(useCartStore.getState().getItemCount())
    })
    return unsub
  }, [getItemCount])

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-14 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-bold text-base sm:text-lg flex-shrink-0 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center text-primary-foreground text-xs font-bold shadow-sm group-hover:shadow-md transition-shadow">
              GN
            </div>
            <span className="text-foreground hidden sm:inline tracking-tight">GotiNova</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: '/', label: 'Home' },
              { href: '/products', label: 'Shop' },
              { href: '/blog', label: 'Blog' },
              { href: '/about', label: 'About' },
              { href: '/contact', label: 'Contact' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/60 transition-all"
              >
                {item.label}
              </Link>
            ))}
            {/* Search */}
            <SearchModal />
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Currency & Theme */}
            <CurrencySwitcher className="hidden sm:block" />
            <ThemeToggle />

            {/* Cart — always visible */}
            <Link
              href="/cart"
              className="relative p-2 sm:p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-xl transition-all"
              title="Cart"
            >
              <ShoppingCart className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <Link
                  href="/wishlist"
                  className="relative p-2 sm:p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-xl transition-all"
                  title="Wishlist"
                >
                  <Heart className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                </Link>

                {/* User avatar - Desktop */}
                <div className="hidden md:flex items-center gap-2 ml-1 pl-2 border-l border-border">
                  <Link
                    href="/account"
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/60 transition-all"
                  >
                    <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-sm font-medium max-w-[100px] truncate">
                      {user.name || user.email.split('@')[0]}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2 ml-1 pl-2 border-l border-border">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="shadow-sm">
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu toggle — hidden since we have bottom nav */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="hidden md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-xl transition-all"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Slide down overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 space-y-1 max-h-[80vh] overflow-y-auto">
            {/* Nav links */}
            {[
              { href: '/', label: 'Home' },
              { href: '/products', label: 'Shop All' },
              { href: '/blog', label: 'Blog' },
              { href: '/about', label: 'About Us' },
              { href: '/contact', label: 'Contact' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted/60 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}

            <div className="h-px bg-border my-2" />

            {user ? (
              <>
                <Link
                  href="/account"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.name || user.email.split('@')[0]}</p>
                    <p className="text-xs text-muted-foreground">View profile</p>
                  </div>
                </Link>
                <Link
                  href="/orders"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted/60 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="w-4 h-4 text-muted-foreground" />
                  My Orders
                </Link>
                <Link
                  href="/wishlist"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted/60 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="w-4 h-4 text-muted-foreground" />
                  Wishlist
                </Link>

                <div className="h-px bg-border my-2" />

                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  disabled={isLoggingOut}
                >
                  <LogOut className="w-4 h-4" />
                  {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2 px-1">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                </Button>
                <Button size="sm" asChild className="flex-1">
                  <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
