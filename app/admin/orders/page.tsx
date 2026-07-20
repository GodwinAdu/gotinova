'use client'

import { useEffect, useState } from 'react'
import { Loader2, Search, Eye, Download } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getAllOrders, updateOrderStatus } from '@/app/actions/admin'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { exportOrdersCSV } from '@/lib/utils/export-csv'
import Link from 'next/link'

interface AdminOrder {
  id: string
  orderNumber: string
  totalAmount: string
  status: string | null
  paymentStatus: string | null
  createdAt: Date
  customerName: string | null
  customerEmail: string | null
}

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const result = await getAllOrders(100)
      if (result.success && result.data) {
        setOrders(result.data as AdminOrder[])
      }
    } catch (err) {
      console.error('Failed to load orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      const result = await updateOrderStatus(orderId, newStatus)
      if (result.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        )
      }
    } catch (err) {
      console.error('Failed to update order status:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredOrders = orders.filter((o) =>
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.customerEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.customerName || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusVariant = (status: string | null): 'default' | 'success' | 'destructive' | 'outline' | 'secondary' => {
    switch (status) {
      case 'delivered':
        return 'success'
      case 'cancelled':
        return 'destructive'
      case 'pending':
        return 'outline'
      case 'processing':
      case 'shipped':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getPaymentVariant = (status: string | null): 'default' | 'success' | 'destructive' | 'outline' | 'secondary' => {
    switch (status) {
      case 'paid':
        return 'success'
      case 'failed':
        return 'destructive'
      case 'pending':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Button
          onClick={() => exportOrdersCSV(orders)}
          variant="outline"
          size="sm"
          className="rounded-xl gap-2"
          disabled={orders.length === 0}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by order number, customer name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Orders Table */}
      {loading ? (
        <Card className="p-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No orders found</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Order #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Payment</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-foreground">
                        {order.customerName || 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.customerEmail || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-primary">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className="text-xs border border-border rounded-md px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getPaymentVariant(order.paymentStatus)}>
                        {(order.paymentStatus || 'pending').charAt(0).toUpperCase() +
                          (order.paymentStatus || 'pending').slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="rounded-xl gap-1">
                          <Eye className="w-3 h-3" />
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
