'use client'

import { useState, useMemo, useCallback } from 'react'
import { ProductCard } from '@/components/product-card'
import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Product {
  id: string
  name: string
  price: string
  originalPrice?: string | null
  image?: string | null
  rating: string | number | null
  reviewCount: number | null
  description?: string | null
  stock?: number
  categoryId: string
}

interface Category {
  id: string
  name: string
}

interface CategoryProductsProps {
  categories: Category[]
  products: Product[]
}

const PAGE_SIZE = 12

export function CategoryProducts({ categories, products }: CategoryProductsProps) {
  const [activeTab, setActiveTab] = useState<string>('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [showAllTabs, setShowAllTabs] = useState(false)

  // Only show first 15 tabs unless expanded
  const visibleCategories = showAllTabs ? categories : categories.slice(0, 15)
  const hasMoreTabs = categories.length > 15

  // Memoize filtered products to handle 1000s efficiently
  const filteredProducts = useMemo(() => {
    if (activeTab === 'all') return products
    return products.filter(p => p.categoryId === activeTab)
  }, [activeTab, products])

  const displayProducts = filteredProducts.slice(0, visibleCount)
  const hasMore = filteredProducts.length > visibleCount

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId)
    setVisibleCount(PAGE_SIZE) // Reset pagination on tab change
  }, [])

  const loadMore = useCallback(() => {
    setVisibleCount(prev => prev + PAGE_SIZE)
  }, [])

  return (
    <section className="py-6 sm:py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="text-base sm:text-xl lg:text-2xl font-bold">Shop by Category</h2>
          <Link href="/products" className="text-[11px] sm:text-xs text-primary font-medium hover:underline flex items-center gap-1">
            All Products
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Category Tabs — compact, scrollable */}
        <div className="relative mb-4 sm:mb-6">
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {/* "All" tab */}
            <button
              onClick={() => handleTabChange('all')}
              className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              All ({products.length})
            </button>

            {/* Category tabs */}
            {visibleCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleTabChange(category.id)}
                className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === category.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {category.name}
              </button>
            ))}

            {/* "More" button for 100s of categories */}
            {hasMoreTabs && !showAllTabs && (
              <button
                onClick={() => setShowAllTabs(true)}
                className="flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-all whitespace-nowrap flex items-center gap-1"
              >
                +{categories.length - 15} more
                <ChevronDown className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <p className="text-[11px] sm:text-xs text-muted-foreground mb-3 sm:mb-4">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          {activeTab !== 'all' && ` in ${categories.find(c => c.id === activeTab)?.name || ''}`}
        </p>

        {/* Product Grid — compact */}
        {displayProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
              {displayProducts.map((product) => (
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

            {/* Load More / View All */}
            {hasMore && (
              <div className="flex items-center justify-center gap-3 mt-5 sm:mt-6">
                <Button
                  onClick={loadMore}
                  variant="outline"
                  size="sm"
                  className="rounded-xl px-6 text-xs sm:text-sm"
                >
                  Load More ({filteredProducts.length - visibleCount} remaining)
                </Button>
                <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs sm:text-sm text-primary">
                  <Link href={activeTab === 'all' ? '/products' : `/products?category=${activeTab}`}>
                    View All
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 bg-muted/30 rounded-2xl">
            <p className="text-sm text-muted-foreground">No products found</p>
          </div>
        )}
      </div>
    </section>
  )
}
