'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { getCartItems, clearCart } from '@/app/actions/cart'
import { createOrder } from '@/app/actions/orders'
import { useSession } from '@/lib/auth-client'
import Link from 'next/link'

interface CartItem {
  id: string
  product: {
    id: string
    name: string
    image: string
    price: number
  }
  quantity: number
}

interface CheckoutFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  zipCode: string
  notes: string
  paymentMethod: 'cod' | 'advance'
}

const SHIPPING_COST = 500
const TAX_RATE = 0.17

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderCreated, setOrderCreated] = useState<string | null>(null)

  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: session?.user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    notes: '',
    paymentMethod: 'cod',
  })

  useEffect(() => {
    if (!session?.user) {
      router.push('/sign-in?redirect=/checkout')
      return
    }

    const loadCart = async () => {
      try {
        setLoading(true)
        const items = await getCartItems()
        if (!items || items.length === 0) {
          router.push('/cart')
          return
        }
        setCartItems(items)
      } catch (err) {
        console.error('[v0] Load cart error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load cart')
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [session?.user, router])

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  const tax = Math.round(subtotal * TAX_RATE)
  const total = subtotal + tax + SHIPPING_COST

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError('First name is required')
      return false
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setError('Valid phone number is required')
      return false
    }
    if (!formData.address.trim()) {
      setError('Address is required')
      return false
    }
    if (!formData.city.trim()) {
      setError('City is required')
      return false
    }
    if (!formData.zipCode.trim()) {
      setError('Zip code is required')
      return false
    }
    setError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || cartItems.length === 0) {
      return
    }

    try {
      setSubmitting(true)
      
      const shippingAddress = `${formData.address}, ${formData.city}, ${formData.zipCode}`
      
      const orderId = await createOrder({
        items: cartItems.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        subtotal,
        tax,
        shippingCost: SHIPPING_COST,
        totalAmount: total,
        shippingAddress,
        billingAddress: shippingAddress,
        paymentMethod: formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Advance Payment',
        paymentStatus: formData.paymentMethod === 'advance' ? 'pending' : 'pending',
        notes: formData.notes,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerName: `${formData.firstName} ${formData.lastName}`,
      })

      setOrderCreated(orderId)
      await clearCart()
      
      // Redirect to order confirmation after 2 seconds
      setTimeout(() => {
        router.push(`/orders/${orderId}`)
      }, 2000)
    } catch (err) {
      console.error('[v0] Order creation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create order')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (orderCreated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Order Created Successfully!</h2>
          <p className="text-muted-foreground mb-4">Order ID: {orderCreated}</p>
          <p className="text-sm text-muted-foreground mb-6">Redirecting to your order details...</p>
          <Loader2 className="w-4 h-4 animate-spin mx-auto text-primary" />
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <Card className="p-4 bg-destructive/10 border-destructive/30 flex gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-destructive">Error</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <Card className="p-6 space-y-4">
                <h2 className="text-xl font-bold">Shipping Information</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+92 300 1234567"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Karachi"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Zip Code</label>
                    <Input
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="75500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Order Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add special instructions for your order..."
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                </div>
              </Card>

              {/* Payment Method */}
              <Card className="p-6 space-y-4">
                <h2 className="text-xl font-bold">Payment Method</h2>
                
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-border rounded cursor-pointer hover:bg-muted transition-colors" 
                    style={{ borderColor: formData.paymentMethod === 'cod' ? 'var(--primary)' : undefined }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="ml-3">
                      <p className="font-medium">Cash on Delivery (COD)</p>
                      <p className="text-xs text-muted-foreground">Pay when you receive your order</p>
                    </span>
                  </label>

                  <label className="flex items-center p-3 border border-border rounded cursor-pointer hover:bg-muted transition-colors"
                    style={{ borderColor: formData.paymentMethod === 'advance' ? 'var(--primary)' : undefined }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="advance"
                      checked={formData.paymentMethod === 'advance'}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="ml-3">
                      <p className="font-medium">Advance Payment</p>
                      <p className="text-xs text-muted-foreground">Pay now to confirm your order</p>
                    </span>
                  </label>
                </div>
              </Card>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary/90 text-white h-12"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Place Order - PKR ${total.toFixed(0)}`
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By placing this order, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-8 space-y-6">
              <h2 className="text-xl font-bold">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto border-b border-border pb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-primary">PKR {(item.product.price * item.quantity).toFixed(0)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>PKR {subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>PKR {SHIPPING_COST.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (17%)</span>
                  <span>PKR {tax.toFixed(0)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-bold text-primary">PKR {total.toFixed(0)}</span>
                </div>
              </div>

              <Link href="/cart">
                <Button variant="outline" className="w-full">Edit Cart</Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
