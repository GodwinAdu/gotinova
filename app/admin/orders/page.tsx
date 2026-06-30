'use client'

import { useEffect, useState } from 'react'
import { Loader2, Search, Eye } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface AdminOrder {
  id: string
  orderNumber: string
  customerName: string
  totalAmount: number
  status: string
  paymentStatus: string
  createdAt: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        // Mock data
        const mockOrders: AdminOrder[] = [
          {
            id: '1',
            orderNumber: '#ORD-001',
            customerName: 'Ahmed Ali',
            totalAmount: 8500,
            status: 'delivered',
            paymentStatus: 'paid',
            createdAt: '2024-06-20',
          },
          {
            id: '2',
            orderNumber: '#ORD-002',
            customerName: 'Fatima Khan',
            totalAmount: 15000,
            status: 'pending',
            paymentStatus: 'pending',
            createdAt: '2024-06-21',
          },
        ]
        setOrders(mockOrders)
      } catch (err) {
        console.error('[v0] Load orders error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  const filteredOrders = orders.filter(o =>
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-600'
      case 'pending':
        return 'bg-yellow-600'
      case 'cancelled':
        return 'bg-destructive'
      default:
        return 'bg-primary'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-600'
      case 'pending':
        return 'bg-yellow-600'
      case 'failed':
        return 'bg-destructive'
      default:
        return 'bg-primary'
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Orders</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by order number or customer..."
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
                  <th className="px-6 py-3 text-left text-sm font-semibold">Order ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Payment</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{order.customerName}</td>
                    <td className="px-6 py-4 font-semibold text-primary">
                      PKR {order.totalAmount.toFixed(0)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="w-4 h-4" />
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
