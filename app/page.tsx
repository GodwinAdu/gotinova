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
        <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-12 md:py-20">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
                Premium Hair & Wig Collection
              </h1>
              <p className="text-lg text-muted-foreground mb-8 text-balance">
                Discover authentic, high-quality hairpieces for every style and occasion. Transform your look with LuxeHair.
              </p>
              <div className="flex gap-4">
                <Button asChild size="lg">
                  <Link href="/products">Shop Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        {categories.length > 0 && (
          <section className="py-12 border-b">
            <div className="container max-w-7xl mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-8">Shop by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.id}`}
                    className="p-4 bg-card border rounded-lg hover:shadow-md transition text-center"
                  >
                    <h3 className="font-semibold">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Products */}
        <section className="py-12">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
              <Button variant="ghost" asChild>
                <Link href="/products">View All →</Link>
              </Button>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
