'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils/format'
import { getRecommendations } from '@/app/actions/products'

interface RecommendedProduct {
  id: string
  name: string
  price: string | number
  image: string | null
  rating: string | number | null
  reviewCount: number | null
}

interface ProductRecommendationsProps {
  productId: string
  title?: string
}

export function ProductRecommendations({ productId, title = 'Customers Also Bought' }: ProductRecommendationsProps) {
  const [products, setProducts] = useState<RecommendedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    loadRecommendations()
  }, [productId])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      const result = await getRecommendations(productId, 4)
      setProducts(result as RecommendedProduct[])
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  if (loading || products.length === 0) return null

  return (
    <section className="border-t border-border pt-10">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {products.map((product) => {
          const numPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price

          return (
            <div key={product.id} className="bg-card border border-border/60 rounded-2xl overflow-hidden group hover:shadow-lg hover:border-primary/20 transition-all">
              <Link href={`/products/${product.id}`} className="block">
                <div className="relative aspect-square bg-muted overflow-hidden">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                  )}
                </div>
              </Link>
              <div className="p-3 space-y-2">
                <Link href={`/products/${product.id}`}>
                  <h3 className="text-xs sm:text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm font-bold text-primary">{formatPrice(numPrice)}</p>
                <Button
                  onClick={() => addItem({
                    productId: product.id,
                    name: product.name,
                    price: numPrice,
                    image: product.image || '/placeholder.jpg',
                    quantity: 1,
                  })}
                  size="sm"
                  variant="outline"
                  className="w-full h-7 text-[11px] rounded-lg gap-1"
                >
                  <ShoppingCart className="w-3 h-3" />
                  Add to Cart
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
