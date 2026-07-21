'use client'

import { useState, useEffect } from 'react'
import { Star, Check, X, Trash2, Loader2, MessageSquare, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAdminReviews, adminUpdateReviewStatus, adminDeleteReview } from '@/app/actions/admin-reviews'

interface AdminReview {
  id: string
  userId: string
  productId: string
  rating: number
  title: string | null
  comment: string | null
  images: string | null
  status: string | null
  verified: boolean | null
  helpful: number | null
  createdAt: Date
  userName: string | null
  productName: string | null
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadReviews()
  }, [filter])

  const loadReviews = async () => {
    setLoading(true)
    const result = await getAdminReviews(filter === 'all' ? undefined : filter)
    if (result.success && result.data) {
      setReviews(result.data as AdminReview[])
    }
    setLoading(false)
  }

  const handleStatusChange = async (reviewId: string, status: 'approved' | 'rejected') => {
    setActionLoading(reviewId)
    const result = await adminUpdateReviewStatus(reviewId, status)
    if (result.success) {
      loadReviews()
    }
    setActionLoading(null)
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return
    setActionLoading(reviewId)
    const result = await adminDeleteReview(reviewId)
    if (result.success) {
      loadReviews()
    }
    setActionLoading(null)
  }

  const pendingCount = reviews.filter(r => r.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Reviews</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage customer reviews and moderation</p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="text-xs">
            {pendingCount} pending
          </Badge>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
              filter === tab
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <Card className="p-8 rounded-2xl text-center">
          <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No {filter !== 'all' ? filter : ''} reviews found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id} className="p-4 sm:p-5 rounded-2xl">
              <div className="flex items-start justify-between gap-3">
                {/* Review content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold">{review.userName || 'Anonymous'}</span>
                    <Badge
                      variant={
                        review.status === 'approved' ? 'success' :
                        review.status === 'rejected' ? 'destructive' : 'secondary'
                      }
                      className="text-[10px]"
                    >
                      {review.status || 'pending'}
                    </Badge>
                  </div>

                  {/* Product name */}
                  <p className="text-xs text-muted-foreground mb-2">
                    on <span className="font-medium text-foreground">{review.productName || 'Unknown Product'}</span>
                    {' · '}
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>

                  {/* Rating */}
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-border'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Title & Comment */}
                  {review.title && (
                    <h4 className="text-sm font-medium mb-1">{review.title}</h4>
                  )}
                  {review.comment && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{review.comment}</p>
                  )}

                  {/* Images indicator */}
                  {review.images && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      {(() => { try { return JSON.parse(review.images).length } catch { return 0 } })() } photo(s) attached
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {review.status !== 'approved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(review.id, 'approved')}
                      disabled={actionLoading === review.id}
                      className="rounded-lg h-8 px-2.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      title="Approve"
                    >
                      {actionLoading === review.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    </Button>
                  )}
                  {review.status !== 'rejected' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(review.id, 'rejected')}
                      disabled={actionLoading === review.id}
                      className="rounded-lg h-8 px-2.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      title="Reject"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(review.id)}
                    disabled={actionLoading === review.id}
                    className="rounded-lg h-8 px-2.5 text-destructive hover:bg-destructive/10"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
