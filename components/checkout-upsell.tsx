'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Plus, Sparkles, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils/format'
import { getProducts } from '@/app/actions/products'

interface UpsellProduct {
  id: string
  name: string
  price: string
  image: string | null
}

/**
 * Checkout Upsell — shows 2-3 products the customer might want to add
 * before placing their order. Shows products not already in the cart,
 * sorted by lowest price (easy impulse buys).
 */
export function CheckoutUpsell() {
  const [products, setProducts] = useState<UpsellProduct[]>([])
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)
  const items = useCartStore((s) => s.items)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    setMounted(true)
    loadUpsellProducts()
  }, [])

  const loadUpsellProducts = async () => {
    try {
      const result = await getProducts({ limit: 10 })
      if (result.success && result.data) {
        // Filter out items already in cart, sort by price (cheapest first for impulse buys)
        const cartProductIds = new Set(items.map(i => i.productId))
        const available = result.data
          .filter(p => !cartProductIds.has(p.id) && p.stock > 0)
          .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
          .slice(0, 3)

        setProducts(available.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image,
        })))
      }
    } catch {
      setProducts([])
    }
  }

  const handleAdd = (product: UpsellProduct) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.image || '/placeholder.jpg',
      quantity: 1,
    })
    setAddedIds(prev => new Set(prev).add(product.id))
  }

  if (!mounted || products.length === 0) return null

  return (
    <div className="bg-muted/30 border border-border/60 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <p className="text-sm font-semibold">Complete your look</p>
      </div>

      <div className="space-y-2">
        {products.map((product) => {
          const isAdded = addedIds.has(product.id)
          const numPrice = parseFloat(product.price)

          return (
            <div key={product.id} className="flex items-center gap-3 p-2 bg-card rounded-xl border border-border/40">
              {/* Image */}
              <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground">N/A</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium line-clamp-1">{product.name}</p>
                <p className="text-xs text-primary font-bold">
                  Add for just {formatPrice(numPrice)}
                </p>
              </div>

              {/* Add button */}
              <Button
                onClick={() => handleAdd(product)}
                disabled={isAdded}
                size="sm"
                variant={isAdded ? 'outline' : 'default'}
                className="h-7 px-2.5 rounded-lg text-[11px] gap-1 flex-shrink-0"
              >
                {isAdded ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" />
                    Add
                  </>
                )}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
