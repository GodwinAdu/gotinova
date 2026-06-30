'use server'

import { db } from '@/lib/db'
import { products, categories, productAttributes } from '@/lib/db/schema'
import { eq, like, and, gte, lte } from 'drizzle-orm'

export async function getCategories() {
  try {
    const result = await db.select().from(categories)
    return { success: true, data: result }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { success: false, error: 'Failed to fetch categories' }
  }
}

export async function getProducts(filters?: {
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  limit?: number
  offset?: number
}) {
  try {
    let query = db.select().from(products).where(eq(products.isActive, true))

    const conditions = [eq(products.isActive, true)]

    if (filters?.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId))
    }

    if (filters?.search) {
      conditions.push(like(products.name, `%${filters.search}%`))
    }

    if (filters?.minPrice) {
      conditions.push(gte(products.price, filters.minPrice.toString()))
    }

    if (filters?.maxPrice) {
      conditions.push(lte(products.price, filters.maxPrice.toString()))
    }

    query = db.select().from(products).where(and(...conditions))

    const result = await query
      .limit(filters?.limit || 20)
      .offset(filters?.offset || 0)

    return { success: true, data: result }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { success: false, error: 'Failed to fetch products' }
  }
}

export async function getProductById(id: string) {
  try {
    const result = await db.select().from(products).where(eq(products.id, id))
    if (result.length === 0) {
      return { success: false, error: 'Product not found' }
    }

    const attrs = await db
      .select()
      .from(productAttributes)
      .where(eq(productAttributes.productId, id))

    return { success: true, data: { ...result[0], attributes: attrs } }
  } catch (error) {
    console.error('Error fetching product:', error)
    return { success: false, error: 'Failed to fetch product' }
  }
}
