'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Heart, Star, ShoppingCart, Share2, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { getProductById, getReviewsForProduct, getFrequentlyBoughtTogether } from '@/app/actions/products'
import { addToCart } from '@/app/actions/cart'
import { toggleWishlist, isInWishlist } from '@/app/actions/wishlist'
import { useSession } from '@/lib/auth-client'
import Link from 'next/link'

interface ProductDetails {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  stock: number
  image: string
  images?: string
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
  const [relatedProducts, setRelatedProducts] = useState<ProductDetails[]>([])
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
    if (!session?.user) {
      window.location.href = '/sign-in'
      return
    }

    try {
      setAddingToCart(true)
      await addToCart(productId, quantity)
      alert('Added to cart successfully!')
      setQuantity(1)
    } catch (err) {
      console.error('[v0] Add to cart error:', err)
      alert(err instanceof Error ? err.message : 'Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleToggleWishlist = async () => {
    if (!session?.user) {
      window.location.href = '/sign-in'
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
            <div className="aspect-square bg-card rounded-lg overflow-hidden border border-border">
              <Image
                src={productImages[selectedImage]}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {productImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded border-2 flex-shrink-0 overflow-hidden transition-colors ${
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
                <span className="text-3xl font-bold text-primary">PKR {product.price.toFixed(0)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">PKR {product.originalPrice.toFixed(0)}</span>
                    <Badge className="bg-destructive text-white">-{discount}%</Badge>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground">{product.description}</p>
            </div>

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
              <div className="mb-4">
                {product.stock > 0 ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    In Stock ({product.stock} available)
                  </Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
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
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
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
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="border-t border-border pt-12">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            <div className="space-y-4">
              {reviews.slice(0, 5).map((review) => (
                <Card key={review.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{review.title || 'No title'}</h3>
                      <p className="text-sm text-muted-foreground">{review.userName}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                  <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-border pt-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Bought Together</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((related) => (
                <Link key={related.id} href={`/products/${related.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                    <div className="aspect-square bg-muted overflow-hidden">
                      <Image
                        src={related.image}
                        alt={related.name}
                        width={250}
                        height={250}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1">{related.name}</h3>
                      <p className="text-sm font-bold text-primary">PKR {related.price.toFixed(0)}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
