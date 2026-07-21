'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Trash2, ShoppingBag, Minus, Plus, Lock, ArrowRight, ShieldCheck } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { useSession } from '@/lib/auth-client'
import { formatPrice } from '@/lib/utils/format'
import { CartItemSkeleton } from '@/components/skeletons'
import { BundleDealBadge, calculateBundleSavings, getBundleDiscount } from '@/components/bundle-deal'
import { SwipeToDelete } from '@/components/swipe-to-delete'

export default function CartPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, updateQuantity, removeItem } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  // Hydration fix for Zustand persist
  useEffect(() => {
    setMounted(true)
  }, [])

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const bundleSavings = calculateBundleSavings(subtotal, totalItems)
  const afterBundle = subtotal - bundleSavings
  // These use fallback values; checkout page loads actual config from admin settings
  const shipping = afterBundle > 1000 ? 0 : 50
  const tax = afterBundle * 0.125
  const total = afterBundle + shipping + tax

  const handleCheckout = () => {
    if (!session?.user) {
      setShowAuthPrompt(true)
      return
    }
    router.push('/checkout')
  }

  if (!mounted) {
    return (
      <>
        <Header user={session?.user} />
        <main className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-48 animate-pulse" />
              <CartItemSkeleton />
              <CartItemSkeleton />
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header user={session?.user} />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Shopping Cart</h1>

          {items.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-muted/60 flex items-center justify-center">
                <ShoppingBag className="w-9 h-9 text-muted-foreground/60" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                Looks like you haven&apos;t added any items yet. Explore our collection to find something you love.
              </p>
              <Button asChild className="rounded-xl">
                <Link href="/products">
                  Browse Products
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-3">
                <p className="text-sm text-muted-foreground mb-3">
                  {items.length} item{items.length > 1 ? 's' : ''} in cart
                </p>
                {items.map((item) => (
                  <SwipeToDelete key={item.productId} onDelete={() => removeItem(item.productId)}>
                  <div
                    className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-card border border-border/60 rounded-2xl"
                  >
                    {/* Image */}
                    <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-xl overflow-hidden">
                        {item.image && item.image !== '/placeholder.jpg' ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.productId}`}
                        className="font-medium text-sm sm:text-base hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <p className="text-base sm:text-lg font-bold text-foreground mt-1">
                        {formatPrice(item.price)}
                      </p>

                      {/* Quantity controls — mobile-friendly */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-border rounded-xl overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2 hover:bg-muted transition-colors disabled:opacity-30"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 sm:px-4 py-1.5 text-sm font-medium min-w-[2.5rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="p-2 hover:bg-muted transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  </SwipeToDelete>
                ))}
              </div>

              {/* Order Summary */}
              <div className="h-fit">
                <div className="bg-card border border-border/60 rounded-2xl p-5 sm:p-6 sticky top-20 space-y-5">
                  <h3 className="text-lg font-semibold">Order Summary</h3>

                  {/* Bundle deal indicator */}
                  <BundleDealBadge />

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    {bundleSavings > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Bundle Discount ({getBundleDiscount(totalItems)?.discount}%)</span>
                        <span className="font-medium">-{formatPrice(bundleSavings)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">
                        {shipping === 0 ? (
                          <span className="text-emerald-600">Free</span>
                        ) : (
                          formatPrice(shipping)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (12.5%)</span>
                      <span className="font-medium">{formatPrice(tax)}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 flex justify-between items-center">
                    <span className="font-bold text-base">Total</span>
                    <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
                  </div>

                  {shipping > 0 && (
                    <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                      💡 Add {formatPrice(1000 - subtotal)} more for free shipping
                    </p>
                  )}

                  <Button
                    onClick={handleCheckout}
                    className="w-full h-11 rounded-xl text-sm font-medium shadow-sm"
                    size="lg"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Proceed to Checkout
                  </Button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Secure checkout
                  </div>

                  <Button variant="ghost" size="sm" asChild className="w-full text-muted-foreground">
                    <Link href="/products">← Continue Shopping</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Auth Prompt Modal */}
        {showAuthPrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setShowAuthPrompt(false)}
            />

            {/* Modal */}
            <div className="relative bg-card border border-border/60 rounded-3xl shadow-2xl w-full max-w-sm p-6 sm:p-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 space-y-5">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Sign in to checkout</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Create an account or sign in to complete your purchase. Your cart items will be waiting for you.
                </p>
              </div>

              <div className="space-y-3">
                <Button asChild className="w-full h-11 rounded-xl font-medium">
                  <Link href="/sign-in?redirect=/cart">
                    Sign In
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full h-11 rounded-xl font-medium">
                  <Link href="/sign-up?redirect=/cart">
                    Create Account
                  </Link>
                </Button>
              </div>

              <button
                onClick={() => setShowAuthPrompt(false)}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors pt-1"
              >
                Continue browsing
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
