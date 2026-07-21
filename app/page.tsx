import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { Header } from '@/components/header'
import { ProductCard } from '@/components/product-card'
import { FadeInView } from '@/components/page-transition'
import { getProducts, getCategories } from '@/app/actions/products'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Truck, Shield, Headphones, Sparkles } from 'lucide-react'
import dynamic from 'next/dynamic'

// Lazy-load below-the-fold components
const RecentlyViewed = dynamic(() => import('@/components/recently-viewed').then(m => ({ default: m.RecentlyViewed })))
const FlashSale = dynamic(() => import('@/components/flash-sale').then(m => ({ default: m.FlashSale })))
const InstagramFeed = dynamic(() => import('@/components/instagram-feed').then(m => ({ default: m.InstagramFeed })))
const Testimonials = dynamic(() => import('@/components/testimonials').then(m => ({ default: m.Testimonials })))

export const metadata = {
  title: 'GotiNova - Premium Hair & Beauty Store',
  description: 'Discover premium quality hair and wigs for every style and need.',
}

export default async function HomePage() {
  // Parallel data fetching for faster page load
  const [session, productsResult, categoriesResult] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getProducts({ limit: 10 }),
    getCategories(),
  ])

  const products = productsResult.success ? productsResult.data || [] : []
  const categories = categoriesResult.success ? categoriesResult.data || [] : []

  return (
    <>
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

              {/* Hero Image */}
              <div className="order-1 lg:order-2 relative">
                <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] max-w-md mx-auto lg:max-w-none rounded-3xl overflow-hidden shadow-2xl shadow-primary/10">
                  <Image
                    src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80&auto=format&fit=crop"
                    alt="Beautiful woman with premium hair styling - GotiNova"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 500px"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                  {/* Floating badge */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                    <div className="bg-white/90 dark:bg-card/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-foreground">New Arrivals Weekly</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Fresh styles just dropped</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

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

        {/* Categories */}
        {categories.length > 0 && (
          <section className="py-8 sm:py-12 lg:py-16">
            <FadeInView>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-5 sm:mb-7">
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold">Shop by Category</h2>
                <Link href="/products" className="text-xs sm:text-sm text-primary font-medium hover:underline">
                  View all
                </Link>
              </div>

              {/* Horizontal scroll on mobile, grid on desktop */}
              <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:overflow-visible">
                {/* "All" category */}
                <Link
                  href="/products"
                  className="snap-start flex-shrink-0 w-[130px] sm:w-auto group relative bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 sm:p-5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-2.5">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm text-primary">All Products</h3>
                  <p className="text-[10px] sm:text-xs text-primary/70 mt-0.5">Browse everything</p>
                </Link>

                {categories.map((category, i) => {
                  // Rotating colors for category cards
                  const colors = [
                    'from-rose-50 to-rose-100/50 border-rose-200/60 dark:from-rose-900/10 dark:to-rose-900/5 dark:border-rose-800/30',
                    'from-blue-50 to-blue-100/50 border-blue-200/60 dark:from-blue-900/10 dark:to-blue-900/5 dark:border-blue-800/30',
                    'from-amber-50 to-amber-100/50 border-amber-200/60 dark:from-amber-900/10 dark:to-amber-900/5 dark:border-amber-800/30',
                    'from-emerald-50 to-emerald-100/50 border-emerald-200/60 dark:from-emerald-900/10 dark:to-emerald-900/5 dark:border-emerald-800/30',
                    'from-purple-50 to-purple-100/50 border-purple-200/60 dark:from-purple-900/10 dark:to-purple-900/5 dark:border-purple-800/30',
                    'from-cyan-50 to-cyan-100/50 border-cyan-200/60 dark:from-cyan-900/10 dark:to-cyan-900/5 dark:border-cyan-800/30',
                  ]
                  const color = colors[i % colors.length]

                  return (
                    <Link
                      key={category.id}
                      href={`/products?category=${category.id}`}
                      className={`snap-start flex-shrink-0 w-[130px] sm:w-auto group relative bg-gradient-to-br ${color} border rounded-2xl p-4 sm:p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}
                    >
                      <h3 className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">{category.description}</p>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-2" />
                    </Link>
                  )
                })}
              </div>
            </div>
            </FadeInView>
          </section>
        )}

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
                  Ready to Transform Your Look?
                </h2>
                <p className="text-sm sm:text-base text-primary-foreground/80 mb-6 max-w-md mx-auto">
                  Join thousands of happy customers who trust GotiNova for their premium hair needs.
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
