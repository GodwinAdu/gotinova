'use server'

import { db } from '@/lib/db'
import { coupons } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export interface CouponResult {
  success: boolean
  error?: string
  coupon?: {
    id: string
    code: string
    description: string | null
    discountType: string
    discountValue: number
    minOrderAmount: number | null
  }
}

export async function validateCoupon(code: string, orderSubtotal: number): Promise<CouponResult> {
  try {
    if (!code.trim()) {
      return { success: false, error: 'Please enter a coupon code' }
    }

    const result = await db
      .select()
      .from(coupons)
      .where(
        and(
          eq(coupons.code, code.trim().toUpperCase()),
          eq(coupons.isActive, true)
        )
      )

    if (!result.length) {
      return { success: false, error: 'Invalid coupon code' }
    }

    const coupon = result[0]

    // Check expiry dates
    const now = new Date()
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return { success: false, error: 'This coupon is not yet active' }
    }
    if (coupon.validTo && new Date(coupon.validTo) < now) {
      return { success: false, error: 'This coupon has expired' }
    }

    // Check max uses
    if (coupon.maxUses && (coupon.currentUses || 0) >= coupon.maxUses) {
      return { success: false, error: 'This coupon has reached its usage limit' }
    }

    // Check minimum order amount
    const minAmount = coupon.minOrderAmount ? parseFloat(coupon.minOrderAmount) : 0
    if (minAmount > 0 && orderSubtotal < minAmount) {
      return {
        success: false,
        error: `Minimum order amount of GH₵ ${minAmount.toFixed(2)} required for this coupon`,
      }
    }

    return {
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: parseFloat(coupon.discountValue),
        minOrderAmount: minAmount > 0 ? minAmount : null,
      },
    }
  } catch (error) {
    console.error('Error validating coupon:', error)
    return { success: false, error: 'Failed to validate coupon' }
  }
}

/**
 * Increment coupon usage count (call after order is placed)
 */
export async function incrementCouponUsage(couponId: string): Promise<void> {
  try {
    const coupon = await db.select().from(coupons).where(eq(coupons.id, couponId))
    if (coupon.length > 0) {
      await db
        .update(coupons)
        .set({ currentUses: (coupon[0].currentUses || 0) + 1 })
        .where(eq(coupons.id, couponId))
    }
  } catch (error) {
    console.error('Error incrementing coupon usage:', error)
  }
}
