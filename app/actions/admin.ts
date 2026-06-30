'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { products, categories, adminUsers, user as userTable, orders, analytics } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
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

    const totalOrders = await db
      .select()
      .from(orders)
      .then((result) => result.length)

    const totalProducts = await db
      .select()
      .from(products)
      .then((result) => result.length)

    const totalUsers = await db
      .select()
      .from(userTable)
      .then((result) => result.length)

    const totalRevenue = await db
      .select()
      .from(orders)
      .then((result) =>
        result.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0)
      )

    return {
      success: true,
      data: {
        totalOrders,
        totalProducts,
        totalUsers,
        totalRevenue,
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

    const result = await db.select().from(products).limit(limit)
    return { success: true, data: result }
  } catch (error: any) {
    console.error('Error fetching products:', error)
    return { success: false, error: error.message || 'Failed to fetch products' }
  }
}

export async function getAllOrders(limit = 50) {
  try {
    await verifyAdmin()

    const result = await db.select().from(orders).limit(limit)
    return { success: true, data: result }
  } catch (error: any) {
    console.error('Error fetching orders:', error)
    return { success: false, error: error.message || 'Failed to fetch orders' }
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
      .limit(limit)

    return { success: true, data: result }
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return { success: false, error: error.message || 'Failed to fetch users' }
  }
}
