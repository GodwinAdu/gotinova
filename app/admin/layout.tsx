'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (isPending) return
    
    if (!session?.user) {
      router.push('/sign-in?redirect=/admin')
    }
  }, [session, isPending, router])

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <div className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between">
        <h1 className="font-bold text-lg">Admin Panel</h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-muted rounded"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            mobileMenuOpen ? 'block' : 'hidden'
          } lg:block w-64 bg-card border-r border-border fixed lg:static h-screen lg:h-auto overflow-y-auto z-10`}
        >
          <div className="p-6 hidden lg:block border-b border-border">
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">LuxeHair Admin</p>
          </div>

          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-border space-y-2 absolute bottom-0 w-full">
            <Link href="/account">
              <Button variant="ghost" className="w-full justify-start">
                My Account
              </Button>
            </Link>
            <Link href="/api/auth/sign-out">
              <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-full">
          <div className="max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
