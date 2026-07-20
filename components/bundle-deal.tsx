'use client'

import { useEffect, useState } from 'react'
import { Package, Tag, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils/format'
import { getBundleDealsConfig, type BundleDeal } from '@/app/actions/settings'

/**
 * Bundle Deals — Admin-controlled quantity discounts.
 * Config is fetched from the database (managed via /admin/settings).
 * Fallback to defaults if fetch fails.
 */

const DEFAULT_DEALS: BundleDeal[] = [
  { minQty: 2, discount: 5, label: 'Buy 2, Get 5% Off', enabled: true },
  { minQty: 3, discount: 10, label: 'Buy 3, Get 10% Off', enabled: true },
  { minQty: 5, discount: 15, label: 'Buy 5, Get 15% Off', enabled: true },
]

/**
 * Calculate the best applicable bundle discount based on total items in cart
 */
export function getBundleDiscount(totalItems: number, deals: BundleDeal[] = DEFAULT_DEALS): { discount: number; label: string } | null {
  const enabled = deals.filter(d => d.enabled)
  const applicable = enabled
    .filter(deal => totalItems >= deal.minQty)
    .sort((a, b) => b.discount - a.discount)
  return applicable.length > 0 ? applicable[0] : null
}

/**
 * Calculate bundle savings amount
 */
export function calculateBundleSavings(subtotal: number, totalItems: number, deals: BundleDeal[] = DEFAULT_DEALS): number {
  const deal = getBundleDiscount(totalItems, deals)
  if (!deal) return 0
  return (subtotal * deal.discount) / 100
}

/**
 * Bundle deal indicator — shows on product pages and cart
 * to incentivize buying more items.
 */
export function BundleDealBadge({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false)
  const [deals, setDeals] = useState<BundleDeal[]>(DEFAULT_DEALS)
  const items = useCartStore((s) => s.items)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    setMounted(true)
    getBundleDealsConfig().then(setDeals).catch(() => {})
  }, [])

  if (!mounted) return null

  const enabledDeals = deals.filter(d => d.enabled)
  if (enabledDeals.length === 0) return null

  const currentDeal = getBundleDiscount(totalItems, deals)
  const nextDeal = enabledDeals.find(d => d.minQty > totalItems)

  if (!nextDeal && !currentDeal) return null

  return (
    <div className={cn('bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-primary">Bundle & Save</span>
      </div>

      {/* Show current deal */}
      {currentDeal && (
        <div className="flex items-center gap-2 text-xs text-emerald-600">
          <Check className="w-3.5 h-3.5" />
          <span className="font-medium">{currentDeal.label} — Applied!</span>
        </div>
      )}

      {/* Show next deal to unlock */}
      {nextDeal && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Tag className="w-3.5 h-3.5" />
          <span>Add {nextDeal.minQty - totalItems} more item{nextDeal.minQty - totalItems > 1 ? 's' : ''} for <strong className="text-foreground">{nextDeal.discount}% off</strong></span>
        </div>
      )}
    </div>
  )
}

/**
 * Bundle deals list — show on product detail pages to incentivize
 */
export function BundleDealsInfo({ className }: { className?: string }) {
  const [deals, setDeals] = useState<BundleDeal[]>(DEFAULT_DEALS)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    getBundleDealsConfig().then(setDeals).catch(() => {})
  }, [])

  if (!mounted) return null

  const enabledDeals = deals.filter(d => d.enabled)
  if (enabledDeals.length === 0) return null

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">Bundle & Save</span>
      </div>
      <div className="grid gap-1.5">
        {enabledDeals.map((deal) => (
          <div
            key={deal.minQty}
            className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg text-xs"
          >
            <span className="font-medium">{deal.label}</span>
            <span className="text-primary font-bold">-{deal.discount}%</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground">
        Discount applies automatically when items are in your cart
      </p>
    </div>
  )
}
