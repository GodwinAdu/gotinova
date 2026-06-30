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
    <div className="group relative bg-card rounded-lg md:rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image Container */}
      <div className="relative bg-muted overflow-hidden aspect-square">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm md:text-base">
            No image
          </div>
        )}

        {/* Discount Badge */}
        {discount && (
          <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-destructive text-destructive-foreground px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold shadow-sm">
            -{discount}%
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          disabled={isWishlisting}
          className="absolute top-2 md:top-3 left-2 md:left-3 p-2 md:p-2.5 bg-white/95 hover:bg-white rounded-full transition-colors shadow-sm opacity-0 group-hover:opacity-100 md:opacity-100 duration-200"
          title="Add to wishlist"
        >
          <Heart className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 md:p-4 flex flex-col">
        {/* Product Name */}
        <Link href={`/products/${id}`} className="hover:text-primary transition-colors group/name">
          <h3 className="font-semibold text-sm md:text-base line-clamp-2 group-hover/name:text-primary mb-2">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2 md:mb-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 md:w-4 md:h-4 ${
                  i < Math.round(Number(rating))
                    ? 'fill-primary text-primary'
                    : 'text-muted-foreground/50'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-1">
            {reviewCount > 0 ? `(${reviewCount})` : '(0)'}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <span className="text-base md:text-lg font-bold text-primary">
            ${numPrice.toFixed(2)}
          </span>
          {numOriginalPrice && numOriginalPrice > numPrice && (
            <span className="text-xs md:text-sm text-muted-foreground line-through">
              ${numOriginalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full h-9 md:h-10 text-xs md:text-sm gap-2 font-medium"
        >
          {isAdding ? (
            <>
              <div className="h-3 w-3 border-2 border-transparent border-t-current rounded-full animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </>
          )}
        </Button>

        {/* Success Message */}
        {message && (
          <p className={`text-xs text-center mt-2 transition-opacity ${
            message.includes('Added') ? 'text-green-600' : 'text-destructive'
          }`}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
