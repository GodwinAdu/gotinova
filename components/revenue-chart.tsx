'use client'

import { useEffect, useState } from 'react'
import { Loader2, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils/format'
import { getRevenueChartData } from '@/app/actions/admin'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

interface ChartDataPoint {
  date: string
  orders: number
  revenue: number
}

type Period = 'week' | 'month' | 'year'

export function RevenueChart() {
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('month')
  const [chartType, setChartType] = useState<'revenue' | 'orders'>('revenue')

  useEffect(() => {
    loadData()
  }, [period])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await getRevenueChartData(period)
      if (result.success && result.data) {
        setData(result.data)
      }
    } catch {}
    setLoading(false)
  }

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-card border border-border rounded-xl shadow-lg p-3 text-xs">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }} className="font-medium">
            {entry.name === 'revenue' ? formatPrice(entry.value) : `${entry.value} orders`}
          </p>
        ))}
      </div>
    )
  }

  return (
    <Card className="rounded-2xl p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Revenue Trends</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Chart type toggle */}
          <div className="flex gap-1 p-0.5 bg-muted rounded-lg">
            <button
              onClick={() => setChartType('revenue')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                chartType === 'revenue' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setChartType('orders')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                chartType === 'orders' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Orders
            </button>
          </div>

          {/* Period toggle */}
          <div className="flex gap-1 p-0.5 bg-muted rounded-lg">
            {(['week', 'month', 'year'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all capitalize ${
                  period === p ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                {p === 'week' ? '7D' : p === 'month' ? '30D' : '12M'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-6">
        <div>
          <p className="text-xs text-muted-foreground">Total Revenue</p>
          <p className="text-lg font-bold">{formatPrice(totalRevenue)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total Orders</p>
          <p className="text-lg font-bold">{totalOrders}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 sm:h-72">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No data for this period</p>
          </div>
        ) : chartType === 'revenue' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(v) => period === 'year' ? v.slice(5) : v.slice(5)}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(v) => period === 'year' ? v.slice(5) : v.slice(5)}
              />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
