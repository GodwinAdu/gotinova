'use client'

import { useState, useEffect } from 'react'
import { Star, Camera, X, Loader2, CheckCircle, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { createReview, getProductReviews } from '@/app/actions/reviews'
import { useSession } from '@/lib/auth-client'
import { formatDate } from '@/lib/utils/format'

interface Review {
  id: string
  userId: string
  rating: number
  title: string | null
  comment: string | null
  images: string | null
  verified: boolean | null
  helpful: number | null
  createdAt: Date
  userName: string | null
}

interface ProductReviewsProps {
  productId: string
  productName: string
}

// Star rating input component
function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              star <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-border'
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground self-center">
        {value > 0 ? ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value] : 'Select rating'}
      </span>
    </div>
  )
}

// Review form
function ReviewForm({ productId, onSuccess }: { productId: string; onSuccess: () => void }) {
  const { data: session } = useSession()
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    if (images.length + files.length > 3) {
      setError('Maximum 3 photos allowed')
      return
    }

    // Convert to base64 data URLs (stored directly in DB)
    Array.from(files).forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        setError('Each image must be under 2MB')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        setImages((prev) => [...prev, dataUrl])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (rating === 0) {
      setError('Please select a star rating')
      return
    }
    if (!comment.trim()) {
      setError('Please write a comment')
      return
    }

    try {
      setSubmitting(true)
      const result = await createReview(productId, {
        rating,
        title: title.trim() || `${['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]} product`,
        comment: comment.trim(),
        images: images.length > 0 ? images : undefined,
      })

      if (result.success) {
        setSuccess(true)
        setRating(0)
        setTitle('')
        setComment('')
        setImages([])
        onSuccess()
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error || 'Failed to submit review')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (!session?.user) {
    return (
      <Card className="p-5 rounded-2xl text-center">
        <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-3">Sign in to write a review</p>
        <Button asChild size="sm" className="rounded-xl">
          <a href={`/sign-in?redirect=/products/${productId}`}>Sign In</a>
        </Button>
      </Card>
    )
  }

  if (success) {
    return (
      <Card className="p-5 rounded-2xl text-center">
        <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
        <p className="text-sm font-medium">Thank you for your review!</p>
        <p className="text-xs text-muted-foreground mt-1">Your feedback helps other customers.</p>
      </Card>
    )
  }

  return (
    <Card className="p-5 rounded-2xl">
      <h3 className="font-semibold text-base mb-4">Write a Review</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Your Rating *</label>
          <StarRatingInput value={rating} onChange={setRating} />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Review Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum up your experience (optional)"
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Your Review *</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like or dislike? How was the quality?"
            className="w-full px-3.5 py-2.5 border border-input rounded-xl bg-background text-sm placeholder-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all min-h-[100px] resize-y"
            required
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Add Photos (optional)</label>
          <div className="flex items-center gap-2 flex-wrap">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border group">
                <Image src={img} alt="" fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            {images.length < 3 && (
              <label className="w-16 h-16 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center cursor-pointer transition-colors">
                <Camera className="w-5 h-5 text-muted-foreground" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">Up to 3 photos (JPEG, PNG)</p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-destructive font-medium bg-destructive/10 px-3 py-2 rounded-xl">
            {error}
          </p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </Button>
      </form>
    </Card>
  )
}

// Single review display
function ReviewCard({ review }: { review: Review }) {
  const parsedImages: string[] = review.images ? (() => {
    try { return JSON.parse(review.images!) } catch { return [] }
  })() : []

  return (
    <div className="py-4 border-b border-border last:border-0">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium">{review.userName || 'Customer'}</span>
            {review.verified && (
              <Badge variant="success" className="text-[10px] px-1.5 py-0">Verified</Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex gap-px">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-border'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground">
              {formatDate(review.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {review.title && (
        <h4 className="font-medium text-sm mb-1">{review.title}</h4>
      )}

      {review.comment && (
        <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
      )}

      {/* Review photos */}
      {parsedImages.length > 0 && (
        <div className="flex gap-2 mt-3">
          {parsedImages.map((img, idx) => (
            <div key={idx} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-border">
              <Image src={img} alt="Review photo" fill className="object-cover" unoptimized />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Main component
export function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadReviews()
  }, [productId])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const result = await getProductReviews(productId)
      if (result.success && result.data) {
        setReviews(result.data as Review[])
      }
    } catch (err) {
      console.error('Error loading reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
    percentage: reviews.length > 0
      ? (reviews.filter((r) => r.rating === stars).length / reviews.length) * 100
      : 0,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold">Customer Reviews</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'outline' : 'default'}
          size="sm"
          className="rounded-xl"
        >
          {showForm ? 'Cancel' : 'Write a Review'}
        </Button>
      </div>

      {/* Rating summary */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-card border border-border/60 rounded-2xl">
          {/* Average */}
          <div className="text-center sm:text-left">
            <div className="text-4xl font-bold text-foreground">{averageRating.toFixed(1)}</div>
            <div className="flex gap-0.5 justify-center sm:justify-start mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-border'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Distribution bars */}
          <div className="space-y-1.5">
            {ratingDistribution.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-3">{stars}</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <ReviewForm productId={productId} onSuccess={() => { loadReviews(); setShowForm(false) }} />
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="divide-y divide-border">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-muted/30 rounded-2xl">
          <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground mb-1">No reviews yet</p>
          <p className="text-sm text-muted-foreground">Be the first to review this product!</p>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} size="sm" className="rounded-xl mt-3">
              Write a Review
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
