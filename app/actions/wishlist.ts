'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { wishlistItems, products } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { v4 as uuid } from 'uuid'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function addToWishlist(productId: string) {
  try {
    const userId = await getUserId()

    // Check if product exists
    const product = await db.select().from(products).where(eq(products.id, productId))
    if (!product.length) {
      return { success: false, error: 'Product not found' }
    }

    // Check if already in wishlist
    const existing = await db
      .select()
      .from(wishlistItems)
      .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)))

    if (existing.length > 0) {
      return { success: false, error: 'Already in wishlist' }
    }

    // Add to wishlist
    await db.insert(wishlistItems).values({
      id: uuid(),
      userId,
      productId,
    })

    revalidatePath('/wishlist')
    return { success: true, message: 'Added to wishlist' }
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return { success: false, error: 'Failed to add to wishlist' }
  }
}

export async function removeFromWishlist(productId: string) {
  try {
    const userId = await getUserId()

    await db
      .delete(wishlistItems)
      .where(
        and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId))
      )

    revalidatePath('/wishlist')
    return { success: true, message: 'Removed from wishlist' }
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return { success: false, error: 'Failed to remove from wishlist' }
  }
}

export async function getWishlist() {
  try {
    const userId = await getUserId()

    const items = await db
      .select({
        id: wishlistItems.id,
        productId: wishlistItems.productId,
        product: products,
      })
      .from(wishlistItems)
      .innerJoin(products, eq(wishlistItems.productId, products.id))
      .where(eq(wishlistItems.userId, userId))

    return { success: true, data: items }
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return { success: false, error: 'Failed to fetch wishlist' }
  }
}
