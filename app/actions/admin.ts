'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { products, categories, adminUsers, user as userTable, orders, orderItems, analytics } from '@/lib/db/schema'
import { eq, and, desc, sql, count, lte } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { v4 as uuid } from 'uuid'

async function verifyAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')

  const admin = await db
    .select()
    .from(adminUsers)
    .where(and(eq(adminUsers.userId, session.user.id), eq(adminUsers.isActive, true)))

  if (!admin.length) throw new Error('Not authorized as admin')
  return session.user.id
}

export async function createProduct(data: {
  name: string
  description: string
  price: number
  originalPrice?: number
  categoryId: string
  stock: number
  image?: string
  sku?: string
}) {
  try {
    await verifyAdmin()

    const productId = uuid()
    await db.insert(products).values({
      id: productId,
      name: data.name,
      description: data.description,
      price: data.price.toString(),
      originalPrice: data.originalPrice?.toString(),
      categoryId: data.categoryId,
      stock: data.stock,
      image: data.image,
      sku: data.sku,
      isActive: true,
    })

    revalidatePath('/products')
    return { success: true, data: { id: productId }, message: 'Product created successfully' }
  } catch (error: any) {
    console.error('Error creating product:', error)
    return { success: false, error: error.message || 'Failed to create product' }
  }
}

export async function updateProduct(productId: string, data: Partial<typeof products.$inferInsert>) {
  try {
    await verifyAdmin()

    await db.update(products).set(data).where(eq(products.id, productId))

    revalidatePath('/products')
    return { success: true, message: 'Product updated successfully' }
  } catch (error: any) {
    console.error('Error updating product:', error)
    return { success: false, error: error.message || 'Failed to update product' }
  }
}

export async function deleteProduct(productId: string) {
  try {
    await verifyAdmin()

    await db.delete(products).where(eq(products.id, productId))

    revalidatePath('/products')
    return { success: true, message: 'Product deleted successfully' }
  } catch (error: any) {
    console.error('Error deleting product:', error)
    return { success: false, error: error.message || 'Failed to delete product' }
  }
}

export async function createCategory(data: { name: string; description?: string; slug: string }) {
  try {
    await verifyAdmin()

    const categoryId = uuid()
    await db.insert(categories).values({
      id: categoryId,
      name: data.name,
      description: data.description,
      slug: data.slug,
    })

    revalidatePath('/products')
    return { success: true, data: { id: categoryId } }
  } catch (error: any) {
    console.error('Error creating category:', error)
    return { success: false, error: error.message || 'Failed to create category' }
  }
}

export async function getAdminStats() {
  try {
    await verifyAdmin()

    const [ordersCount] = await db
      .select({ count: count() })
      .from(orders)

    const [productsCount] = await db
      .select({ count: count() })
      .from(products)

    const [usersCount] = await db
      .select({ count: count() })
      .from(userTable)

    const [revenueResult] = await db
      .select({ total: sql<string>`COALESCE(SUM(CAST("totalAmount" AS NUMERIC)), 0)` })
      .from(orders)

    return {
      success: true,
      data: {
        totalOrders: ordersCount.count,
        totalProducts: productsCount.count,
        totalUsers: usersCount.count,
        totalRevenue: parseFloat(revenueResult.total) || 0,
      },
    }
  } catch (error: any) {
    console.error('Error fetching admin stats:', error)
    return { success: false, error: error.message || 'Failed to fetch stats' }
  }
}

export async function getAllProducts(limit = 50) {
  try {
    await verifyAdmin()

    const result = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt))
      .limit(limit)

    return { success: true, data: result }
  } catch (error: any) {
    console.error('Error fetching products:', error)
    return { success: false, error: error.message || 'Failed to fetch products' }
  }
}

