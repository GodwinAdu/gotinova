'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Package, Truck } from 'lucide-react'
import { getOrderDetails, getOrderTracking } from '@/app/actions/orders'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { generateOrderInquiryLink } from '@/lib/utils/whatsapp'
import { OrderTimeline } from '@/components/order-timeline'

interface OrderItem {
  id: string
  productName: string
  quantity: number
  price: string
  subtotal: string
}

interface Order {
  id: string
  orderNumber: string
  totalAmount: string
  subtotal: string
  shippingCost: string | null
  tax: string | null
  status: string | null
  paymentStatus: string | null
  shippingAddress: string | null
  billingAddress: string | null
  paymentMethod: string | null
  createdAt: Date
}

interface Tracking {
  id: string
  trackingNumber?: string | null
  carrier?: string | null
  status: string | null
  currentLocation?: string | null
  estimatedDelivery?: Date | null
}

export default function OrderDetailsPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [tracking, setTracking] = useState<Tracking | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadOrderDetails()
  }, [orderId])

  const loadOrderDetails = async () => {
    try {
      const [detailsResult, trackingResult] = await Promise.all([
        getOrderDetails(orderId),
        getOrderTracking(orderId),
      ])

      if (detailsResult.success && detailsResult.data) {
        setOrder(detailsResult.data.order)
        setItems(detailsResult.data.items)
      }

      if (trackingResult.success) {
        setTracking(trackingResult.data || null)
      }
    } catch (error) {
      console.error('Error loading order details:', error)
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

  if (loading) {
    return (
      <>
        <Header user={user} />
        <main className="min-h-screen bg-background">
          <div className="container max-w-7xl mx-auto px-4 py-8">
            <p className="text-center text-muted-foreground">Loading order...</p>
          </div>
        </main>
      </>
    )
  }

  if (!order) {
    return (
      <>
        <Header user={user} />
        <main className="min-h-screen bg-background">
          <div className="container max-w-7xl mx-auto px-4 py-8">
            <p className="text-center text-muted-foreground">Order not found</p>
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
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/orders" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Link>
          </Button>

          {/* Order Header */}
          <div className="bg-card border rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
                <p className="text-muted-foreground">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
                <Badge variant={getStatusBadge(order.status || 'pending')} className="text-lg px-4 py-2">
                {(order.status || 'pending').toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Order Tracking Timeline */}
          <div className="bg-card border rounded-2xl p-5 sm:p-6 mb-6">
            <OrderTimeline status={order.status} createdAt={order.createdAt} />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Items */}
              <div className="bg-card border rounded-lg overflow-hidden">
                <div className="bg-muted px-6 py-4 border-b">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order Items
                  </h2>
                </div>
                <div className="divide-y">
                  {items.map((item) => (
                    <div key={item.id} className="p-6 flex justify-between">
                      <div>
                        <h3 className="font-semibold">{item.productName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">GH₵ {parseFloat(item.subtotal).toFixed(0)}</p>
                        <p className="text-sm text-muted-foreground">
                          GH₵ {parseFloat(item.price).toFixed(0)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking */}
              {tracking && (
                <div className="bg-card border rounded-lg overflow-hidden">
                  <div className="bg-muted px-6 py-4 border-b">
                    <h2 className="font-semibold flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Delivery Tracking
                    </h2>
                  </div>
                  <div className="p-6">
                    {tracking.trackingNumber && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground">Tracking Number</p>
                        <p className="font-mono font-semibold">{tracking.trackingNumber}</p>
                      </div>
                    )}
                    {tracking.carrier && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground">Carrier</p>
                        <p className="font-semibold">{tracking.carrier}</p>
                      </div>
                    )}
                    {tracking.currentLocation && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground">Current Location</p>
                        <p className="font-semibold">{tracking.currentLocation}</p>
                      </div>
                    )}
                    {tracking.estimatedDelivery && (
                      <div>
                        <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                        <p className="font-semibold">
                          {new Date(tracking.estimatedDelivery).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="h-fit">
              <div className="bg-card border rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg">Order Summary</h3>

                <div className="space-y-3 pb-4 border-b">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>GH₵ {parseFloat(order.subtotal || '0').toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>GH₵ {parseFloat(order.shippingCost || '0').toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>GH₵ {parseFloat(order.tax || '0').toFixed(0)}</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>GH₵ {parseFloat(order.totalAmount || '0').toFixed(0)}</span>
                </div>

                <div className="pt-4 border-t space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Payment Status</p>
                    <Badge variant="default">
                      {((order.paymentStatus || 'pending').charAt(0).toUpperCase() + (order.paymentStatus || 'pending').slice(1))}
                    </Badge>
                  </div>
                  {order.paymentMethod && (
                    <div>
                      <p className="text-muted-foreground mb-1">Payment Method</p>
                      <p>{order.paymentMethod}</p>
                    </div>
                  )}
                </div>

                {/* WhatsApp Order Inquiry */}
                <div className="pt-4 border-t">
                  <WhatsAppButton
                    href={generateOrderInquiryLink(order.orderNumber)}
                    size="sm"
                    className="w-full"
                  >
                    Ask about this order
                  </WhatsAppButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
