'use server'

import { db } from '@/lib/db'
import { productAttributes, adminUsers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { v4 as uuid } from 'uuid'
import { revalidatePath } from 'next/cache'

async function verifyAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const admin = await db.select().from(adminUsers).where(and(eq(adminUsers.userId, session.user.id), eq(adminUsers.isActive, true)))
  if (!admin.length) throw new Error('Not authorized as admin')
}

export async function saveProductAttributes(productId: string, attributes: Array<{ name: string; value: string }>) {
  try {
    await verifyAdmin()

    // Delete existing attributes for this product
    await db.delete(productAttributes).where(eq(productAttributes.productId, productId))

    // Insert new attributes
    if (attributes.length > 0) {
      await db.insert(productAttributes).values(
        attributes
          .filter(a => a.name.trim() && a.value.trim())
          .map(a => ({
            id: uuid(),
            productId,
            name: a.name.trim(),
            value: a.value.trim(),
          }))
      )
    }

    revalidatePath(`/products/${productId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error saving attributes:', error)
    return { success: false, error: error.message || 'Failed to save attributes' }
  }
}
