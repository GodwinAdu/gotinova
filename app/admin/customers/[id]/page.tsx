'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, User, ShoppingBag, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { getCustomerDetails } from '@/app/actions/admin'

interface CustomerData {
  id: string
  name: string | null
  email: string
  createdAt: Date
}

interface CustomerOrder {
  id: string
  orderNumber: string
  totalAmount: string
  status: string | null
  paymentStatus: string | null
  createdAt: Date
}

interface CustomerStats {
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
}

export default function AdminCustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string

  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([])
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCustomerDetails()
  }, [customerId])

  const loadCustomerDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getCustomerDetails(customerId)
      if (result.success && result.data) {
        setCustomer(result.data.customer as CustomerData)
        setCustomerOrders(result.data.orders as CustomerOrder[])
        setStats(result.data.stats as CustomerStats)
      } else {
        setError(result.error || 'Failed to load customer details')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
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

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <Link href="/admin/customers">
          <Button variant="ghost" className="rounded-xl gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Customers
          </Button>
        </Link>
        <Card className="rounded-2xl p-8 text-center">
          <p className="text-destructive font-medium">{error || 'Customer not found'}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link href="/admin/customers">
          <Button variant="ghost" className="rounded-xl gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{customer.name || 'Unnamed Customer'}</h1>
          <p className="text-sm text-muted-foreground">{customer.email}</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </Card>
          <Card className="rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">{formatPrice(stats.totalSpent)}</p>
              </div>
            </div>
          </Card>
          <Card className="rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                <p className="text-2xl font-bold">{formatPrice(stats.averageOrderValue)}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Customer Profile Card */}
      <Card className="rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">Customer Profile</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{customer.name || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{customer.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Member Since</p>
            <p className="font-medium">{formatDate(customer.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Customer ID</p>
            <p className="font-medium text-xs text-muted-foreground">{customer.id}</p>
          </div>
        </div>
      </Card>

      {/* Order History */}
      <Card className="rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">Order History</h2>
          <Badge variant="outline" className="ml-auto">
            {customerOrders.length} {customerOrders.length === 1 ? 'order' : 'orders'}
          </Badge>
        </div>
        {customerOrders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Order #</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Payment</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {customerOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-semibold">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusVariant(order.status)}>
                        {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusVariant(order.paymentStatus)}>
                        {(order.paymentStatus || 'pending').charAt(0).toUpperCase() + (order.paymentStatus || 'pending').slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="rounded-xl">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
