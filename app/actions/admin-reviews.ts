'use server'

import { db } from '@/lib/db'
import { reviews, products, user as userTable, adminUsers } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function verifyAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const admin = await db.select().from(adminUsers).where(and(eq(adminUsers.userId, session.user.id), eq(adminUsers.isActive, true)))
  if (!admin.length) throw new Error('Not authorized as admin')
}

export async function getAdminReviews(status?: string) {
  try {
    await verifyAdmin()

    const conditions = status ? and(eq(reviews.status, status)) : undefined

    const result = await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        productId: reviews.productId,
        rating: reviews.rating,
        title: reviews.title,
        comment: reviews.comment,
        images: reviews.images,
        status: reviews.status,
        verified: reviews.verified,
        helpful: reviews.helpful,
        createdAt: reviews.createdAt,
        userName: userTable.name,
        productName: products.name,
      })
      .from(reviews)
      .leftJoin(userTable, eq(reviews.userId, userTable.id))
      .leftJoin(products, eq(reviews.productId, products.id))
      .where(conditions)
      .orderBy(desc(reviews.createdAt))
      .limit(100)

    return { success: true, data: result }
  } catch (error: any) {
    console.error('Error fetching admin reviews:', error)
    return { success: false, error: error.message || 'Failed to fetch reviews' }
  }
}

export async function adminUpdateReviewStatus(reviewId: string, status: 'approved' | 'rejected') {
  try {
    await verifyAdmin()

    await db
      .update(reviews)
      .set({ status })
      .where(eq(reviews.id, reviewId))

    revalidatePath('/admin/reviews')
    return { success: true, message: `Review ${status}` }
  } catch (error: any) {
    console.error('Error updating review status:', error)
    return { success: false, error: error.message || 'Failed to update review' }
  }
}

export async function adminDeleteReview(reviewId: string) {
  try {
    await verifyAdmin()

    const review = await db.select().from(reviews).where(eq(reviews.id, reviewId))
    if (!review.length) {
      return { success: false, error: 'Review not found' }
    }

    await db.delete(reviews).where(eq(reviews.id, reviewId))

    revalidatePath('/admin/reviews')
    revalidatePath(`/products/${review[0].productId}`)
    return { success: true, message: 'Review deleted' }
  } catch (error: any) {
    console.error('Error deleting review:', error)
    return { success: false, error: error.message || 'Failed to delete review' }
  }
}
