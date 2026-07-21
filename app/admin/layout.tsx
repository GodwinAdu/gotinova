'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, LogOut, Menu, X, Settings, Gift, ClipboardList, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { ToastProvider } from '@/components/toast'
import { AdminNotifications } from '@/components/admin-notifications'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, isPending } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)

  // Skip auth check on the login page
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (isLoginPage) return
    if (isPending) return
    
    // Give session a moment to hydrate after redirect
    const timer = setTimeout(() => {
      setHasChecked(true)
      if (!session?.user) {
        router.push('/sign-in?redirect=/admin')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [session, isPending, router, isLoginPage])

  // Don't wrap login page with admin layout
  if (isLoginPage) {
    return <>{children}</>
  }

  // Show loading while checking session
  if (isPending || !hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
    { label: 'Gift Cards', href: '/admin/gift-cards', icon: Gift },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Activity Log', href: '/admin/activity', icon: ClipboardList },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  return (
    <ToastProvider>
      <AdminNotifications />
      <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-20">
        <h1 className="font-bold text-lg">Admin Panel</h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-muted rounded-xl transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            mobileMenuOpen ? 'block' : 'hidden'
          } lg:block w-64 bg-card border-r border-border fixed lg:sticky lg:top-0 h-screen overflow-y-auto z-10`}
        >
          <div className="p-6 hidden lg:block border-b border-border">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center text-primary-foreground text-xs font-bold">
                GN
              </div>
              <div>
                <h1 className="text-base font-bold">Admin</h1>
                <p className="text-[11px] text-muted-foreground">GotiNova</p>
              </div>
            </Link>
          </div>

          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}>
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </div>
                </Link>
              )
            })}
          </nav>

          <div className="absolute bottom-0 w-full p-3 border-t border-border space-y-1">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                ← Back to Store
              </div>
            </Link>
            <button
              onClick={async () => {
                const { authClient } = await import('@/lib/auth-client')
                await authClient.signOut()
                window.location.href = '/admin/login'
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 min-h-screen">
          <div className="max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
    </ToastProvider>
  )
}
