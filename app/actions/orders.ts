'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders, orderItems, cartItems, products, deliveryTracking } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { v4 as uuid } from 'uuid'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function createOrder(data: {
  shippingAddress: string
  billingAddress: string
  paymentMethod: string
}) {
  try {
    const userId = await getUserId()

    // Get cart items
    const cart = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        product: products,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId))

    if (cart.length === 0) {
      return { success: false, error: 'Cart is empty' }
    }

    // Calculate totals
    const subtotal = cart.reduce(
      (total, item) => total + parseFloat(item.product.price) * item.quantity,
      0
    )
    const tax = subtotal * 0.1
    const shippingCost = subtotal > 100 ? 0 : 10
    const totalAmount = subtotal + tax + shippingCost

    // Create order
    const orderId = uuid()
    const orderNumber = `ORD-${Date.now()}`

    await db.insert(orders).values({
      id: orderId,
      userId,
      orderNumber,
      totalAmount: totalAmount.toString(),
      subtotal: subtotal.toString(),
      shippingCost: shippingCost.toString(),
      tax: tax.toString(),
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress,
      paymentMethod: data.paymentMethod,
      status: 'pending',
      paymentStatus: 'pending',
    })

    // Create order items
    for (const item of cart) {
      await db.insert(orderItems).values({
        id: uuid(),
        orderId,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        subtotal: (parseFloat(item.product.price) * item.quantity).toString(),
      })
    }

    // Clear cart
    for (const item of cart) {
      await db.delete(cartItems).where(eq(cartItems.id, item.id))
    }

    revalidatePath('/orders')
    return {
      success: true,
      data: { orderId, orderNumber, totalAmount },
      message: 'Order created successfully',
    }
  } catch (error) {
    console.error('Error creating order:', error)
    return { success: false, error: 'Failed to create order' }
  }
}

export async function getOrders(limit = 20) {
  try {
    const userId = await getUserId()

    const result = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(limit)

    return { success: true, data: result }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return { success: false, error: 'Failed to fetch orders' }
  }
}

export async function getOrderDetails(orderId: string) {
  try {
    const userId = await getUserId()

    const order = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))

    if (!order.length) {
      return { success: false, error: 'Order not found' }
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId))

    const tracking = await db
      .select()
      .from(deliveryTracking)
      .where(eq(deliveryTracking.orderId, orderId))

    return {
      success: true,
      data: {
        order: order[0],
        items,
        tracking: tracking[0] || null,
      },
    }
  } catch (error) {
    console.error('Error fetching order details:', error)
    return { success: false, error: 'Failed to fetch order details' }
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const userId = await getUserId()

    // Verify user owns this order
    const order = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))

    if (!order.length) {
      return { success: false, error: 'Order not found' }
    }

    await db.update(orders).set({ status }).where(eq(orders.id, orderId))

    revalidatePath('/orders')
    return { success: true, message: 'Order status updated' }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, error: 'Failed to update order status' }
  }
}

export async function getOrderTracking(orderId: string) {
  try {
    const userId = await getUserId()

    // Verify user owns this order
    const order = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))

    if (!order.length) {
      return { success: false, error: 'Order not found' }
    }

    const tracking = await db
      .select()
      .from(deliveryTracking)
      .where(eq(deliveryTracking.orderId, orderId))

    return { success: true, data: tracking[0] || null }
  } catch (error) {
    console.error('Error fetching tracking:', error)
    return { success: false, error: 'Failed to fetch tracking information' }
  }
}
