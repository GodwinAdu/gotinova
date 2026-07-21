'use client'

import { Shield, RotateCcw, Truck, Lock, Award } from 'lucide-react'

/**
 * Trust badges section — shows on product detail pages to build confidence.
 */
export function TrustBadges() {
  const badges = [
    { icon: Shield, label: '100% Authentic', desc: 'Genuine products guaranteed' },
    { icon: RotateCcw, label: '7-Day Returns', desc: 'Easy return policy' },
    { icon: Truck, label: 'Fast Delivery', desc: '2-5 days nationwide' },
    { icon: Lock, label: 'Secure Payment', desc: 'Paystack encrypted' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-4">
      {badges.map((badge, i) => (
        <div key={i} className="flex items-center gap-2 p-2.5 bg-muted/40 rounded-xl">
          <badge.icon className="w-4 h-4 text-primary flex-shrink-0" />
          <div>
            <p className="text-[11px] font-semibold leading-tight">{badge.label}</p>
            <p className="text-[9px] text-muted-foreground leading-tight">{badge.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Compact guarantee banner for checkout/cart
 */
export function GuaranteeBanner() {
  return (
    <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl">
      <Award className="w-8 h-8 text-emerald-600 flex-shrink-0" />
      <div>
        <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">Money-Back Guarantee</p>
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Not satisfied? Get a full refund within 7 days, no questions asked.</p>
      </div>
    </div>
  )
}
