'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Search, ShoppingCart, Heart, User } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { cn } from '@/lib/utils'

/**
 * Mobile Bottom Navigation Bar
 * 
 * Sticky at the bottom on mobile — mimics native app navigation.
 * Hidden on desktop. Hidden in admin panel.
 */

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/products', icon: Search, label: 'Shop' },
  { href: '/cart', icon: ShoppingCart, label: 'Cart' },
  { href: '/wishlist', icon: Heart, label: 'Wishlist' },
  { href: '/account', icon: User, label: 'Account' },
]

export function MobileNav() {
  const pathname = usePathname()
  const [cartCount, setCartCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  const getItemCount = useCartStore((s) => s.getItemCount)

  useEffect(() => {
    setMounted(true)
    setCartCount(getItemCount())
    const unsub = useCartStore.subscribe(() => {
      setCartCount(useCartStore.getState().getItemCount())
    })
    return unsub
  }, [getItemCount])

  // Hide on admin pages, checkout, sign-in/sign-up
  const hiddenPaths = ['/admin', '/checkout', '/sign-in', '/sign-up']
  if (hiddenPaths.some(p => pathname.startsWith(p))) return null

  if (!mounted) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-xl border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-14 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)
          const isCart = item.href === '/cart'

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-xl transition-colors relative',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground active:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5px]')} />
                {/* Cart badge */}
                {isCart && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[10px] leading-none',
                isActive ? 'font-semibold' : 'font-medium'
              )}>
                {item.label}
              </span>
              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute -top-0.5 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