export async function getAllOrders(limit = 50) {
  try {
    await verifyAdmin()

    const result = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        orderNumber: orders.orderNumber,
        totalAmount: orders.totalAmount,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        paymentMethod: orders.paymentMethod,
        createdAt: orders.createdAt,
        customerName: userTable.name,
        customerEmail: userTable.email,
      })
      .from(orders)
      .leftJoin(userTable, eq(orders.userId, userTable.id))
      .orderBy(desc(orders.createdAt))
      .limit(limit)

    return { success: true, data: result }
  } catch (error: any) {
    console.error('Error fetching orders:', error)
    return { success: false, error: error.message || 'Failed to fetch orders' }
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    await verifyAdmin()

    await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))

    // Send email notification based on status change
    try {
      const order = await db.select({
        orderNumber: orders.orderNumber,
        shippingAddress: orders.shippingAddress,
      }).from(orders).where(eq(orders.id, orderId))

      if (order.length > 0) {
        const shippingInfo = order[0].shippingAddress ? JSON.parse(order[0].shippingAddress) : {}
        const email = shippingInfo.email
        const name = shippingInfo.name || 'Customer'

        if (email) {
          const { sendShippingNotification, sendDeliveryConfirmation } = await import('@/lib/email')
          if (status === 'shipped') {
            sendShippingNotification({ customerEmail: email, customerName: name, orderNumber: order[0].orderNumber }).catch(() => {})
          } else if (status === 'delivered') {
            sendDeliveryConfirmation({ customerEmail: email, customerName: name, orderNumber: order[0].orderNumber }).catch(() => {})
          }
        }
      }
    } catch {} // Don't fail status update if email fails

    revalidatePath('/admin/orders')
    return { success: true, message: 'Order status updated successfully' }
  } catch (error: any) {
    console.error('Error updating order status:', error)
    return { success: false, error: error.message || 'Failed to update order status' }
  }
}

export async function getAllUsers(limit = 50) {
  try {
    await verifyAdmin()

    const result = await db
      .select({
        id: userTable.id,
        email: userTable.email,
        name: userTable.name,
        createdAt: userTable.createdAt,
      })
      .from(userTable)
      .orderBy(desc(userTable.createdAt))
      .limit(limit)

    return { success: true, data: result }
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return { success: false, error: error.message || 'Failed to fetch users' }
  }
}

export async function getAllCustomers(limit = 50) {
  try {
    await verifyAdmin()

    const result = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        createdAt: userTable.createdAt,
        totalOrders: sql<number>`CAST(COUNT(${orders.id}) AS INTEGER)`,
        totalSpent: sql<string>`COALESCE(SUM(CAST(${orders.totalAmount} AS NUMERIC)), 0)`,
      })
      .from(userTable)
      .leftJoin(orders, eq(userTable.id, orders.userId))
      .groupBy(userTable.id, userTable.name, userTable.email, userTable.createdAt)
      .orderBy(desc(userTable.createdAt))
      .limit(limit)

    return { success: true, data: result }
  } catch (error: any) {
    console.error('Error fetching customers:', error)
    return { success: false, error: error.message || 'Failed to fetch customers' }
  }
}

export async function getAnalytics() {
  try {
    await verifyAdmin()

    // Total revenue
    const [revenueResult] = await db
      .select({ total: sql<string>`COALESCE(SUM(CAST("totalAmount" AS NUMERIC)), 0)` })
      .from(orders)

    // Total orders count
    const [ordersCount] = await db
      .select({ count: count() })
      .from(orders)

    // Total customers
    const [customersCount] = await db
      .select({ count: count() })
      .from(userTable)

    // Average order value
    const [avgResult] = await db
      .select({ avg: sql<string>`COALESCE(AVG(CAST("totalAmount" AS NUMERIC)), 0)` })
      .from(orders)

    // Top products by order count (join orderItems with products)
    const topProducts = await db
      .select({
        productName: orderItems.productName,
        productId: orderItems.productId,
        totalSales: sql<number>`CAST(SUM(${orderItems.quantity}) AS INTEGER)`,
        totalRevenue: sql<string>`COALESCE(SUM(CAST(${orderItems.subtotal} AS NUMERIC)), 0)`,
      })
      .from(orderItems)
      .groupBy(orderItems.productName, orderItems.productId)
      .orderBy(sql`SUM(${orderItems.quantity}) DESC`)
      .limit(5)

    // Recent orders for the analytics view
    const recentOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        totalAmount: orders.totalAmount,
        status: orders.status,
        createdAt: orders.createdAt,
        customerName: userTable.name,
        customerEmail: userTable.email,
      })
      .from(orders)
      .leftJoin(userTable, eq(orders.userId, userTable.id))
      .orderBy(desc(orders.createdAt))
      .limit(5)

    return {
      success: true,
      data: {
        totalRevenue: parseFloat(revenueResult.total) || 0,
        totalOrders: ordersCount.count,
        totalCustomers: customersCount.count,
        averageOrderValue: parseFloat(avgResult.avg) || 0,
        topProducts: topProducts.map((p) => ({
          name: p.productName,
          productId: p.productId,
          sales: p.totalSales,
          revenue: parseFloat(p.totalRevenue) || 0,
        })),
        recentOrders: recentOrders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          totalAmount: o.totalAmount,
          status: o.status || 'pending',
          createdAt: o.createdAt,
          customerName: o.customerName || o.customerEmail || 'Unknown',
        })),
      },
    }
  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return { success: false, error: error.message || 'Failed to fetch analytics' }
  }
}


