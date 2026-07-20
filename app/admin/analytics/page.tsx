'use client'

import { useEffect, useState } from 'react'
import { Loader2, TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAnalytics } from '@/app/actions/admin'
import { formatPrice } from '@/lib/utils/format'
import { RevenueChart } from '@/components/revenue-chart'

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  averageOrderValue: number
  topProducts: {
    name: string
    productId: string | null
    sales: number
    revenue: number
  }[]
  recentOrders: {
    id: string
    orderNumber: string
    totalAmount: string
    status: string
    createdAt: Date
    customerName: string
  }[]
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const result = await getAnalytics()
      if (result.success && result.data) {
        setData(result.data as AnalyticsData)
      } else {
        setError(result.error || 'Failed to load analytics')
      }
    } catch (err) {
      console.error('Failed to load analytics:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Card className="p-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </Card>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">{error || 'No data available'}</p>
        </Card>
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Revenue',
      value: formatPrice(data.totalRevenue),
      icon: DollarSign,
    },
    {
      label: 'Total Orders',
      value: data.totalOrders.toLocaleString(),
      icon: ShoppingCart,
    },
    {
      label: 'Total Customers',
      value: data.totalCustomers.toLocaleString(),
      icon: Users,
    },
    {
      label: 'Avg Order Value',
      value: formatPrice(data.averageOrderValue),
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card key={idx} className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">Top Selling Products</h2>
          {data.topProducts.length > 0 ? (
            <div className="space-y-4">
              {data.topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between pb-4 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sales} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{formatPrice(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No product sales data yet</p>
          )}
        </Card>

        {/* Recent Orders */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">Recent Orders</h2>
          {data.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {data.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between pb-4 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{formatPrice(order.totalAmount)}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No orders yet</p>
          )}
        </Card>
      </div>

      {/* Revenue Chart */}
      <RevenueChart />
    </div>
  )
}
