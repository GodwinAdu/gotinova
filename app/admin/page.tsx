'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Users, Package, DollarSign, Settings } from 'lucide-react'
import { getAdminStats, getAllProducts, getAllOrders, getAllUsers } from '@/app/actions/admin'

interface AdminStats {
  totalOrders: number
  totalProducts: number
  totalUsers: number
  totalRevenue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      const [statsResult, productsResult, ordersResult, usersResult] = await Promise.all([
        getAdminStats(),
        getAllProducts(5),
        getAllOrders(5),
        getAllUsers(5),
      ])

      if (statsResult.success) {
        setStats(statsResult.data)
      }

      if (productsResult.success) {
        setProducts(productsResult.data)
      }

      if (ordersResult.success) {
        setOrders(ordersResult.data)
      }

      if (usersResult.success) {
        setUsers(usersResult.data)
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header user={user} />
        <main className="min-h-screen bg-background">
          <div className="container max-w-7xl mx-auto px-4 py-8">
            <p className="text-center text-muted-foreground">Loading dashboard...</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header user={user} />
      <main className="min-h-screen bg-background">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <Button asChild>
              <Link href="/admin/settings" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </Button>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                    <p className="text-3xl font-bold">{stats.totalOrders}</p>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-primary opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Products</p>
                    <p className="text-3xl font-bold">{stats.totalProducts}</p>
                  </div>
                  <Package className="w-8 h-8 text-primary opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-primary opacity-20" />
                </div>
              </Card>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Products */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Products</h2>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/products">View All</Link>
                </Button>
              </div>
              <div className="space-y-3">
                {products.length > 0 ? (
                  products.map((product) => (
                    <div key={product.id} className="flex justify-between items-start pb-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                      </div>
                      <p className="font-semibold">${parseFloat(product.price).toFixed(2)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No products yet</p>
                )}
              </div>
            </Card>

            {/* Recent Orders */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Orders</h2>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/orders">View All</Link>
                </Button>
              </div>
              <div className="space-y-3">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <div key={order.id} className="flex justify-between items-start pb-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                      </div>
                      <p className="font-semibold">${parseFloat(order.totalAmount).toFixed(2)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No orders yet</p>
                )}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="justify-start">
                <Link href="/admin/products/new">Add Product</Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/admin/products">Manage Products</Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/admin/orders">Manage Orders</Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/admin/users">Manage Users</Link>
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </>
  )
}
