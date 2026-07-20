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
  items?: Array<{ productId: string; name: string; price: number; quantity: number }>
}) {
  try {
    const userId = await getUserId()

    // Rate limit: max 3 orders per minute per user
    const { orderLimiter } = await import('@/lib/rate-limit')
    const { success: rateLimitOk } = await orderLimiter.check(userId)
    if (!rateLimitOk) {
      return { success: false, error: 'Please wait before placing another order' }
    }

    // Try to get items from the client-provided list, or fall back to DB cart
    let orderItemsData: Array<{ productId: string; name: string; price: number; quantity: number }> = []

    if (data.items && data.items.length > 0) {
      orderItemsData = data.items
    } else {
      // Fall back to DB cart
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

      orderItemsData = cart.map(item => ({
        productId: item.productId,
        name: item.product.name,
        price: parseFloat(item.product.price),
        quantity: item.quantity,
      }))

      // Clear DB cart after reading
      for (const item of cart) {
        await db.delete(cartItems).where(eq(cartItems.id, item.id))
      }
    }

    if (orderItemsData.length === 0) {
      return { success: false, error: 'No items to order' }
    }

    // Calculate totals
    const subtotal = orderItemsData.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
    // Load pricing config from admin settings
    const { getShippingConfig, getTaxRate } = await import('@/app/actions/settings')
    const shippingConfig = await getShippingConfig()
    const taxRateDecimal = await getTaxRate()

    const tax = subtotal * taxRateDecimal
    const shippingCost = subtotal >= shippingConfig.freeThreshold ? 0 : shippingConfig.cost
    const totalAmount = subtotal + tax + shippingCost

    // Create order
    const orderId = uuid()
    const orderNumber = `LH-${Date.now().toString(36).toUpperCase()}`

    await db.insert(orders).values({
      id: orderId,
      userId,
      orderNumber,
      totalAmount: totalAmount.toFixed(2),
      subtotal: subtotal.toFixed(2),
      shippingCost: shippingCost.toFixed(2),
      tax: tax.toFixed(2),
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress,
      paymentMethod: data.paymentMethod,
      status: 'pending',
      paymentStatus: 'pending',
    })

    // Create order items
    for (const item of orderItemsData) {
      await db.insert(orderItems).values({
        id: uuid(),
        orderId,
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        price: item.price.toFixed(2),
        subtotal: (item.price * item.quantity).toFixed(2),
      })
    }

    // Send order confirmation email (non-blocking)
    try {
      const { sendOrderConfirmation } = await import('@/lib/email')
      const shippingInfo = data.shippingAddress ? JSON.parse(data.shippingAddress) : {}
      sendOrderConfirmation({
        customerEmail: shippingInfo.email || '',
        customerName: shippingInfo.name || 'Customer',
        orderNumber,
        items: orderItemsData.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
        total: totalAmount,
        paymentMethod: data.paymentMethod || 'N/A',
      }).catch(() => {}) // Don't fail the order if email fails
    } catch {}

    // Check inventory levels and alert admin if low (non-blocking)
    try {
      const { checkAndAlertLowStock } = await import('@/lib/inventory-alerts')
      const productIds = orderItemsData.map(item => item.productId).filter(Boolean)
      if (productIds.length > 0) {
        checkAndAlertLowStock(productIds).catch(() => {})
      }
    } catch {}

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
