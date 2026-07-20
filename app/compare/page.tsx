'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart2, ArrowLeft, ShoppingCart, X, Star } from 'lucide-react'
import { getCompareList, removeFromCompare, clearCompare, type CompareProduct } from '@/lib/utils/compare'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils/format'
import Image from 'next/image'
import Link from 'next/link'

export default function ComparePage() {
  const [items, setItems] = useState<CompareProduct[]>([])
  const [mounted, setMounted] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    setMounted(true)
    setItems(getCompareList())
    const handler = () => setItems(getCompareList())
    window.addEventListener('compare-change', handler)
    return () => window.removeEventListener('compare-change', handler)
  }, [])

  if (!mounted) return null

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link href="/products">
                <Button variant="ghost" size="sm" className="rounded-xl">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Shop
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" />
                <h1 className="text-2xl font-bold">Compare Products</h1>
              </div>
            </div>
            {items.length > 0 && (
              <Button onClick={clearCompare} variant="outline" size="sm" className="rounded-xl text-xs">
                Clear All
              </Button>
            )}
          </div>

          {items.length < 2 ? (
            <div className="text-center py-16">
              <BarChart2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Add products to compare</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Select at least 2 products from the shop to compare them side by side.
              </p>
              <Button asChild className="rounded-xl">
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr>
                    <th className="text-left p-3 w-32 text-sm font-semibold text-muted-foreground">Feature</th>
                    {items.map((item) => (
                      <th key={item.id} className="p-3 text-center min-w-[200px]">
                        <div className="relative">
                          <button
                            onClick={() => removeFromCompare(item.id)}
                            className="absolute -top-1 -right-1 p-1 bg-muted hover:bg-destructive hover:text-white rounded-full transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Image */}
                  <tr className="border-t border-border">
                    <td className="p-3 text-sm font-medium text-muted-foreground">Image</td>
                    {items.map((item) => (
                      <td key={item.id} className="p-3 text-center">
                        <Link href={`/products/${item.id}`}>
                          <div className="w-32 h-32 mx-auto rounded-xl bg-muted overflow-hidden border border-border">
                            {item.image ? (
                              <Image src={item.image} alt={item.name} width={128} height={128} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                            )}
                          </div>
                        </Link>
                      </td>
                    ))}
                  </tr>

                  {/* Name */}
                  <tr className="border-t border-border">
                    <td className="p-3 text-sm font-medium text-muted-foreground">Name</td>
                    {items.map((item) => (
                      <td key={item.id} className="p-3 text-center">
                        <Link href={`/products/${item.id}`} className="text-sm font-medium hover:text-primary transition-colors">
                          {item.name}
                        </Link>
                      </td>
                    ))}
                  </tr>

                  {/* Price */}
                  <tr className="border-t border-border">
                    <td className="p-3 text-sm font-medium text-muted-foreground">Price</td>
                    {items.map((item) => {
                      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price
                      const original = item.originalPrice ? (typeof item.originalPrice === 'string' ? parseFloat(item.originalPrice) : item.originalPrice) : null
                      return (
                        <td key={item.id} className="p-3 text-center">
                          <span className="text-lg font-bold text-primary">{formatPrice(price)}</span>
                          {original && original > price && (
                            <span className="block text-xs text-muted-foreground line-through">{formatPrice(original)}</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>

                  {/* Rating */}
                  <tr className="border-t border-border">
                    <td className="p-3 text-sm font-medium text-muted-foreground">Rating</td>
                    {items.map((item) => {
                      const rating = Number(item.rating || 0)
                      return (
                        <td key={item.id} className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">{rating.toFixed(1)}/5</span>
                        </td>
                      )
                    })}
                  </tr>

                  {/* Description */}
                  <tr className="border-t border-border">
                    <td className="p-3 text-sm font-medium text-muted-foreground">Description</td>
                    {items.map((item) => (
                      <td key={item.id} className="p-3 text-center">
                        <p className="text-xs text-muted-foreground line-clamp-3">{item.description || 'No description'}</p>
                      </td>
                    ))}
                  </tr>

                  {/* Savings */}
                  <tr className="border-t border-border">
                    <td className="p-3 text-sm font-medium text-muted-foreground">Savings</td>
                    {items.map((item) => {
                      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price
                      const original = item.originalPrice ? (typeof item.originalPrice === 'string' ? parseFloat(item.originalPrice) : item.originalPrice) : null
                      const savings = original ? original - price : 0
                      const percent = original ? Math.round((savings / original) * 100) : 0
                      return (
                        <td key={item.id} className="p-3 text-center">
                          {savings > 0 ? (
                            <Badge variant="success">{formatPrice(savings)} ({percent}% off)</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>

                  {/* Add to Cart */}
                  <tr className="border-t border-border">
                    <td className="p-3 text-sm font-medium text-muted-foreground">Action</td>
                    {items.map((item) => {
                      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price
                      return (
                        <td key={item.id} className="p-3 text-center">
                          <Button
                            onClick={() => addItem({
                              productId: item.id,
                              name: item.name,
                              price,
                              image: item.image || '/placeholder.jpg',
                              quantity: 1,
                            })}
                            size="sm"
                            className="rounded-xl gap-1"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Add to Cart
                          </Button>
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
