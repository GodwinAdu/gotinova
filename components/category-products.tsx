'use client'

import { useState } from 'react'
import { ProductCard } from '@/components/product-card'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
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

export function CategoryProducts({ categories, products }: CategoryProductsProps) {
  const [activeTab, setActiveTab] = useState<string>('all')

  const filteredProducts = activeTab === 'all'
    ? products
    : products.filter(p => p.categoryId === activeTab)

  const displayProducts = filteredProducts.slice(0, 12)

  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold">Shop by Category</h2>
          <Link href="/products" className="text-xs sm:text-sm text-primary font-medium hover:underline flex items-center gap-1">
            View All Products
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Link>
        </div>

        {/* Category Tabs — scrollable on mobile */}
        <div className="relative mb-6 sm:mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x snap-mandatory">
            {/* "All" tab */}
            <button
              onClick={() => setActiveTab('all')}
              className={`snap-start flex-shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              All Products
            </button>

            {/* Category tabs */}
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`snap-start flex-shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === category.id
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {displayProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
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

            {/* View more button */}
            {filteredProducts.length > 12 && (
              <div className="text-center mt-6 sm:mt-8">
                <Button asChild variant="outline" size="lg" className="rounded-xl px-8">
                  <Link href={activeTab === 'all' ? '/products' : `/products?category=${activeTab}`}>
                    View More Products
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 sm:py-16 bg-card border border-border/60 rounded-2xl">
            <p className="text-muted-foreground text-sm mb-3">No products in this category yet</p>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href="/products">Browse All Products</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
