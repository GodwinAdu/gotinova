import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { Header } from '@/components/header'
import { ProductCard } from '@/components/product-card'
import { FadeInView } from '@/components/page-transition'
import { HeroCarousel } from '@/components/hero-carousel'
import { AnnouncementBar } from '@/components/announcement-bar'
import { CategoryProducts } from '@/components/category-products'
import { getProducts, getCategories } from '@/app/actions/products'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Truck, Shield, Headphones, Sparkles } from 'lucide-react'
import dynamic from 'next/dynamic'

// Lazy-load below-the-fold components
const RecentlyViewed = dynamic(() => import('@/components/recently-viewed').then(m => ({ default: m.RecentlyViewed })))
const FlashSale = dynamic(() => import('@/components/flash-sale').then(m => ({ default: m.FlashSale })))
const InstagramFeed = dynamic(() => import('@/components/instagram-feed').then(m => ({ default: m.InstagramFeed })))
const Testimonials = dynamic(() => import('@/components/testimonials').then(m => ({ default: m.Testimonials })))

export const metadata = {
  title: 'GotiNova - Your One-Stop Online Store',
  description: 'Shop premium products across categories — hair & beauty, fashion, electronics, health, and more.',
}

export default async function HomePage() {
  // Parallel data fetching for faster page load
  const [session, productsResult, categoriesResult] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getProducts({ limit: 30 }),
    getCategories(),
  ])

  const products = productsResult.success ? productsResult.data || [] : []
  const categories = categoriesResult.success ? categoriesResult.data || [] : []

  return (
    <>
      <AnnouncementBar />
      <Header user={session?.user} />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Text content */}
              <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-full text-[11px] sm:text-sm font-medium text-primary">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Premium Quality Guaranteed
                </div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                  Shop Smart,{' '}
                  <span className="text-primary">Live Bold</span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-md">
                  Discover premium products from hair & beauty to fashion and beyond. Quality you can trust, prices you&apos;ll love.
                </p>
                <div className="flex flex-col xs:flex-row gap-3 pt-1">
                  <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary/20 h-11 sm:h-12 px-6 text-sm sm:text-base">
                    <Link href="/products">
                      Shop Collection
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-xl h-11 sm:h-12 px-6 text-sm sm:text-base">
                    <Link href="/about">Our Story</Link>
                  </Button>
                </div>

                {/* Mini stats */}
                <div className="flex items-center gap-6 pt-4">
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">500+</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">Happy Customers</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">100%</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">Authentic Products</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">24/7</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">Support</p>
                  </div>
                </div>
              </div>

              {/* Hero Image Carousel */}
              <div className="order-1 lg:order-2 relative">
                <HeroCarousel />

                {/* Decorative dots */}
                <div className="hidden lg:block absolute -bottom-4 -left-4 w-24 h-24 bg-primary/5 rounded-2xl -z-10" />
                <div className="hidden lg:block absolute -top-4 -right-4 w-16 h-16 bg-accent/10 rounded-xl -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Trust badges - mobile scrollable */}
        <section className="border-y bg-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: Truck, title: 'Fast Delivery', desc: 'Across Ghana' },
                { icon: Shield, title: '100% Authentic', desc: 'Verified quality' },
                { icon: Headphones, title: '24/7 Support', desc: 'Always here for you' },
                { icon: Sparkles, title: 'Premium Quality', desc: 'Handpicked products' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Flash Sale — show products with originalPrice as sale items */}
        {products.filter(p => p.originalPrice).length > 0 && (
          <FlashSale
            products={products
              .filter(p => p.originalPrice)
              .slice(0, 6)
              .map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                originalPrice: p.originalPrice!,
                image: p.image,
                stock: p.stock,
              }))}
            endDate={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}
            title="🔥 Today's Deals"
          />
        )}

        {/* Categories with Products — Tabbed */}
        <CategoryProducts categories={categories} products={products} />

        {/* Featured Products */}
        <section className="py-10 sm:py-14 lg:py-16 bg-muted/30">
          <FadeInView>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Featured Products</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Handpicked styles for you</p>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-primary">
                <Link href="/products">
                  View All
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
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
              <div className="text-center py-16 bg-card rounded-2xl border border-border/60">
                <Sparkles className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm">Products coming soon. Stay tuned!</p>
              </div>
            )}
          </div>
          </FadeInView>
        </section>

        {/* Recently Viewed */}
        <section className="py-8 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RecentlyViewed maxItems={6} />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16">
          <FadeInView>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 sm:p-12 lg:p-16 text-center">
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-foreground mb-3">
                  Ready to Find Something Special?
                </h2>
                <p className="text-sm sm:text-base text-primary-foreground/80 mb-6 max-w-md mx-auto">
                  Join thousands of happy customers who trust GotiNova for quality products at great prices.
                </p>
                <Button asChild size="lg" variant="secondary" className="rounded-xl shadow-lg h-11 px-6">
                  <Link href="/products">
                    Explore Collection
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
          </div>
          </FadeInView>
        </section>

        {/* Customer Testimonials */}
        <Testimonials />

        {/* Instagram Feed */}
        <InstagramFeed />
      </main>
    </>
  )
}
