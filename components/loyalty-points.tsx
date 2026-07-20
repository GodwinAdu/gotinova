'use client'

import { useEffect, useState } from 'react'
import { Gift, Star, TrendingUp, Award } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils/format'

/**
 * Loyalty Points System
 * 
 * Simple points system:
 * - Earn 1 point per GH₵ 10 spent
 * - 100 points = GH₵ 10 discount
 * 
 * Stored in localStorage for now.
 * In production, this should be stored in a DB table.
 */

const STORAGE_KEY = 'luxehair-loyalty-points'
const POINTS_PER_CEDI = 0.1 // 1 point per GH₵ 10
const POINTS_VALUE = 0.1 // 1 point = GH₵ 0.10

interface LoyaltyData {
  points: number
  totalEarned: number
  totalRedeemed: number
  history: Array<{
    type: 'earned' | 'redeemed'
    amount: number
    description: string
    date: string
  }>
}

function getLoyaltyData(): LoyaltyData {
  if (typeof window === 'undefined') return { points: 0, totalEarned: 0, totalRedeemed: 0, history: [] }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return { points: 0, totalEarned: 0, totalRedeemed: 0, history: [] }
}

function saveLoyaltyData(data: LoyaltyData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function earnPoints(orderTotal: number, orderNumber: string): number {
  const pointsEarned = Math.floor(orderTotal * POINTS_PER_CEDI)
  if (pointsEarned <= 0) return 0

  const data = getLoyaltyData()
  data.points += pointsEarned
  data.totalEarned += pointsEarned
  data.history.unshift({
    type: 'earned',
    amount: pointsEarned,
    description: `Order ${orderNumber}`,
    date: new Date().toISOString(),
  })
  saveLoyaltyData(data)
  return pointsEarned
}

export function getPointsBalance(): number {
  return getLoyaltyData().points
}

export function getPointsValue(points: number): number {
  return points * POINTS_VALUE
}

function getTier(totalEarned: number): { name: string; icon: typeof Star; color: string; minPoints: number } {
  if (totalEarned >= 1000) return { name: 'Gold', icon: Award, color: 'text-amber-500', minPoints: 1000 }
  if (totalEarned >= 500) return { name: 'Silver', icon: Star, color: 'text-slate-400', minPoints: 500 }
  return { name: 'Bronze', icon: Star, color: 'text-orange-600', minPoints: 0 }
}

/**
 * Loyalty points card — show on account page
 */
export function LoyaltyPointsCard() {
  const [data, setData] = useState<LoyaltyData>({ points: 0, totalEarned: 0, totalRedeemed: 0, history: [] })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setData(getLoyaltyData())
  }, [])

  if (!mounted) return null

  const tier = getTier(data.totalEarned)
  const TierIcon = tier.icon
  const pointsValue = getPointsValue(data.points)
  const nextTierPoints = tier.name === 'Bronze' ? 500 : tier.name === 'Silver' ? 1000 : null
  const progress = nextTierPoints ? (data.totalEarned / nextTierPoints) * 100 : 100

  return (
    <Card className="p-5 sm:p-6 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Loyalty Points</h3>
        </div>
        <Badge variant="outline" className="gap-1">
          <TierIcon className={`w-3 h-3 ${tier.color}`} />
          {tier.name}
        </Badge>
      </div>

      {/* Points balance */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 text-center">
        <p className="text-3xl font-bold text-foreground">{data.points.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Points available ({formatPrice(pointsValue)} value)
        </p>
      </div>

      {/* Tier progress */}
      {nextTierPoints && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress to {tier.name === 'Bronze' ? 'Silver' : 'Gold'}</span>
            <span className="font-medium">{data.totalEarned}/{nextTierPoints}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="space-y-2 pt-2 border-t border-border">
        <p className="text-xs font-medium">How it works:</p>
        <div className="grid grid-cols-1 gap-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            Earn 1 point for every GH₵ 10 spent
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Gift className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            100 points = GH₵ 10 discount
          </div>
        </div>
      </div>

      {/* Recent history */}
      {data.history.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border">
          <p className="text-xs font-medium">Recent Activity</p>
          <div className="space-y-1.5">
            {data.history.slice(0, 3).map((entry, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{entry.description}</span>
                <span className={entry.type === 'earned' ? 'text-emerald-600 font-medium' : 'text-destructive font-medium'}>
                  {entry.type === 'earned' ? '+' : '-'}{entry.amount} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

/**
 * Small points indicator — show at checkout or in header
 */
export function PointsIndicator() {
  const [points, setPoints] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setPoints(getLoyaltyData().points)
  }, [])

  if (!mounted || points === 0) return null

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Gift className="w-3.5 h-3.5 text-primary" />
      <span>{points} pts</span>
    </div>
  )
}
