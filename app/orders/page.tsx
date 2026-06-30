'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, ArrowRight } from 'lucide-react'
import { getOrders } from '@/app/actions/orders'

interface Order {
  id: string
  orderNumber: string
  totalAmount: string
  status: string
  paymentStatus: string
  createdAt: Date
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const result = await getOrders()
      if (result.success) {
        setOrders(result.data)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      processing: 'default',
      shipped: 'secondary',
      delivered: 'default',
      cancelled: 'destructive',
    }
    return variants[status] || 'outline'
  }

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      completed: 'default',
      failed: 'destructive',
    }
    return variants[status] || 'outline'
  }

  if (loading) {
    return (
      <>
        <Header user={user} />
        <main className="min-h-screen bg-background">
          <div className="container max-w-7xl mx-auto px-4 py-8">
            <p className="text-center text-muted-foreground">Loading orders...</p>
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
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">
                Start shopping to create your first order!
              </p>
              <Button asChild>
                <Link href="/products">Shop Now</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block p-6 bg-card border rounded-lg hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <Badge variant={getStatusBadge(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <Badge variant={getPaymentBadge(order.paymentStatus)}>
                        Payment: {order.paymentStatus}
                      </Badge>
                    </div>
                    <p className="font-semibold">${parseFloat(order.totalAmount).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
