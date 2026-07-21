'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Heart, Star, ShoppingCart, Share2, Loader2, AlertCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { getProductById, getReviewsForProduct, getFrequentlyBoughtTogether } from '@/app/actions/products'
import { toggleWishlist, isInWishlist } from '@/app/actions/wishlist'
import { useSession } from '@/lib/auth-client'
import { addToRecentlyViewed } from '@/lib/utils/recently-viewed'
import { RecentlyViewed } from '@/components/recently-viewed'
import { ProductReviews } from '@/components/product-reviews'
import { ProductRecommendations } from '@/components/product-recommendations'
import { ImageZoom } from '@/components/image-zoom'
import { SizeGuideButton } from '@/components/size-guide'
import { NotifyBackInStock } from '@/components/notify-back-in-stock'
import { BundleDealsInfo } from '@/components/bundle-deal'
import { TrustBadges } from '@/components/trust-badges'
import { ProductStructuredData } from '@/components/product-structured-data'
import Link from 'next/link'

interface ProductDetails {
  id: string
  name: string
  description: string | null
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number | null
  stock: number
  image: string | null
  images?: string | null
  category: { name: string }
  attributes?: Array<{ name: string; value: string }>
}

interface Review {
  id: string
  rating: number
  title?: string
  comment: string
  userName: string
  createdAt: string
  images?: string
}

export default function ProductDetail() {
  const params = useParams()
  const productId = params.id as string
  const { data: session } = useSession()
  
  const [product, setProduct] = useState<ProductDetails | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)
  const [togglingWishlist, setTogglingWishlist] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [productData, reviewsData, relatedData] = await Promise.all([
          getProductById(productId),
          getReviewsForProduct(productId),
          getFrequentlyBoughtTogether(productId),
        ])
        
        setProduct(productData)
        setReviews(reviewsData)
        setRelatedProducts(relatedData)

        // Track in recently viewed
        addToRecentlyViewed({
          id: productData.id,
          name: productData.name,
          price: productData.price,
          image: productData.image,
        })
        
        if (session?.user) {
          const isWishlisted = await isInWishlist(productId)
          setInWishlist(isWishlisted)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product')
        console.error('[v0] Product load error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [productId, session?.user])

  const handleAddToCart = async () => {
    if (!product) return

    // Use local cart store — no login required
    const { useCartStore } = await import('@/lib/store')
    useCartStore.getState().addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '/placeholder.jpg',
      quantity,
    })
    setAddingToCart(true)
    setTimeout(() => {
      setAddingToCart(false)
      setQuantity(1)
    }, 1500)
  }

  const handleToggleWishlist = async () => {
    if (!session?.user) {
      window.location.href = '/sign-in?redirect=/products/' + productId
      return
    }

    try {
      setTogglingWishlist(true)
      await toggleWishlist(productId)
      setInWishlist(!inWishlist)
    } catch (err) {
      console.error('[v0] Wishlist toggle error:', err)
    } finally {
      setTogglingWishlist(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <h2 className="font-semibold text-foreground">Product Not Found</h2>
              <p className="text-sm text-muted-foreground mt-1">{error || 'This product does not exist.'}</p>
              <Link href="/products">
                <Button variant="outline" className="mt-4">Back to Products</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const productImages = product.images ? JSON.parse(product.images) : [product.image]
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Structured Data */}
      <ProductStructuredData
        name={product.name}
        description={product.description}
        price={product.price}
        originalPrice={product.originalPrice}
        image={product.image}
        rating={product.rating}
        reviewCount={product.reviewCount}
        inStock={product.stock > 0}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
          <span className="text-muted-foreground">/</span>
          <Link href="/products" className="text-muted-foreground hover:text-foreground">Products</Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <ImageZoom
              src={productImages[selectedImage]}
              alt={product.name}
              className="aspect-square border border-border"
            />
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {productImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-xl border-2 flex-shrink-0 overflow-hidden transition-colors ${
                      selectedImage === idx ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category Badge */}
            <Badge variant="outline" className="w-fit">{product.category.name}</Badge>

            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">GH₵ {Number(product.price).toFixed(2)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">GH₵ {Number(product.originalPrice).toFixed(2)}</span>
                    <Badge className="bg-destructive text-white">-{discount}%</Badge>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Bundle Deals */}
            <BundleDealsInfo className="border-t border-border pt-6" />

            {/* Attributes */}
            {product.attributes && product.attributes.length > 0 && (
              <div className="border-t border-border pt-6 space-y-4">
                <h3 className="font-semibold">Product Specifications</h3>
                <div className="space-y-2">
                  {product.attributes.map((attr) => (
                    <div key={attr.name} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{attr.name}:</span>
                      <span className="font-medium text-foreground">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-3 mb-4">
                {product.stock > 0 ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    In Stock ({product.stock} available)
                  </Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
                <SizeGuideButton />
              </div>

              {product.stock > 0 && (
                <div className="space-y-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Quantity:</span>
                    <div className="flex items-center border border-border rounded">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 hover:bg-muted transition-colors"
                      >
                        −
                      </button>
                      <span className="px-4 py-2 border-l border-r border-border">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-3 py-2 hover:bg-muted transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart and Wishlist */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white"
                      size="lg"
                    >
                      {addingToCart ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Added to Cart!
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleToggleWishlist}
                      disabled={togglingWishlist}
                      variant={inWishlist ? 'default' : 'outline'}
                      size="lg"
                      className="px-4"
                    >
                      <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-4"
                      onClick={() => {
                        const url = window.location.href
                        navigator.share?.({ title: product.name, url }) || navigator.clipboard.writeText(url)
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* WhatsApp Inquiry */}
                  <a
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '233201234567'}?text=${encodeURIComponent(`Hi LuxeHair! 👋\n\nI'm interested in: *${product.name}*\n${typeof window !== 'undefined' ? window.location.href : ''}\n\nCan you tell me more?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Ask about this product
                  </a>
                </div>
              )}

              {/* Out of stock notification */}
              {product.stock <= 0 && (
                <div className="mt-4">
                  <NotifyBackInStock productId={product.id} productName={product.name} />
                </div>
              )}

              {/* Trust Badges */}
              <TrustBadges />
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-border pt-12">
          <ProductReviews productId={product.id} productName={product.name} />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-border pt-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Bought Together</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((related) => (
                <Link key={related.id} href={`/products/${related.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                    <div className="aspect-square bg-muted overflow-hidden">
                      {related.image ? (
                        <Image
                          src={related.image}
                          alt={related.name}
                          width={250}
                          height={250}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1">{related.name}</h3>
                      <p className="text-sm font-bold text-primary">GH₵ {parseFloat(related.price).toFixed(2)}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Product Recommendations */}
        <ProductRecommendations productId={product.id} />

        {/* Recently Viewed */}
        <RecentlyViewed excludeId={product.id} maxItems={6} />
      </div>
    </div>
  )
}