export async function getLowStockProducts(threshold = 5) {
  try {
    await verifyAdmin()
    const result = await db
      .select()
      .from(products)
      .where(lte(products.stock, threshold))
      .orderBy(products.stock)
      .limit(10)
    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch low stock products' }
  }
}

export async function getAdminOrderDetails(orderId: string) {
  try {
    await verifyAdmin()

    const order = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        orderNumber: orders.orderNumber,
        totalAmount: orders.totalAmount,
        subtotal: orders.subtotal,
        shippingCost: orders.shippingCost,
        tax: orders.tax,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        paymentMethod: orders.paymentMethod,
        shippingAddress: orders.shippingAddress,
        billingAddress: orders.billingAddress,
        notes: orders.notes,
        createdAt: orders.createdAt,
        customerName: userTable.name,
        customerEmail: userTable.email,
      })
      .from(orders)
      .leftJoin(userTable, eq(orders.userId, userTable.id))
      .where(eq(orders.id, orderId))

    if (!order.length) {
      return { success: false, error: 'Order not found' }
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId))

    return { success: true, data: { order: order[0], items } }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch order details' }
  }
}

export async function updatePaymentStatus(orderId: string, paymentStatus: string) {
  try {
    await verifyAdmin()
    await db.update(orders).set({ paymentStatus, updatedAt: new Date() }).where(eq(orders.id, orderId))
    revalidatePath('/admin/orders')
    return { success: true, message: 'Payment status updated' }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update payment status' }
  }
}

export async function updateOrderNotes(orderId: string, notes: string) {
  try {
    await verifyAdmin()
    await db.update(orders).set({ notes, updatedAt: new Date() }).where(eq(orders.id, orderId))
    return { success: true, message: 'Notes updated' }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update notes' }
  }
}

export async function getCustomerDetails(customerId: string) {
  try {
    await verifyAdmin()

    const customer = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        createdAt: userTable.createdAt,
      })
      .from(userTable)
      .where(eq(userTable.id, customerId))

    if (!customer.length) {
      return { success: false, error: 'Customer not found' }
    }

    const customerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, customerId))
      .orderBy(desc(orders.createdAt))

    const totalSpent = customerOrders.reduce(
      (sum, o) => sum + parseFloat(o.totalAmount || '0'), 0
    )

    return {
      success: true,
      data: {
        customer: customer[0],
        orders: customerOrders,
        stats: {
          totalOrders: customerOrders.length,
          totalSpent,
          averageOrderValue: customerOrders.length > 0 ? totalSpent / customerOrders.length : 0,
        },
      },
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch customer details' }
  }
}

export async function updateProductStock(productId: string, stock: number) {
  try {
    await verifyAdmin()
    await db.update(products).set({ stock, updatedAt: new Date() }).where(eq(products.id, productId))
    revalidatePath('/admin/products')
    return { success: true, message: 'Stock updated' }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update stock' }
  }
}

