'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  ShoppingBag,
  Users,
  Package,
  DollarSign,
  Settings,
  AlertTriangle,
  Clock,
  Plus,
  BarChart3,
} from 'lucide-react'
import { getAdminStats, getAllOrders, getLowStockProducts } from '@/app/actions/admin'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { StatsCardsSkeleton, OrderRowSkeleton } from '@/components/skeletons'

interface AdminStats {
  totalOrders: number
  totalProducts: number
  totalUsers: number
  totalRevenue: number
}

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Auto-publish scheduled products
      try {
        const { publishScheduledProducts } = await import('@/app/actions/admin')
        await publishScheduledProducts()
      } catch {}

      const [statsResult, ordersResult, lowStockResult] = await Promise.all([
        getAdminStats(),
        getAllOrders(5),
        getLowStockProducts(5),
      ])

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data)
      } else {
        setError(statsResult.error || 'Failed to load dashboard')
      }

      if (ordersResult.success && ordersResult.data) {
        setRecentOrders(ordersResult.data)
      }

      if (lowStockResult.success && lowStockResult.data) {
        setLowStockProducts(lowStockResult.data)
      }
    } catch (err) {
      console.error('Error loading admin data:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <StatsCardsSkeleton />
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <OrderRowSkeleton key={i} />)}
            </div>
            <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <OrderRowSkeleton key={i} />)}
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <Card className="p-12 text-center rounded-2xl">
            <p className="text-destructive font-medium">{error}</p>
            <Button onClick={loadAdminData} className="mt-4 rounded-xl">
              Retry
            </Button>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of your store performance</p>
          </div>
          <Button asChild className="rounded-xl">
            <Link href="/admin/settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-2xl md:text-3xl font-bold">{formatPrice(stats.totalRevenue)}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                  <p className="text-2xl md:text-3xl font-bold">{stats.totalOrders}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Products</p>
                  <p className="text-2xl md:text-3xl font-bold">{stats.totalProducts}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Customers</p>
                  <p className="text-2xl md:text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Recent Activity & Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recent Activity */}
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Recent Activity</h2>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <Link href="/admin/orders">View All</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
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
                        {order.customerName || order.customerEmail || 'Guest'} •{' '}
                        {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                      </p>
                    </div>
                    <p className="font-semibold text-sm ml-4">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-6">No recent orders</p>
              )}
            </div>
          </Card>

          {/* Low Stock Alert */}
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold">Low Stock Alert</h2>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <Link href="/admin/products">Manage</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {product.sku || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant={product.stock === 0 ? 'destructive' : 'secondary'}>
                        {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">All products are well stocked</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Products with stock below 5 will appear here
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 rounded-2xl">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button asChild variant="outline" className="justify-start gap-2 rounded-xl h-11">
              <Link href="/admin/products/new">
                <Plus className="w-4 h-4" />
                Add Product
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-2 rounded-xl h-11">
              <Link href="/admin/products">
                <Package className="w-4 h-4" />
                Manage Products
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-2 rounded-xl h-11">
              <Link href="/admin/orders">
                <ShoppingBag className="w-4 h-4" />
                Manage Orders
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-2 rounded-xl h-11">
              <Link href="/admin/analytics">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </main>
  )
}
