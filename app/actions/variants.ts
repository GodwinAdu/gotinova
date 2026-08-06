'use server'

import { db } from '@/lib/db'
import { productVariants, adminUsers } from '@/lib/db/schema'
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

export interface VariantInput {
  name: string
  options: Record<string, string> // e.g. { "Size": "Large", "Color": "Black" }
  price: number
  stock: number
  sku?: string
  image?: string
}

export async function getProductVariants(productId: string) {
  try {
    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId))

    return {
      success: true,
      data: variants.map(v => ({
        ...v,
        options: JSON.parse(v.options),
        price: parseFloat(v.price),
      })),
    }
  } catch (error) {
    console.error('Error fetching variants:', error)
    return { success: false, error: 'Failed to fetch variants' }
  }
}

export async function saveProductVariants(productId: string, variants: VariantInput[]) {
  try {
    await verifyAdmin()

    // Delete existing variants for this product
    await db.delete(productVariants).where(eq(productVariants.productId, productId))

    // Insert new variants
    if (variants.length > 0) {
      await db.insert(productVariants).values(
        variants.map(v => ({
          id: uuid(),
          productId,
          name: v.name,
          options: JSON.stringify(v.options),
          price: v.price.toString(),
          stock: v.stock,
          sku: v.sku || null,
          image: v.image || null,
        }))
      )
    }

    revalidatePath(`/products/${productId}`)
    revalidatePath('/admin/products')
    return { success: true, message: `${variants.length} variant(s) saved` }
  } catch (error: any) {
    console.error('Error saving variants:', error)
    return { success: false, error: error.message || 'Failed to save variants' }
  }
}

export async function deleteVariant(variantId: string) {
  try {
    await verifyAdmin()
    await db.delete(productVariants).where(eq(productVariants.id, variantId))
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete variant' }
  }
}