export async function toggleProductStatus(productId: string, isActive: boolean) {
  try {
    await verifyAdmin()
    await db.update(products).set({ isActive, updatedAt: new Date() }).where(eq(products.id, productId))
    revalidatePath('/admin/products')
    return { success: true, message: isActive ? 'Product activated' : 'Product deactivated' }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update product status' }
  }
}


export async function createCoupon(data: {
  code: string
  description?: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  maxUses?: number
  minOrderAmount?: number
  validFrom?: string
  validTo?: string
}) {
  try {
    await verifyAdmin()

    const { coupons } = await import('@/lib/db/schema')
    const couponId = uuid()

    await db.insert(coupons).values({
      id: couponId,
      code: data.code.toUpperCase(),
      description: data.description,
      discountType: data.discountType,
      discountValue: data.discountValue.toString(),
      maxUses: data.maxUses,
      minOrderAmount: data.minOrderAmount?.toString(),
      validFrom: data.validFrom ? new Date(data.validFrom) : null,
      validTo: data.validTo ? new Date(data.validTo) : null,
      isActive: true,
      currentUses: 0,
    })

    return { success: true, data: { id: couponId }, message: 'Coupon created' }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create coupon' }
  }
}


export async function bulkUpdateStock(updates: Array<{ productId: string; stock: number }>) {
  try {
    await verifyAdmin()

    let updated = 0
    for (const item of updates) {
      if (item.stock >= 0) {
        await db.update(products).set({ stock: item.stock, updatedAt: new Date() }).where(eq(products.id, item.productId))
        updated++
      }
    }

    revalidatePath('/admin/products')
    return { success: true, message: `${updated} product(s) updated successfully` }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update stock' }
  }
}


