'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Tag, X, CheckCircle } from 'lucide-react'
import { validateCoupon, type CouponResult } from '@/app/actions/coupons'
import { formatPrice } from '@/lib/utils/format'

interface AppliedCoupon {
  id: string
  code: string
  description: string | null
  discountType: string
  discountValue: number
}

interface CouponInputProps {
  subtotal: number
  onApply: (coupon: AppliedCoupon) => void
  onRemove: () => void
  appliedCoupon: AppliedCoupon | null
}

export function CouponInput({ subtotal, onApply, onRemove, appliedCoupon }: CouponInputProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleApply = async () => {
    if (!code.trim()) {
      setError('Enter a coupon code')
      return
    }

    setError('')
    setLoading(true)

    try {
      const result = await validateCoupon(code.trim(), subtotal)

      if (result.success && result.coupon) {
        onApply({
          id: result.coupon.id,
          code: result.coupon.code,
          description: result.coupon.description,
          discountType: result.coupon.discountType,
          discountValue: result.coupon.discountValue,
        })
        setCode('')
        setError('')
      } else {
        setError(result.error || 'Invalid coupon')
      }
    } catch {
      setError('Failed to validate coupon')
    } finally {
      setLoading(false)
    }
  }

  // Show applied coupon
  if (appliedCoupon) {
    const discountText = appliedCoupon.discountType === 'percentage'
      ? `${appliedCoupon.discountValue}% off`
      : `${formatPrice(appliedCoupon.discountValue)} off`

    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              {appliedCoupon.code}
            </span>
          </div>
          <button
            onClick={onRemove}
            className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
            title="Remove coupon"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          {appliedCoupon.description || discountText}
        </p>
      </div>
    )
  }

  // Show input form
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError('') }}
            placeholder="Coupon code"
            className="pl-9 h-9 text-sm uppercase"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApply() } }}
            disabled={loading}
          />
        </div>
        <Button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          variant="outline"
          size="sm"
          className="rounded-xl h-9 px-4"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
        </Button>
      </div>
      {error && (
        <p className="text-[11px] text-destructive font-medium">{error}</p>
      )}
    </div>
  )
}
