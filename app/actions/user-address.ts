'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export interface SavedAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  zipCode: string
}

export async function getSavedAddress(): Promise<SavedAddress | null> {
  try {
    const userId = await getUserId()
    const result = await db.select({ shippingAddress: user.shippingAddress }).from(user).where(eq(user.id, userId))

    if (result.length > 0 && result[0].shippingAddress) {
      return JSON.parse(result[0].shippingAddress) as SavedAddress
    }
    return null
  } catch {
    return null
  }
}

export async function saveAddress(address: SavedAddress): Promise<{ success: boolean }> {
  try {
    const userId = await getUserId()
    await db.update(user).set({
      shippingAddress: JSON.stringify(address),
      phone: address.phone || undefined,
      updatedAt: new Date(),
    }).where(eq(user.id, userId))
    return { success: true }
  } catch {
    return { success: false }
  }
}
