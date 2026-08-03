'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { reviews, products, user as userTable } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { v4 as uuid } from 'uuid'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function createReview(productId: string, data: {
  rating: number
  title: string
  comment: string
  images?: string[]
}) {
  try {
    const userId = await getUserId()

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5' }
    }

    // Check if product exists
    const product = await db.select().from(products).where(eq(products.id, productId))
    if (!product.length) {
      return { success: false, error: 'Product not found' }
    }

    // Check if user already reviewed this product
    const existingReview = await db.select().from(reviews).where(
      and(eq(reviews.userId, userId), eq(reviews.productId, productId))
    )
    if (existingReview.length > 0) {
      return { success: false, error: 'You have already reviewed this product' }
    }

    // Create review — default to approved unless explicitly configured otherwise
    let status = 'approved'
    try {
      const { getReviewConfig } = await import('@/app/actions/settings')
      const reviewConfig = await getReviewConfig()
      if (reviewConfig.autoApprove === false) {
        status = 'pending'
      }
    } catch {}

    const reviewId = uuid()
    await db.insert(reviews).values({
      id: reviewId,
      userId,
      productId,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      images: data.images && data.images.length > 0 ? JSON.stringify(data.images) : null,
      status,
    })

    // Update product rating
    try {
      const allReviews = await db.select({ rating: reviews.rating }).from(reviews).where(
        and(eq(reviews.productId, productId), eq(reviews.status, 'approved'))
      )
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      await db.update(products).set({
        rating: avgRating.toFixed(2),
        reviewCount: allReviews.length,
      }).where(eq(products.id, productId))
    } catch {}

    revalidatePath(`/products/${productId}`)
    return { success: true, message: 'Review submitted successfully! Thank you for your feedback.' }
  } catch (error: any) {
    console.error('Error creating review:', error?.message || error)
    return { success: false, error: error?.message || 'Failed to create review' }
  }
}

export async function getProductReviews(productId: string, limit = 20) {
  try {
    const result = await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        rating: reviews.rating,
        title: reviews.title,
        comment: reviews.comment,
        images: reviews.images,
        verified: reviews.verified,
        helpful: reviews.helpful,
        createdAt: reviews.createdAt,
        userName: userTable.name,
      })
      .from(reviews)
      .leftJoin(userTable, eq(reviews.userId, userTable.id))
      .where(
        and(
          eq(reviews.productId, productId),
          eq(reviews.status, 'approved')
        )
      )
      .limit(limit)

    return { success: true, data: result }
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return { success: false, error: 'Failed to fetch reviews' }
  }
}

export async function getUserReviews(userId?: string) {
  try {
    const currentUserId = await getUserId()
    const targetUserId = userId || currentUserId

    const result = await db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, targetUserId))

    return { success: true, data: result }
  } catch (error) {
    console.error('Error fetching user reviews:', error)
    return { success: false, error: 'Failed to fetch reviews' }
  }
}

export async function updateReview(reviewId: string, data: {
  rating?: number
  title?: string
  comment?: string
}) {
  try {
    const userId = await getUserId()

    // Check if review exists and belongs to user
    const review = await db.select().from(reviews).where(eq(reviews.id, reviewId))
    if (!review.length || review[0].userId !== userId) {
      return { success: false, error: 'Review not found' }
    }

    // Update review
    await db
      .update(reviews)
      .set({
        rating: data.rating,
        title: data.title,
        comment: data.comment,
      })
      .where(eq(reviews.id, reviewId))

    revalidatePath(`/products/${review[0].productId}`)
    return { success: true, message: 'Review updated successfully' }
  } catch (error) {
    console.error('Error updating review:', error)
    return { success: false, error: 'Failed to update review' }
  }
}

export async function deleteReview(reviewId: string) {
  try {
    const userId = await getUserId()

    // Check if review exists and belongs to user
    const review = await db.select().from(reviews).where(eq(reviews.id, reviewId))
    if (!review.length || review[0].userId !== userId) {
      return { success: false, error: 'Review not found' }
    }

    // Delete review
    await db.delete(reviews).where(eq(reviews.id, reviewId))

    revalidatePath(`/products/${review[0].productId}`)
    return { success: true, message: 'Review deleted successfully' }
  } catch (error) {
    console.error('Error deleting review:', error)
    return { success: false, error: 'Failed to delete review' }
  }
}
