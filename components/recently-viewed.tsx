'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getRecentlyViewed, RecentProduct } from '@/lib/utils/recently-viewed'
import { formatPrice } from '@/lib/utils/format'
import { Clock } from 'lucide-react'

interface RecentlyViewedProps {
  /** ID to exclude from the list (e.g. current product) */
  excludeId?: string
  /** Max items to show */
  maxItems?: number
}

export function RecentlyViewed({ excludeId, maxItems = 6 }: RecentlyViewedProps) {
  const [items, setItems] = useState<RecentProduct[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const products = getRecentlyViewed()
    const filtered = excludeId ? products.filter((p) => p.id !== excludeId) : products
    setItems(filtered.slice(0, maxItems))
  }, [excludeId, maxItems])

  if (!mounted || items.length === 0) return null

  return (
    <section className="py-8 sm:py-10">
      <div className="flex items-center gap-2 mb-5">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-lg sm:text-xl font-bold">Recently Viewed</h2>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {items.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group block bg-card border border-border/60 rounded-xl overflow-hidden hover:shadow-md hover:border-primary/20 transition-all duration-200"
          >
            <div className="relative aspect-square bg-muted overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 33vw, 16vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <div className="p-2 sm:p-2.5">
              <p className="text-[11px] sm:text-xs font-medium line-clamp-1 text-foreground group-hover:text-primary transition-colors">
                {product.name}
              </p>
              <p className="text-[11px] sm:text-xs font-bold text-primary mt-0.5">
                {formatPrice(product.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
