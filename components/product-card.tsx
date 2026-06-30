'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { useState } from 'react'
import { addToCart } from '@/app/actions/cart'

interface ProductCardProps {
  id: string
  name: string
  price: string | number
  originalPrice?: string | number
  image?: string
  rating: string | number
  reviewCount: number
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviewCount,
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isWishlisting, setIsWishlisting] = useState(false)
  const [message, setMessage] = useState('')

  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  const numOriginalPrice = originalPrice ? (typeof originalPrice === 'string' ? parseFloat(originalPrice) : originalPrice) : null
  const discount = numOriginalPrice ? Math.round((1 - numPrice / numOriginalPrice) * 100) : null

  const handleAddToCart = async () => {
    setIsAdding(true)
    setMessage('')
    try {
      const result = await addToCart(id, 1)
      if (result.success) {
        setMessage('Added to cart!')
        setTimeout(() => setMessage(''), 2000)
      } else {
        setMessage(result.error || 'Failed to add to cart')
      }
    } catch (error) {
      setMessage('Error adding to cart')
    } finally {
      setIsAdding(false)
    }
  }

  const handleWishlist = async () => {
    setIsWishlisting(true)
    // TODO: Implement wishlist functionality
    setIsWishlisting(false)
  }

  return (
    <div className="group relative bg-card rounded-lg border overflow-hidden hover:shadow-md transition">
      {/* Image */}
      <div className="relative bg-muted overflow-hidden h-48">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
            No image
          </div>
        )}

        {discount && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-bold">
            -{discount}%
          </div>
        )}

        <button
          onClick={handleWishlist}
          disabled={isWishlisting}
          className="absolute top-2 left-2 p-2 bg-white/90 hover:bg-white rounded-full transition"
        >
          <Heart className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link href={`/products/${id}`} className="hover:text-primary transition">
          <h3 className="font-semibold line-clamp-2 mb-2">{name}</h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(Number(rating))
                    ? 'fill-primary text-primary'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-bold">${numPrice.toFixed(2)}</span>
          {numOriginalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${numOriginalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          {isAdding ? 'Adding...' : 'Add to Cart'}
        </Button>

        {message && (
          <p className="text-xs text-center mt-2 text-muted-foreground">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
