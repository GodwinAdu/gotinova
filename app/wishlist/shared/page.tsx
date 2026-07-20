'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/header'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Heart, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getProductById } from '@/app/actions/products'
import { ProductGridSkeleton } from '@/components/skeletons'

function SharedWishlistContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const itemsParam = searchParams.get('items')
    if (!itemsParam) {
      setLoading(false)
      return
    }

    const ids = itemsParam.split(',').filter(Boolean)
    const loaded: any[] = []

    for (const id of ids.slice(0, 20)) {
      try {
        const product = await getProductById(id)
        if (product) loaded.push(product)
      } catch {
        // Skip products that don't exist
      }
    }

    setProducts(loaded)
    setLoading(false)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Shared Wishlist</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Someone shared their favourite picks with you! 💕
            </p>
          </div>

          {/* Products */}
          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={product.image}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  description={product.description}
                  stock={product.stock}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">This wishlist is empty or the link has expired.</p>
              <Button asChild className="rounded-xl">
                <Link href="/products">
                  Browse Our Collection
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}

          {/* CTA */}
          {products.length > 0 && (
            <div className="text-center mt-10 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">Want to create your own wishlist?</p>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/sign-up">Create an Account</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

export default function SharedWishlistPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <ProductGridSkeleton count={4} />
        </div>
      </>
    }>
      <SharedWishlistContent />
    </Suspense>
  )
}
