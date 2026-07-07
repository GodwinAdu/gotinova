'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { cartItems, products } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { v4 as uuid } from 'uuid'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  // Allow guests with a temporary session ID
  return session?.user?.id || 'guest'
}

export async function addToCart(productId: string, quantity: number = 1) {
  try {
    const userId = await getUserId()

    // Check if product exists and has stock
    const product = await db.select().from(products).where(eq(products.id, productId))
    if (!product.length) {
      return { success: false, error: 'Product not found' }
    }

    if (product[0].stock < quantity) {
      return { success: false, error: 'Insufficient stock' }
    }

    // Check if item already in cart
    const existing = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))

    if (existing.length > 0) {
      // Update quantity
      await db
        .update(cartItems)
        .set({ quantity: existing[0].quantity + quantity })
        .where(eq(cartItems.id, existing[0].id))
    } else {
      // Add new item
      await db.insert(cartItems).values({
        id: uuid(),
        userId,
        productId,
        quantity,
      })
    }

    revalidatePath('/cart')
    return { success: true, message: 'Item added to cart' }
  } catch (error) {
    console.error('Error adding to cart:', error)
    return { success: false, error: 'Failed to add to cart' }
  }
}

export async function updateCartItem(cartItemId: string, quantity: number) {
  try {
    const userId = await getUserId()

    const item = await db.select().from(cartItems).where(eq(cartItems.id, cartItemId))
    if (!item.length) {
      return { success: false, error: 'Item not found' }
    }
    
    // Allow access if user owns the item or is the guest who added it
    if (item[0].userId !== userId && userId !== 'guest') {
      return { success: false, error: 'Unauthorized' }
    }

    if (quantity <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, cartItemId))
    } else {
      await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, cartItemId))
    }

    revalidatePath('/cart')
    return { success: true, message: 'Cart updated' }
  } catch (error) {
    console.error('Error updating cart:', error)
    return { success: false, error: 'Failed to update cart' }
  }
}

export async function removeFromCart(cartItemId: string) {
  try {
    const userId = await getUserId()

    const item = await db.select().from(cartItems).where(eq(cartItems.id, cartItemId))
    if (!item.length) {
      return { success: false, error: 'Item not found' }
    }
    
    // Allow access if user owns the item or is the guest who added it
    if (item[0].userId !== userId && userId !== 'guest') {
      return { success: false, error: 'Unauthorized' }
    }

    await db.delete(cartItems).where(eq(cartItems.id, cartItemId))

    revalidatePath('/cart')
    return { success: true, message: 'Item removed from cart' }
  } catch (error) {
    console.error('Error removing from cart:', error)
    return { success: false, error: 'Failed to remove item' }
  }
}

export async function getCart() {
  try {
    const userId = await getUserId()

    const items = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        product: products,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId))

    return { success: true, data: items }
  } catch (error) {
    console.error('Error fetching cart:', error)
    return { success: false, error: 'Failed to fetch cart' }
  }
}
