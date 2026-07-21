'use server'

import { db } from '@/lib/db'
import { products, categories, productAttributes } from '@/lib/db/schema'
import { eq, like, and, gte, lte } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'

// Internal cached function for categories
const getCategoriesCached = unstable_cache(
  async () => {
    const result = await db.select().from(categories)
    return result
  },
  ['categories-list'],
  { revalidate: 300 } // 5 minutes
)

export async function getCategories() {
  try {
    const result = await getCategoriesCached()
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
      throw new Error('Product not found')
    }

    const attrs = await db
      .select()
      .from(productAttributes)
      .where(eq(productAttributes.productId, id))

    // Fetch category info
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, result[0].categoryId))

    return {
      ...result[0],
      price: parseFloat(result[0].price),
      originalPrice: result[0].originalPrice ? parseFloat(result[0].originalPrice) : undefined,
      rating: parseFloat(result[0].rating || '0'),
      attributes: attrs,
      category: category[0] || { name: 'Uncategorized' },
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    throw error
  }
}

export async function getReviewsForProduct(productId: string) {
  try {
    // Mock reviews - in real app would fetch from database
    return [
      {
        id: '1',
        rating: 5,
        title: 'Excellent Quality',
        comment: 'Best hair I have purchased. Very thick and long lasting.',
        userName: 'Amina K.',
        createdAt: new Date().toISOString(),
        images: undefined,
      },
    ]
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
}

export async function getFrequentlyBoughtTogether(productId: string) {
  try {
    // Mock related products - in real app would fetch from database
    const relatedResult = await db
      .select({ relatedProductId: products.id })
      .from(products)
      .where(and(eq(products.isActive, true), 
        lte(products.id, productId)))
      .limit(4)
    
    if (relatedResult.length === 0) {
      return []
    }

    const relatedIds = relatedResult.map(r => r.relatedProductId)
    const related = await db
      .select()
      .from(products)
      .where(and(eq(products.isActive, true)))
      .limit(4)

    return related
  } catch (error) {
    console.error('Error fetching related products:', error)
    return []
  }
}

export async function getAllProducts() {
  try {
    const result = await db.select().from(products)
    return result
  } catch (error) {
    console.error('Error fetching all products:', error)
    return []
  }
}


export async function getRecommendations(productId: string, limit = 4) {
  try {
    const { orderItems } = await import('@/lib/db/schema')
    const { sql } = await import('drizzle-orm')

    // Find products that were ordered together with this product
    // Logic: find orders that contain this product, then get other products from those orders
    const result = await db.execute(sql`
      SELECT oi2."productId", oi2."productName", 
             COUNT(*) as frequency,
             p."price", p."image", p."rating", p."reviewCount"
      FROM "orderItems" oi1
      JOIN "orderItems" oi2 ON oi1."orderId" = oi2."orderId" AND oi1."productId" != oi2."productId"
      LEFT JOIN "products" p ON p."id" = oi2."productId"
      WHERE oi1."productId" = ${productId}
        AND oi2."productId" IS NOT NULL
        AND p."isActive" = true
      GROUP BY oi2."productId", oi2."productName", p."price", p."image", p."rating", p."reviewCount"
      ORDER BY frequency DESC
      LIMIT ${limit}
    `)

    // If no order-based recommendations, fall back to same-category products
    if (!result.rows || result.rows.length === 0) {
      const currentProduct = await db.select().from(products).where(eq(products.id, productId))
      if (currentProduct.length === 0) return []

      const sameCategoryProducts = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.categoryId, currentProduct[0].categoryId),
            eq(products.isActive, true)
          )
        )
        .limit(limit + 1)

      return sameCategoryProducts
        .filter(p => p.id !== productId)
        .slice(0, limit)
    }

    return result.rows.map((row: any) => ({
      id: row.productId,
      name: row.productName,
      price: row.price || '0',
      image: row.image,
      rating: row.rating || '0',
      reviewCount: row.reviewCount || 0,
    }))
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return []
  }
}
