'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react'

export default function AdminAnalyticsPage() {
  // Mock analytics data
  const stats = [
    {
      label: 'Total Revenue',
      value: 'PKR 2,450,000',
      change: '+12.5%',
      icon: DollarSign,
    },
    {
      label: 'Total Orders',
      value: '324',
      change: '+8.2%',
      icon: ShoppingCart,
    },
    {
      label: 'Total Customers',
      value: '1,243',
      change: '+23.1%',
      icon: Users,
    },
    {
      label: 'Growth Rate',
      value: '18.4%',
      change: '+5.6%',
      icon: TrendingUp,
    },
  ]

  const topProducts = [
    { name: 'Brazilian Straight Hair', sales: 245, revenue: 245000 },
    { name: 'HD Lace Frontal', sales: 189, revenue: 189000 },
    { name: 'Body Wave Hair', sales: 156, revenue: 117000 },
    { name: 'Deep Wave Curly', sales: 143, revenue: 143000 },
    { name: 'Water Wave Bundle', sales: 128, revenue: 96000 },
  ]

  const recentOrders = [
    { id: '#ORD-001', customer: 'Ahmed Ali', amount: 8500, status: 'Delivered' },
    { id: '#ORD-002', customer: 'Fatima Khan', amount: 15000, status: 'Pending' },
    { id: '#ORD-003', customer: 'Sara Ahmed', amount: 12000, status: 'Shipped' },
    { id: '#ORD-004', customer: 'Zain Hassan', amount: 9500, status: 'Processing' },
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
                <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                  {stat.change}
                </Badge>
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
          <div className="space-y-4">
            {topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between pb-4 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">PKR {product.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Orders */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">Recent Orders</h2>
          <div className="space-y-4">
            {recentOrders.map((order, idx) => (
              <div key={idx} className="flex items-center justify-between pb-4 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-foreground">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">PKR {order.amount.toLocaleString()}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold">Revenue Trends</h2>
        <div className="h-64 bg-muted rounded flex items-center justify-center">
          <p className="text-muted-foreground">Chart placeholder - Integrate Recharts for visualization</p>
        </div>
      </Card>
    </div>
  )
}
