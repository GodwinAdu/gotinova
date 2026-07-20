'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Flame, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CountdownTimer } from './countdown-timer'
import { formatPrice } from '@/lib/utils/format'
import { useCartStore } from '@/lib/store'

interface FlashSaleProduct {
  id: string
  name: string
  price: string | number
  originalPrice: string | number
  image: string | null
  stock: number
}

interface FlashSaleProps {
  products: FlashSaleProduct[]
  endDate: string | Date
  title?: string
}

/**
 * Flash Sale Section — shows products with a countdown timer.
 * Place on homepage or create a dedicated /sale page.
 */
export function FlashSale({ products, endDate, title = 'Flash Sale' }: FlashSaleProps) {
  const [expired, setExpired] = useState(false)
  const [mounted, setMounted] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted || expired || products.length === 0) return null

  return (
    <section className="py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
              <p className="text-xs text-muted-foreground">Limited time offers — don&apos;t miss out!</p>
            </div>
          </div>
          <CountdownTimer endDate={endDate} onExpired={() => setExpired(true)} />
        </div>

        {/* Products horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-hide">
          {products.map((product) => {
            const numPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price
            const numOriginal = typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice) : product.originalPrice
            const discount = Math.round((1 - numPrice / numOriginal) * 100)

            return (
              <div
                key={product.id}
                className="flex-shrink-0 w-[200px] sm:w-[220px] snap-start bg-card border border-destructive/20 rounded-2xl overflow-hidden group"
              >
                <Link href={`/products/${product.id}`} className="block relative">
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="220px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                    )}
                    {/* Discount badge */}
                    <div className="absolute top-2 left-2 bg-destructive text-white px-2 py-0.5 rounded-full text-[11px] font-bold shadow-sm">
                      -{discount}%
                    </div>
                    {/* Stock urgency */}
                    {product.stock <= 5 && product.stock > 0 && (
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-0.5 rounded-full text-[10px] font-medium">
                        Only {product.stock} left!
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-3 space-y-2">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-destructive">{formatPrice(numPrice)}</span>
                    <span className="text-[11px] text-muted-foreground line-through">{formatPrice(numOriginal)}</span>
                  </div>
                  <Button
                    onClick={() => addItem({
                      productId: product.id,
                      name: product.name,
                      price: numPrice,
                      image: product.image || '/placeholder.jpg',
                      quantity: 1,
                    })}
                    size="sm"
                    variant="destructive"
                    className="w-full h-8 text-xs rounded-xl gap-1"
                  >
                    <Flame className="w-3 h-3" />
                    Grab Deal
                  </Button>
                </div>
              </div>
            )
          })}

          {/* View all card */}
          <Link
            href="/products"
            className="flex-shrink-0 w-[200px] sm:w-[220px] snap-start bg-destructive/5 border border-destructive/20 rounded-2xl flex flex-col items-center justify-center gap-3 p-6 hover:bg-destructive/10 transition-colors"
          >
            <ArrowRight className="w-6 h-6 text-destructive" />
            <span className="text-sm font-medium text-destructive">View All Deals</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
