import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { Header } from '@/components/header'
import { ProductCard } from '@/components/product-card'
import { getProducts, getCategories } from '@/app/actions/products'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'LuxeHair - Premium Hair & Wig Store',
  description: 'Discover premium quality hair and wigs for every style and need.',
}

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const productsResult = await getProducts({ limit: 12 })
  const categoriesResult = await getCategories()

  const products = productsResult.success ? productsResult.data : []
  const categories = categoriesResult.success ? categoriesResult.data : []

  return (
    <>
      <Header user={session?.user} />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/15 via-background to-accent/10 py-8 md:py-16 lg:py-24">
          <div className="w-full px-4 md:px-6">
            <div className="max-w-2xl space-y-4 md:space-y-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance leading-tight">
                Premium Hair & Wig Collection
              </h1>
              <p className="text-sm md:text-base lg:text-lg text-muted-foreground text-balance leading-relaxed">
                Discover authentic, high-quality hairpieces for every style and occasion. Transform your look with LuxeHair.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/products">Shop Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        {categories.length > 0 && (
          <section className="py-8 md:py-12 border-b">
            <div className="w-full px-4 md:px-6">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 md:mb-8">Shop by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.id}`}
                    className="p-3 md:p-4 bg-card border rounded-lg hover:shadow-md transition-shadow text-center space-y-1"
                  >
                    <h3 className="font-semibold text-sm md:text-base">{category.name}</h3>
                    {category.description && (
                      <p className="text-xs md:text-sm text-muted-foreground">{category.description}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Products */}
        <section className="py-8 md:py-12">
          <div className="w-full px-4 md:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">Featured Products</h2>
              <Button variant="ghost" asChild className="w-full sm:w-auto text-right">
                <Link href="/products">View All →</Link>
              </Button>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
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
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products available yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Info Section */}
        <section className="bg-card border-t py-12">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2 text-primary">100%</div>
                <h3 className="font-semibold mb-2">Authentic</h3>
                <p className="text-sm text-muted-foreground">
                  All products are verified authentic and premium quality.
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2 text-primary">Fast</div>
                <h3 className="font-semibold mb-2">Shipping</h3>
                <p className="text-sm text-muted-foreground">
                  Quick and reliable delivery to your doorstep.
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2 text-primary">24/7</div>
                <h3 className="font-semibold mb-2">Support</h3>
                <p className="text-sm text-muted-foreground">
                  Customer support available round the clock.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
