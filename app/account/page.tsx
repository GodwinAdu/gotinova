'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2,
  LogOut,
  ShoppingBag,
  Heart,
  User,
  ChevronRight,
  Package,
  Calendar,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/header'
import { useSession, authClient } from '@/lib/auth-client'
import { getOrders } from '@/app/actions/orders'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { AccountSkeleton } from '@/components/skeletons'
import { LoyaltyPointsCard } from '@/components/loyalty-points'

function getStatusVariant(status: string) {
  switch (status?.toLowerCase()) {
    case 'delivered':
    case 'completed':
      return 'success'
    case 'cancelled':
    case 'refunded':
      return 'destructive'
    case 'processing':
    case 'shipped':
      return 'default'
    default:
      return 'secondary'
  }
}

export default function AccountPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (isPending) return

    if (!session?.user) {
      router.push('/sign-in?redirect=/account')
      return
    }

    loadOrders()
  }, [session, isPending, router])

  const loadOrders = async () => {
    try {
      setOrdersLoading(true)
      const result = await getOrders(3)
      if (result.success && result.data) {
        setRecentOrders(result.data)
      }
    } catch (err) {
      console.error('Error loading orders:', err)
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setSigningOut(true)
      await authClient.signOut()
      router.push('/')
    } catch (err) {
      console.error('Sign out error:', err)
    } finally {
      setSigningOut(false)
    }
  }

  if (isPending) {
    return (
      <>
        <Header />
        <AccountSkeleton />
      </>
    )
  }

  if (!session?.user) {
    return null
  }

  const user = session.user
  const memberSince = user.createdAt ? formatDate(user.createdAt) : 'N/A'

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container max-w-5xl mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Welcome back, {user.name || 'there'}
                </h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Manage your account and view your orders
                </p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              disabled={signingOut}
              variant="outline"
              className="gap-2 rounded-xl"
            >
              {signingOut ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </>
              )}
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="p-5 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-xl font-bold">{recentOrders.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wishlist Items</p>
                  <p className="text-xl font-bold">0</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Status</p>
                  <Badge variant="success" className="mt-0.5">Active</Badge>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <Card className="p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Recent Orders</h2>
                  <Button asChild variant="outline" size="sm" className="rounded-xl">
                    <Link href="/orders">View All</Link>
                  </Button>
                </div>

                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between py-3 border-b last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm truncate">
                              {order.orderNumber}
                            </p>
                            <Badge variant={getStatusVariant(order.status)}>
                              {order.status || 'pending'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                          </p>
                        </div>
                        <p className="font-semibold text-sm ml-4">
                          {formatPrice(order.totalAmount)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground">No orders yet</p>
                    <Button asChild className="mt-4 rounded-xl" size="sm">
                      <Link href="/products">Start Shopping</Link>
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Info */}
              <Card className="p-6 rounded-2xl">
                <h2 className="text-lg font-semibold mb-4">Account Info</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="text-sm font-medium">{user.name || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium truncate">{user.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Member Since</p>
                      <p className="text-sm font-medium">{memberSince}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Loyalty Points */}
              <LoyaltyPointsCard />

              {/* Quick Links */}
              <Card className="p-6 rounded-2xl">
                <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
                <div className="space-y-1">
                  <Link href="/orders">
                    <Button
                      variant="ghost"
                      className="w-full justify-between rounded-xl h-11"
                    >
                      <span className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        My Orders
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </Link>
                  <Link href="/wishlist">
                    <Button
                      variant="ghost"
                      className="w-full justify-between rounded-xl h-11"
                    >
                      <span className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Wishlist
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </Link>
                  <Link href="/account/profile">
                    <Button
                      variant="ghost"
                      className="w-full justify-between rounded-xl h-11"
                    >
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Edit Profile
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
