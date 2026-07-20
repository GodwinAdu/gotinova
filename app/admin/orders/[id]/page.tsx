'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, Package, User, MapPin, CreditCard, FileText, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { generateCustomerNotificationLink } from '@/lib/utils/whatsapp'
import { OrderTimeline } from '@/components/order-timeline'
import {
  getAdminOrderDetails,
  updateOrderStatus,
  updatePaymentStatus,
  updateOrderNotes,
} from '@/app/actions/admin'

interface OrderDetail {
  id: string
  userId: string
  orderNumber: string
  totalAmount: string
  subtotal: string
  shippingCost: string | null
  tax: string | null
  status: string | null
  paymentStatus: string | null
  paymentMethod: string | null
  shippingAddress: string | null
  billingAddress: string | null
  notes: string | null
  createdAt: Date
  customerName: string | null
  customerEmail: string | null
}

interface OrderItem {
  id: string
  orderId: string
  productId: string | null
  productName: string
  quantity: number
  price: string
  subtotal: string
  createdAt: Date
}

interface ShippingAddress {
  firstName?: string
  lastName?: string
  name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  region?: string
  country?: string
}

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)
  const [savingPayment, setSavingPayment] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    loadOrderDetails()
  }, [orderId])

  const loadOrderDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getAdminOrderDetails(orderId)
      if (result.success && result.data) {
        const orderData = result.data.order as OrderDetail
        setOrder(orderData)
        setItems(result.data.items as OrderItem[])
        setSelectedStatus(orderData.status || 'pending')
        setSelectedPaymentStatus(orderData.paymentStatus || 'pending')
        setNotes(orderData.notes || '')
      } else {
        setError(result.error || 'Failed to load order details')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    setSavingStatus(true)
    setStatusMessage(null)
    try {
      const result = await updateOrderStatus(orderId, selectedStatus)
      if (result.success) {
        setOrder((prev) => prev ? { ...prev, status: selectedStatus } : null)
        setStatusMessage('Order status updated')
        // Log activity
        const { logActivity } = await import('@/lib/activity-log')
        logActivity({ action: `Changed status to "${selectedStatus}"`, resource: 'order', resourceId: orderId, details: order?.orderNumber })
      } else {
        setStatusMessage(result.error || 'Failed to update status')
      }
    } catch {
      setStatusMessage('Failed to update status')
    } finally {
      setSavingStatus(false)
      setTimeout(() => setStatusMessage(null), 3000)
    }
  }

  const handlePaymentStatusUpdate = async () => {
    setSavingPayment(true)
    setStatusMessage(null)
    try {
      const result = await updatePaymentStatus(orderId, selectedPaymentStatus)
      if (result.success) {
        setOrder((prev) => prev ? { ...prev, paymentStatus: selectedPaymentStatus } : null)
        setStatusMessage('Payment status updated')
      } else {
        setStatusMessage(result.error || 'Failed to update payment status')
      }
    } catch {
      setStatusMessage('Failed to update payment status')
    } finally {
      setSavingPayment(false)
      setTimeout(() => setStatusMessage(null), 3000)
    }
  }

  const handleNotesUpdate = async () => {
    setSavingNotes(true)
    setStatusMessage(null)
    try {
      const result = await updateOrderNotes(orderId, notes)
      if (result.success) {
        setOrder((prev) => prev ? { ...prev, notes } : null)
        setStatusMessage('Notes saved')
      } else {
        setStatusMessage(result.error || 'Failed to save notes')
      }
    } catch {
      setStatusMessage('Failed to save notes')
    } finally {
      setSavingNotes(false)
      setTimeout(() => setStatusMessage(null), 3000)
    }
  }

  const parseShippingAddress = (addressJson: string | null): ShippingAddress | null => {
    if (!addressJson) return null
    try {
      return JSON.parse(addressJson) as ShippingAddress
    } catch {
      return null
    }
  }

  const getStatusVariant = (status: string | null): 'default' | 'success' | 'destructive' | 'secondary' => {
    switch (status) {
      case 'delivered':
      case 'paid':
        return 'success'
      case 'cancelled':
      case 'failed':
        return 'destructive'
      case 'processing':
      case 'shipped':
        return 'default'
      default:
        return 'secondary'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Link href="/admin/orders">
          <Button variant="ghost" className="rounded-xl gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Button>
        </Link>
        <Card className="rounded-2xl p-8 text-center">
          <p className="text-destructive font-medium">{error || 'Order not found'}</p>
        </Card>
      </div>
    )
  }

  const shippingAddress = parseShippingAddress(order.shippingAddress)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders">
            <Button variant="ghost" className="rounded-xl gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(order.status)}>
            {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
          </Badge>
          <Badge variant={getStatusVariant(order.paymentStatus)}>
            Payment: {(order.paymentStatus || 'pending').charAt(0).toUpperCase() + (order.paymentStatus || 'pending').slice(1)}
          </Badge>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className="bg-primary/10 text-primary text-sm px-4 py-2 rounded-xl">
          {statusMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items & Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Timeline */}
          <Card className="rounded-2xl p-5 sm:p-6">
            <OrderTimeline status={order.status} createdAt={order.createdAt} />
          </Card>

          {/* Order Items */}
          <Card className="rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-lg">Order Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Product</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Qty</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Price</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-border">
                      <td className="px-4 py-3 font-medium">{item.productName}</td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {formatPrice(item.price)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatPrice(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Order Summary */}
          <Card className="rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatPrice(order.shippingCost || '0')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatPrice(order.tax || '0')}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Notes Section */}
          <Card className="rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-lg">Internal Notes</h2>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this order..."
              className="w-full min-h-[120px] p-3 border border-border rounded-xl bg-background text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="mt-3 flex justify-end">
              <Button
                onClick={handleNotesUpdate}
                disabled={savingNotes}
                className="rounded-xl"
              >
                {savingNotes && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Save Notes
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Customer, Shipping, Actions */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card className="rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-lg">Customer</h2>
            </div>
            <div className="space-y-2">
              <p className="font-medium">{order.customerName || 'N/A'}</p>
              <p className="text-sm text-muted-foreground">{order.customerEmail || '—'}</p>
              {shippingAddress?.phone && (
                <p className="text-sm text-muted-foreground">{shippingAddress.phone}</p>
              )}
              <Link href={`/admin/customers/${order.userId}`}>
                <Button variant="outline" size="sm" className="rounded-xl mt-2 w-full">
                  View Customer Profile
                </Button>
              </Link>
              {shippingAddress?.phone && (
                <WhatsAppButton
                  href={generateCustomerNotificationLink(
                    shippingAddress.phone,
                    order.orderNumber,
                    order.status || 'processing'
                  )}
                  size="sm"
                  className="w-full mt-1"
                >
                  Notify via WhatsApp
                </WhatsAppButton>
              )}
            </div>
          </Card>

          {/* Shipping Address */}
          <Card className="rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-lg">Shipping Address</h2>
            </div>
            {shippingAddress ? (
              <div className="space-y-1 text-sm">
                <p className="font-medium">
                  {shippingAddress.firstName && shippingAddress.lastName
                    ? `${shippingAddress.firstName} ${shippingAddress.lastName}`
                    : shippingAddress.name || 'N/A'}
                </p>
                {shippingAddress.address && <p>{shippingAddress.address}</p>}
                {shippingAddress.city && <p>{shippingAddress.city}</p>}
                {shippingAddress.region && <p>{shippingAddress.region}</p>}
                {shippingAddress.country && <p>{shippingAddress.country}</p>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No shipping address available</p>
            )}
          </Card>

          {/* Payment Info */}
          <Card className="rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-lg">Payment</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Method</span>
                <span className="capitalize">{order.paymentMethod || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={getStatusVariant(order.paymentStatus)} className="text-xs">
                  {(order.paymentStatus || 'pending').charAt(0).toUpperCase() + (order.paymentStatus || 'pending').slice(1)}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Update Order Status */}
          <Card className="rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4">Update Status</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">
                  Order Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border border-border rounded-xl px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleStatusUpdate}
                  disabled={savingStatus || selectedStatus === order.status}
                  className="rounded-xl w-full mt-2"
                  size="sm"
                >
                  {savingStatus && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Update Order Status
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">
                  Payment Status
                </label>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  className="w-full border border-border rounded-xl px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handlePaymentStatusUpdate}
                  disabled={savingPayment || selectedPaymentStatus === order.paymentStatus}
                  className="rounded-xl w-full mt-2"
                  size="sm"
                >
                  {savingPayment && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Update Payment Status
                </Button>
              </div>
            </div>
          </Card>

          {/* Refund */}
          {order.status !== 'refunded' && (
            <RefundSection orderId={order.id} orderNumber={order.orderNumber} totalAmount={order.totalAmount} />
          )}
        </div>
      </div>
    </div>
  )
}

function RefundSection({ orderId, orderNumber, totalAmount }: { orderId: string; orderNumber: string; totalAmount: string }) {
  const [showForm, setShowForm] = useState(false)
  const [reason, setReason] = useState('')
  const [amount, setAmount] = useState(totalAmount)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleRefund = async () => {
    if (!reason.trim()) return
    setProcessing(true)
    const { processRefund } = await import('@/app/actions/admin')
    const res = await processRefund(orderId, {
      reason: reason.trim(),
      amount: parseFloat(amount),
    })
    setResult(res.success ? res.message || 'Refund processed' : res.error || 'Failed')
    setProcessing(false)
    if (res.success) setShowForm(false)
  }

  return (
    <Card className="rounded-2xl p-6 border-destructive/20">
      <h2 className="font-semibold text-lg mb-3 text-destructive">Process Refund</h2>

      {result && (
        <p className={`text-xs font-medium mb-3 px-3 py-2 rounded-xl ${result.includes('processed') ? 'bg-emerald-50 text-emerald-700' : 'bg-destructive/10 text-destructive'}`}>
          {result}
        </p>
      )}

      {!showForm ? (
        <Button onClick={() => setShowForm(true)} variant="outline" size="sm" className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 w-full">
          Issue Refund for {orderNumber}
        </Button>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Refund Amount (GH₵)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              min="0"
              max={totalAmount}
              step="0.01"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Full order: GH₵ {parseFloat(totalAmount).toFixed(2)}</p>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Reason *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select reason...</option>
              <option value="Customer requested cancellation">Customer requested cancellation</option>
              <option value="Product damaged/defective">Product damaged/defective</option>
              <option value="Wrong item shipped">Wrong item shipped</option>
              <option value="Item not as described">Item not as described</option>
              <option value="Order not delivered">Order not delivered</option>
              <option value="Duplicate order">Duplicate order</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRefund} disabled={processing || !reason} size="sm" variant="destructive" className="rounded-xl flex-1">
              {processing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Confirm Refund
            </Button>
            <Button onClick={() => setShowForm(false)} variant="outline" size="sm" className="rounded-xl">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