export async function getRevenueChartData(period: 'week' | 'month' | 'year' = 'month') {
  try {
    await verifyAdmin()

    let interval: string
    let format: string
    let limit: number

    switch (period) {
      case 'week':
        interval = '7 days'
        format = 'YYYY-MM-DD'
        limit = 7
        break
      case 'year':
        interval = '12 months'
        format = 'YYYY-MM'
        limit = 12
        break
      default: // month
        interval = '30 days'
        format = 'YYYY-MM-DD'
        limit = 30
    }

    const result = await db.execute(sql`
      SELECT 
        TO_CHAR("createdAt", ${period === 'year' ? 'YYYY-MM' : 'YYYY-MM-DD'}) as date,
        COUNT(*) as orders,
        COALESCE(SUM(CAST("totalAmount" AS NUMERIC)), 0) as revenue
      FROM "orders"
      WHERE "createdAt" >= NOW() - INTERVAL '${sql.raw(interval)}'
      GROUP BY TO_CHAR("createdAt", ${period === 'year' ? 'YYYY-MM' : 'YYYY-MM-DD'})
      ORDER BY date ASC
    `)

    return {
      success: true,
      data: (result.rows || []).map((row: any) => ({
        date: row.date,
        orders: parseInt(row.orders) || 0,
        revenue: parseFloat(row.revenue) || 0,
      })),
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch chart data' }
  }
}


export async function processRefund(orderId: string, data: {
  reason: string
  amount?: number // partial refund amount, or full if not specified
}) {
  try {
    await verifyAdmin()

    const order = await db.select().from(orders).where(eq(orders.id, orderId))
    if (!order.length) return { success: false, error: 'Order not found' }

    const refundAmount = data.amount || parseFloat(order[0].totalAmount)
    const currentNotes = order[0].notes || ''
    const refundNote = `[REFUND ${new Date().toISOString().split('T')[0]}] GH₵ ${refundAmount.toFixed(2)} — Reason: ${data.reason}`

    await db.update(orders).set({
      status: 'refunded',
      paymentStatus: 'refunded',
      notes: currentNotes ? `${currentNotes}\n${refundNote}` : refundNote,
      updatedAt: new Date(),
    }).where(eq(orders.id, orderId))

    // Send refund email notification
    try {
      const shippingInfo = order[0].shippingAddress ? JSON.parse(order[0].shippingAddress) : {}
      if (shippingInfo.email && process.env.SMTP_HOST && process.env.SMTP_USER) {
        const nodemailer = await import('nodemailer')
        const transporter = nodemailer.default.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: parseInt(process.env.SMTP_PORT || '587') === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        })

        await transporter.sendMail({
          from: process.env.SMTP_FROM || `GotiNova <${process.env.SMTP_USER}>`,
          to: shippingInfo.email,
          subject: `Refund Processed — ${order[0].orderNumber}`,
          html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;">
            <h2>Refund Processed</h2>
            <p>Hi ${shippingInfo.name || 'Customer'},</p>
            <p>A refund of <strong>GH₵ ${refundAmount.toFixed(2)}</strong> has been processed for your order <strong>${order[0].orderNumber}</strong>.</p>
            <p>Reason: ${data.reason}</p>
            <p>The refund should appear in your account within 3-5 business days.</p>
            <p>Thank you,<br>GotiNova Team</p>
          </div>`,
        }).catch(() => {})
        }
      }
    } catch {}

    revalidatePath('/admin/orders')
    return { success: true, message: `Refund of GH₵ ${refundAmount.toFixed(2)} processed successfully` }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to process refund' }
  }
}

export async function getRefundedOrders(limit = 50) {
  try {
    await verifyAdmin()

    const result = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        totalAmount: orders.totalAmount,
        status: orders.status,
        notes: orders.notes,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customerName: userTable.name,
        customerEmail: userTable.email,
      })
      .from(orders)
      .leftJoin(userTable, eq(orders.userId, userTable.id))
      .where(eq(orders.status, 'refunded'))
      .orderBy(desc(orders.updatedAt))
      .limit(limit)

    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch refunds' }
  }
}


export async function scheduleProduct(productId: string, publishDate: string) {
  try {
    await verifyAdmin()

    // Store the scheduled date in the product's description metadata
    // We use the 'images' field (JSON) to store schedule info since we don't have a dedicated column
    const product = await db.select().from(products).where(eq(products.id, productId))
    if (!product.length) return { success: false, error: 'Product not found' }

    // Deactivate product until publish date
    await db.update(products).set({
      isActive: false,
      // Store schedule info in images JSON field (won't conflict with actual images)
      images: JSON.stringify({
        ...(product[0].images ? (() => { try { return JSON.parse(product[0].images!) } catch { return {} } })() : {}),
        _scheduledPublish: publishDate,
      }),
      updatedAt: new Date(),
    }).where(eq(products.id, productId))

    revalidatePath('/admin/products')
    return { success: true, message: `Product scheduled to publish on ${new Date(publishDate).toLocaleDateString()}` }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to schedule product' }
  }
}

export async function publishScheduledProducts() {
  try {
    // This should be called periodically (via cron or on page load)
    const allProducts = await db.select().from(products).where(eq(products.isActive, false))

    let published = 0
    const now = new Date()

    for (const product of allProducts) {
      if (!product.images) continue
      try {
        const data = JSON.parse(product.images)
        if (data._scheduledPublish && new Date(data._scheduledPublish) <= now) {
          // Time to publish!
          const cleanImages = { ...data }
          delete cleanImages._scheduledPublish

          await db.update(products).set({
            isActive: true,
            images: Object.keys(cleanImages).length > 0 ? JSON.stringify(cleanImages) : null,
            updatedAt: new Date(),
          }).where(eq(products.id, product.id))
          published++
        }
      } catch {}
    }

    return { success: true, published }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to check scheduled products' }
  }
}

export async function getScheduledProducts() {
  try {
    await verifyAdmin()

    const allInactive = await db.select().from(products).where(eq(products.isActive, false))

    const scheduled = allInactive.filter(p => {
      if (!p.images) return false
      try {
        const data = JSON.parse(p.images)
        return !!data._scheduledPublish
      } catch { return false }
    }).map(p => {
      const data = JSON.parse(p.images!)
      return { ...p, scheduledDate: data._scheduledPublish }
    })

    return { success: true, data: scheduled }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch scheduled products' }
  }
}
