'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { getWishlist } from '@/app/actions/wishlist'

interface WishlistItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    price: string
    originalPrice?: string
    image?: string
    rating: string | number
    reviewCount: number
  }
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadWishlist()
  }, [])

  const loadWishlist = async () => {
    try {
      const result = await getWishlist()
      if (result.success) {
        setItems(result.data)
      }
    } catch (error) {
      console.error('Error loading wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header user={user} />
        <main className="min-h-screen bg-background">
          <div className="container max-w-7xl mx-auto px-4 py-8">
            <p className="text-center text-muted-foreground">Loading wishlist...</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header user={user} />
      <main className="min-h-screen bg-background">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">
                Start adding your favorite items to your wishlist!
              </p>
              <Button asChild>
                <Link href="/products">Shop Now</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.product.id}
                  name={item.product.name}
                  price={item.product.price}
                  originalPrice={item.product.originalPrice}
                  image={item.product.image}
                  rating={item.product.rating}
                  reviewCount={item.product.reviewCount}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
