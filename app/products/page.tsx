'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/header'
import { ProductCard } from '@/components/product-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { getProducts, getCategories } from '@/app/actions/products'
import { HAIR_TYPES, HAIR_LENGTHS, HAIR_COLORS, FILTER_OPTIONS } from '@/lib/constants'

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
}

interface Category {
  id: string
  name: string
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-48" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-muted rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </>
    }>
      <ProductsContent />
    </Suspense>
  )
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  // Count active filters
  const activeFilterCount = [selectedCategory, minPrice, maxPrice].filter(Boolean).length

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    loadData()
  }, [selectedCategory, debouncedSearch])

  const loadData = useCallback(async () => {
    // Only show loading skeleton on initial load, not on filter changes
    if (products.length === 0) setLoading(true)
    try {
      const [productsResult, categoriesResult] = await Promise.all([
        getProducts({
          categoryId: selectedCategory || undefined,
          search: debouncedSearch || undefined,
          minPrice: minPrice ? parseInt(minPrice) : undefined,
          maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
          limit: 50,
        }),
        getCategories(),
      ])

      if (productsResult.success && productsResult.data) {
        setProducts(productsResult.data as Product[])
      }
      if (categoriesResult.success && categoriesResult.data) {
        setCategories(categoriesResult.data as Category[])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, debouncedSearch, minPrice, maxPrice])

  // Sort products client-side
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return parseFloat(a.price) - parseFloat(b.price)
      case 'price_desc':
        return parseFloat(b.price) - parseFloat(a.price)
      case 'rating':
        return Number(b.rating || 0) - Number(a.rating || 0)
      default:
        return 0 // 'newest' — already sorted by server
    }
  })

  const clearFilters = () => {
    setSelectedCategory('')
    setMinPrice('')
    setMaxPrice('')
    setSearchTerm('')
    setSortBy('newest')
  }

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Categories</h3>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${
              !selectedCategory
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="border-t border-border pt-5">
        <h3 className="font-semibold text-sm mb-3">Price Range (GH₵)</h3>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="h-9 text-sm"
            />
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          {/* Quick price ranges */}
          <div className="flex flex-wrap gap-1.5">
            {FILTER_OPTIONS.priceRanges.slice(0, 4).map((range) => (
              <button
                key={range.label}
                onClick={() => {
                  setMinPrice(range.min.toString())
                  setMaxPrice(range.max === Infinity ? '' : range.max.toString())
                }}
                className="px-2.5 py-1 text-[11px] bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                {range.label}
              </button>
            ))}
          </div>
          <Button onClick={loadData} size="sm" className="w-full rounded-xl h-9">
            Apply Price
          </Button>
        </div>
      </div>

      {/* Clear filters */}
      {activeFilterCount > 0 && (
        <div className="border-t border-border pt-5">
          <Button
            onClick={clearFilters}
            variant="outline"
            size="sm"
            className="w-full rounded-xl gap-2"
          >
            <X className="w-3.5 h-3.5" />
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Shop Collection</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {loading ? 'Loading...' : `${sortedProducts.length} products`}
              </p>
            </div>

            {/* Sort + Filter toggle (mobile) */}
            <div className="flex items-center gap-2">
              {/* Sort dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none h-9 pl-3 pr-8 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>

              {/* Mobile filter button */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden rounded-xl gap-1.5"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Active filter pills */}
          {(selectedCategory || minPrice || maxPrice) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCategory && (
                <Badge variant="secondary" className="gap-1 pr-1 rounded-lg">
                  {categories.find(c => c.id === selectedCategory)?.name || 'Category'}
                  <button onClick={() => setSelectedCategory('')} className="p-0.5 hover:bg-muted rounded">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {(minPrice || maxPrice) && (
                <Badge variant="secondary" className="gap-1 pr-1 rounded-lg">
                  GH₵ {minPrice || '0'} — {maxPrice || '∞'}
                  <button onClick={() => { setMinPrice(''); setMaxPrice('') }} className="p-0.5 hover:bg-muted rounded">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-card border border-border/60 rounded-2xl p-5 sticky top-20">
                <FilterSidebar />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 rounded-xl"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[3/4] bg-muted rounded-2xl mb-3" />
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : sortedProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {sortedProducts.map((product) => (
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
                  <p className="text-muted-foreground mb-2">No products found</p>
                  <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or search term</p>
                  <Button onClick={clearFilters} variant="outline" size="sm" className="rounded-xl">
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileFiltersOpen(false)}
            />
            {/* Drawer */}
            <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-3xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
              <div className="p-5 sm:p-6">
                {/* Drawer handle */}
                <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />

                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-2 hover:bg-muted rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <FilterSidebar />

                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={() => { loadData(); setMobileFiltersOpen(false) }}
                    className="flex-1 rounded-xl"
                  >
                    Show Results
                  </Button>
                  <Button
                    onClick={() => { clearFilters(); setMobileFiltersOpen(false) }}
                    variant="outline"
                    className="rounded-xl"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
