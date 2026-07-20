'use server'

import { db } from '@/lib/db'
import { coupons } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { v4 as uuid } from 'uuid'

/**
 * Gift Cards are implemented using the existing coupons system.
 * A gift card is a coupon with:
 * - discountType: 'fixed'
 * - maxUses: 1
 * - A unique code prefixed with 'GC-'
 * - description: 'Gift Card from [sender]'
 */

function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No ambiguous chars (0/O, 1/I)
  let code = 'GC-'
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function purchaseGiftCard(data: {
  amount: number
  recipientName: string
  recipientEmail: string
  senderName: string
  message?: string
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return { success: false, error: 'Please sign in to purchase a gift card' }
    }

    if (data.amount < 50 || data.amount > 10000) {
      return { success: false, error: 'Gift card amount must be between GH₵ 50 and GH₵ 10,000' }
    }

    const code = generateGiftCardCode()

    await db.insert(coupons).values({
      id: uuid(),
      code,
      description: `Gift Card from ${data.senderName} to ${data.recipientName}${data.message ? ` — "${data.message}"` : ''}`,
      discountType: 'fixed',
      discountValue: data.amount.toString(),
      maxUses: 1,
      currentUses: 0,
      isActive: true,
    })

    // In production, send email to recipient with the code
    // For now, return the code to display on screen
    return {
      success: true,
      data: {
        code,
        amount: data.amount,
        recipientName: data.recipientName,
        recipientEmail: data.recipientEmail,
      },
      message: 'Gift card created successfully!',
    }
  } catch (error: any) {
    console.error('Error creating gift card:', error)
    return { success: false, error: error.message || 'Failed to create gift card' }
  }
}

export async function checkGiftCardBalance(code: string) {
  try {
    const result = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code.trim().toUpperCase()))

    if (!result.length) {
      return { success: false, error: 'Gift card not found' }
    }

    const card = result[0]

    if (!card.code.startsWith('GC-')) {
      return { success: false, error: 'This is not a gift card code' }
    }

    if ((card.currentUses || 0) >= (card.maxUses || 1)) {
      return { success: true, data: { code: card.code, balance: 0, used: true } }
    }

    return {
      success: true,
      data: {
        code: card.code,
        balance: parseFloat(card.discountValue),
        used: false,
        description: card.description,
      },
    }
  } catch (error: any) {
    return { success: false, error: 'Failed to check balance' }
  }
}


// ============ Admin Actions ============

async function verifyAdmin() {
  const { adminUsers } = await import('@/lib/db/schema')
  const { and } = await import('drizzle-orm')
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const admin = await db.select().from(adminUsers).where(and(eq(adminUsers.userId, session.user.id), eq(adminUsers.isActive, true)))
  if (!admin.length) throw new Error('Not authorized as admin')
}

export async function adminCreateGiftCard(data: {
  amount: number
  recipientName: string
  note?: string
}) {
  try {
    await verifyAdmin()

    const code = generateGiftCardCode()

    await db.insert(coupons).values({
      id: uuid(),
      code,
      description: data.note || `Gift Card for ${data.recipientName}`,
      discountType: 'fixed',
      discountValue: data.amount.toString(),
      maxUses: 1,
      currentUses: 0,
      isActive: true,
    })

    return { success: true, data: { code, amount: data.amount } }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create gift card' }
  }
}

export async function getAllGiftCards() {
  try {
    await verifyAdmin()

    // Gift cards are coupons with code starting with 'GC-'
    const { like } = await import('drizzle-orm')
    const result = await db
      .select()
      .from(coupons)
      .where(like(coupons.code, 'GC-%'))
      .orderBy(coupons.code)

    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch gift cards' }
  }
}
