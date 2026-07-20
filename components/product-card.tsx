'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Star, Check, Eye } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils/format'
import { ProductQuickView } from './product-quick-view'

interface ProductCardProps {
  id: string
  name: string
  price: string | number
  originalPrice?: string | number | null
  image?: string | null
  rating: string | number | null
  reviewCount: number | null
  description?: string | null
  stock?: number
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviewCount,
  description,
  stock,
}: ProductCardProps) {
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  const numOriginalPrice = originalPrice ? (typeof originalPrice === 'string' ? parseFloat(originalPrice) : originalPrice) : null
  const discount = numOriginalPrice ? Math.round((1 - numPrice / numOriginalPrice) * 100) : null
  const numRating = Number(rating || 0)

  const handleAddToCart = () => {
    addItem({
      productId: id,
      name,
      price: numPrice,
      image: image || '/placeholder.jpg',
      quantity: 1,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="group relative bg-card rounded-2xl border border-border/60 overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
      {/* Image */}
      <Link href={`/products/${id}`} className="block relative bg-muted/30 overflow-hidden aspect-[3/4]">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/50 text-muted-foreground text-xs">
            No image
          </div>
        )}

        {/* Discount badge */}
        {discount && discount > 0 && (
          <div className="absolute top-2.5 left-2.5 bg-destructive text-white px-2 py-0.5 rounded-full text-[11px] font-semibold shadow-sm">
            -{discount}%
          </div>
        )}

        {/* Action buttons on hover */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
          {/* Quick View */}
          <ProductQuickView
            product={{ id, name, price, originalPrice, image, rating, reviewCount, description, stock }}
            trigger={
              <button
                className="p-2 bg-white/90 dark:bg-card/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-all"
                title="Quick View"
                onClick={(e) => e.preventDefault()}
              >
                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            }
          />
          {/* Wishlist */}
          <button
            className="p-2 bg-white/90 dark:bg-card/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-all"
            title="Add to wishlist"
            onClick={(e) => e.preventDefault()}
          >
            <Heart className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-4 space-y-2">
        {/* Name */}
        <Link href={`/products/${id}`}>
          <h3 className="font-medium text-[13px] sm:text-sm leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex gap-px">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.round(numRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-border'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">
            ({reviewCount || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-sm sm:text-base font-bold text-foreground">
            {formatPrice(numPrice)}
          </span>
          {numOriginalPrice && numOriginalPrice > numPrice && (
            <span className="text-[11px] sm:text-xs text-muted-foreground line-through">
              {formatPrice(numOriginalPrice)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <Button
          onClick={handleAddToCart}
          disabled={added}
          size="sm"
          variant={added ? 'outline' : 'default'}
          className="w-full h-9 sm:h-10 text-xs sm:text-sm gap-1.5 font-medium rounded-xl mt-1.5"
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600">Added to Cart</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
