'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, ShoppingCart, Check, Minus, Plus, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/modal'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils/format'

interface QuickViewProps {
  product: {
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
  trigger?: React.ReactNode
}

export function ProductQuickView({ product, trigger }: QuickViewProps) {
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const numPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price
  const numOriginalPrice = product.originalPrice
    ? (typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice) : product.originalPrice)
    : null
  const discount = numOriginalPrice ? Math.round((1 - numPrice / numOriginalPrice) * 100) : null
  const numRating = Number(product.rating || 0)
  const inStock = product.stock === undefined || product.stock > 0

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: numPrice,
      image: product.image || '/placeholder.jpg',
      quantity,
    })
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      setQuantity(1)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Trigger — can be custom or default eye icon */}
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger || (
          <button
            className="p-2 bg-white/90 dark:bg-card/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-all"
            title="Quick View"
          >
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <DialogDescription className="sr-only">Quick view of {product.name}</DialogDescription>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative aspect-square sm:aspect-auto sm:min-h-[400px] bg-muted">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full min-h-[300px] flex items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
            {discount && discount > 0 && (
              <Badge className="absolute top-3 left-3 bg-destructive text-white border-0">
                -{discount}% OFF
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Name */}
              <h2 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(numRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-border'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-foreground">
                  {formatPrice(numPrice)}
                </span>
                {numOriginalPrice && numOriginalPrice > numPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(numOriginalPrice)}
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {product.description}
                </p>
              )}

              {/* Stock status */}
              <div>
                {inStock ? (
                  <Badge variant="success" className="text-xs">In Stock</Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              {/* Quantity selector */}
              {inStock && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">Qty:</span>
                  <div className="flex items-center border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-muted transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 py-1.5 text-sm font-medium min-w-[2.5rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-muted transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Add to cart */}
              <Button
                onClick={handleAddToCart}
                disabled={added || !inStock}
                className="w-full h-11 rounded-xl text-sm font-medium gap-2"
                size="lg"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart — {formatPrice(numPrice * quantity)}
                  </>
                )}
              </Button>

              {/* View full details link */}
              <Link
                href={`/products/${product.id}`}
                onClick={() => setOpen(false)}
                className="block text-center text-sm text-primary hover:underline font-medium"
              >
                View Full Details →
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
