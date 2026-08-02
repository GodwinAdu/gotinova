'use server'

import { db } from '@/lib/db'
import { coupons, adminUsers } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { v4 as uuid } from 'uuid'

async function verifyAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const admin = await db.select().from(adminUsers).where(and(eq(adminUsers.userId, session.user.id), eq(adminUsers.isActive, true)))
  if (!admin.length) throw new Error('Not authorized as admin')
}

export async function getAllCoupons() {
  try {
    await verifyAdmin()
    const result = await db.select().from(coupons).orderBy(desc(coupons.createdAt))
    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch coupons' }
  }
}

export async function createCouponAction(data: {
  code: string
  description: string | null
  discountType: string
  discountValue: number
  maxUses: number | null
  minOrderAmount: number | null
  validFrom: string | null
  validTo: string | null
}) {
  try {
    await verifyAdmin()

    // Check if code already exists
    const existing = await db.select().from(coupons).where(eq(coupons.code, data.code))
    if (existing.length > 0) {
      return { success: false, error: 'A coupon with this code already exists' }
    }

    await db.insert(coupons).values({
      id: uuid(),
      code: data.code,
      description: data.description,
      discountType: data.discountType,
      discountValue: data.discountValue.toString(),
      maxUses: data.maxUses,
      currentUses: 0,
      minOrderAmount: data.minOrderAmount?.toString() || null,
      validFrom: data.validFrom ? new Date(data.validFrom) : null,
      validTo: data.validTo ? new Date(data.validTo) : null,
      isActive: true,
    })

    revalidatePath('/admin/coupons')
    return { success: true, message: 'Coupon created successfully' }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create coupon' }
  }
}

export async function toggleCouponStatus(couponId: string, isActive: boolean) {
  try {
    await verifyAdmin()
    await db.update(coupons).set({ isActive, updatedAt: new Date() }).where(eq(coupons.id, couponId))
    revalidatePath('/admin/coupons')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update coupon' }
  }
}

export async function deleteCouponAction(couponId: string) {
  try {
    await verifyAdmin()
    await db.delete(coupons).where(eq(coupons.id, couponId))
    revalidatePath('/admin/coupons')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete coupon' }
  }
}
