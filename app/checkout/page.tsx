'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { createOrder } from '@/app/actions/orders'
import { useSession } from '@/lib/auth-client'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils/format'
import { generateOrderWhatsAppLink } from '@/lib/utils/whatsapp'
import { initializePaystack, generateReference } from '@/lib/paystack'
import { earnPoints } from '@/components/loyalty-points'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { CouponInput } from '@/components/coupon-input'
import { CheckoutUpsell } from '@/components/checkout-upsell'
import Link from 'next/link'

interface CheckoutFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  zipCode: string
  notes: string
  paymentMethod: 'cod' | 'paystack'
}

const FALLBACK_SHIPPING = 50
const FALLBACK_TAX = 0.125
const FALLBACK_THRESHOLD = 1000

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const { items: cartItems, clearCart, getTotal } = useCartStore()

  const [mounted, setMounted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderCreated, setOrderCreated] = useState<string | null>(null)
  const [orderData, setOrderData] = useState<{
    orderNumber: string
    orderId: string
    total: number
    whatsappLink: string
  } | null>(null)

  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string
    code: string
    description: string | null
    discountType: string
    discountValue: number
  } | null>(null)

  // Dynamic pricing config from admin settings
  const [shippingCost, setShippingCost] = useState(FALLBACK_SHIPPING)
  const [taxRate, setTaxRate] = useState(FALLBACK_TAX)
  const [freeThreshold, setFreeThreshold] = useState(FALLBACK_THRESHOLD)

  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    notes: '',
    paymentMethod: 'cod',
  })

  useEffect(() => {
    setMounted(true)
    // Load pricing config from admin settings
    import('@/app/actions/settings').then(({ getShippingConfig, getTaxRate }) => {
      getShippingConfig().then(({ cost, freeThreshold: ft }) => {
        setShippingCost(cost)
        setFreeThreshold(ft)
      }).catch(() => {})
      getTaxRate().then((rate) => setTaxRate(rate)).catch(() => {})
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (isPending) return

    if (!session?.user) {
      router.push('/sign-in?redirect=/checkout')
      return
    }

    // Pre-fill email from session
    if (session.user.email) {
      setFormData(prev => ({ ...prev, email: session.user.email }))
    }
    if (session.user.name) {
      const parts = session.user.name.split(' ')
      setFormData(prev => ({
        ...prev,
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
      }))
    }
  }, [session, isPending, router])

  const subtotal = getTotal()
  const discount = appliedCoupon
    ? (appliedCoupon.discountType === 'percentage'
        ? Math.min((subtotal * appliedCoupon.discountValue) / 100, subtotal)
        : Math.min(appliedCoupon.discountValue, subtotal))
    : 0
  const afterDiscount = subtotal - discount
  const shipping = afterDiscount >= freeThreshold ? 0 : shippingCost
  const tax = Math.round(afterDiscount * taxRate * 100) / 100
  const total = afterDiscount + shipping + tax

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) { setError('First name is required'); return false }
    if (!formData.lastName.trim()) { setError('Last name is required'); return false }
    if (!formData.email.trim()) { setError('Email is required'); return false }
    if (!formData.phone.trim() || formData.phone.length < 9) { setError('Valid phone number is required'); return false }
    if (!formData.address.trim()) { setError('Address is required'); return false }
    if (!formData.city.trim()) { setError('City is required'); return false }
    setError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || cartItems.length === 0) return

    const shippingAddress = JSON.stringify({
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      zipCode: formData.zipCode,
    })

    // If paying with Paystack, open popup first
    if (formData.paymentMethod === 'paystack') {
      setSubmitting(true)
      setError(null)

      initializePaystack({
        email: formData.email,
        amount: Math.round(total * 100), // Convert to pesewas
        currency: 'GHS',
        reference: generateReference(),
        channels: ['mobile_money', 'card', 'bank_transfer'],
        metadata: {
          'Customer Name': `${formData.firstName} ${formData.lastName}`,
          'Phone': formData.phone,
          'City': formData.city,
        },
        onSuccess: async (response) => {
          // Payment successful — now create the order
          try {
            const result = await createOrder({
              shippingAddress,
              billingAddress: shippingAddress,
              paymentMethod: `Paystack (${response.reference})`,
              items: cartItems.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              })),
            })

            if (!result.success) {
              setError(result.error || 'Order creation failed after payment')
              setSubmitting(false)
              return
            }

            const whatsappLink = generateOrderWhatsAppLink({
              orderNumber: result.data?.orderNumber || 'N/A',
              customerName: `${formData.firstName} ${formData.lastName}`,
              items: cartItems.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
              total,
              paymentMethod: 'Paystack (Paid)',
              city: formData.city,
            })

            clearCart()
            earnPoints(total, result.data?.orderNumber || '')
            setOrderData({
              orderNumber: result.data?.orderNumber || '',
              orderId: result.data?.orderId || '',
              total,
              whatsappLink,
            })
            setOrderCreated(result.data?.orderNumber || 'Order placed!')
          } catch (err) {
            setError('Failed to create order after payment. Please contact support.')
          } finally {
            setSubmitting(false)
          }
        },
        onCancel: () => {
          setSubmitting(false)
          setError('Payment was cancelled. You can try again.')
        },
      })
      return
    }

    // Cash on Delivery flow
    try {
      setSubmitting(true)
      setError(null)

      const result = await createOrder({
        shippingAddress,
        billingAddress: shippingAddress,
        paymentMethod: 'Cash on Delivery',
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      })

      if (!result.success) {
        setError(result.error || 'Failed to create order')
        return
      }

      const whatsappLink = generateOrderWhatsAppLink({
        orderNumber: result.data?.orderNumber || 'N/A',
        customerName: `${formData.firstName} ${formData.lastName}`,
        items: cartItems.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
        total,
        paymentMethod: 'Cash on Delivery',
        city: formData.city,
      })

      clearCart()
      earnPoints(total, result.data?.orderNumber || '')
      setOrderData({
        orderNumber: result.data?.orderNumber || '',
        orderId: result.data?.orderId || '',
        total,
        whatsappLink,
      })
      setOrderCreated(result.data?.orderNumber || 'Order placed!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order')
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (orderCreated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md p-8 text-center space-y-5">
          <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Order Placed!</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Order <span className="font-medium text-foreground">{orderData?.orderNumber}</span> confirmed
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">{formatPrice(orderData?.total || 0)}</span>
          </p>

          {/* WhatsApp Notification */}
          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              📲 Send your order via WhatsApp for faster confirmation
            </p>
            <WhatsAppButton
              href={orderData?.whatsappLink || '#'}
              size="lg"
              className="w-full"
            >
              Confirm via WhatsApp
            </WhatsAppButton>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
              Tap to send your order details to our team instantly
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <Button asChild className="w-full rounded-xl" variant="outline">
              <Link href={`/orders/${orderData?.orderId}`}>View Order Details</Link>
            </Button>
            <Button asChild className="w-full rounded-xl" variant="ghost">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md p-8 text-center space-y-4">
          <h2 className="text-xl font-bold">Your cart is empty</h2>
          <p className="text-sm text-muted-foreground">Add some products before checking out.</p>
          <Button asChild className="rounded-xl">
            <Link href="/products">Browse Products</Link>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Button variant="ghost" size="sm" asChild className="rounded-xl">
            <Link href="/cart">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Cart
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-5">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Shipping Info */}
              <Card className="p-5 sm:p-6 space-y-4">
                <h2 className="text-lg font-semibold">Shipping Information</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">First Name</label>
                    <Input name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Ama" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Last Name</label>
                    <Input name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Mensah" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <Input name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Phone Number</label>
                  <Input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="+233 20 123 4567" required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Delivery Address</label>
                  <Input name="address" value={formData.address} onChange={handleInputChange} placeholder="Street address, house number" required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">City</label>
                    <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="Accra" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Post Code (optional)</label>
                    <Input name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="GA-123" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Order Notes (optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Special delivery instructions..."
                    className="w-full px-3.5 py-2.5 border border-input rounded-xl bg-background text-foreground placeholder-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring text-sm transition-all"
                    rows={3}
                  />
                </div>
              </Card>

              {/* Payment */}
              <Card className="p-5 sm:p-6 space-y-4">
                <h2 className="text-lg font-semibold">Payment Method</h2>

                <div className="space-y-2.5">
                  <label
                    className={`flex items-start p-3.5 border rounded-xl cursor-pointer transition-all ${
                      formData.paymentMethod === 'paystack' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:border-border/80'
                    }`}
                  >
                    <input type="radio" name="paymentMethod" value="paystack" checked={formData.paymentMethod === 'paystack'} onChange={handleInputChange} className="w-4 h-4 accent-primary mt-0.5" />
                    <span className="ml-3">
                      <p className="font-medium text-sm">Pay Now (Recommended)</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Mobile Money • Debit/Credit Card • Bank Transfer</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-[#FFCB05] text-black text-[10px] font-bold rounded">MTN MoMo</span>
                        <span className="px-2 py-0.5 bg-[#E60000] text-white text-[10px] font-bold rounded">Vodafone</span>
                        <span className="px-2 py-0.5 bg-[#003B71] text-white text-[10px] font-bold rounded">AirtelTigo</span>
                        <span className="px-2 py-0.5 bg-muted text-foreground text-[10px] font-bold rounded">VISA</span>
                      </div>
                    </span>
                  </label>

                  <label
                    className={`flex items-start p-3.5 border rounded-xl cursor-pointer transition-all ${
                      formData.paymentMethod === 'cod' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:border-border/80'
                    }`}
                  >
                    <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} className="w-4 h-4 accent-primary mt-0.5" />
                    <span className="ml-3">
                      <p className="font-medium text-sm">Cash on Delivery</p>
                      <p className="text-[11px] text-muted-foreground">Pay with cash when you receive your order</p>
                    </span>
                  </label>
                </div>

                {formData.paymentMethod === 'paystack' && (
                  <div className="bg-muted/50 rounded-xl p-3 space-y-1.5">
                    <p className="text-xs font-medium">💡 Secure Payment via Paystack</p>
                    <p className="text-[11px] text-muted-foreground">
                      You&apos;ll be redirected to Paystack&apos;s secure payment page. Choose Mobile Money, Card, or Bank Transfer to complete payment.
                    </p>
                  </div>
                )}
              </Card>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl text-sm font-medium shadow-sm"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : formData.paymentMethod === 'paystack' ? (
                  `Pay ${formatPrice(total)} Now`
                ) : (
                  `Place Order — ${formatPrice(total)}`
                )}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5" />
                {formData.paymentMethod === 'paystack' ? 'Secured by Paystack' : 'Your information is encrypted and secure'}
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-5 sm:p-6 sticky top-20 space-y-5">
              <h2 className="text-lg font-semibold">Order Summary</h2>

              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="w-14 h-14 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                      {item.image && item.image !== '/placeholder.jpg' ? (
                        <Image src={item.image} alt={item.name} width={56} height={56} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">N/A</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-2">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-xs font-semibold text-primary">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code */}
              <div className="border-t border-border pt-4">
                <CouponInput
                  subtotal={subtotal}
                  appliedCoupon={appliedCoupon}
                  onApply={setAppliedCoupon}
                  onRemove={() => setAppliedCoupon(null)}
                />
              </div>

              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? <span className="text-emerald-600">Free</span> : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({(taxRate * 100).toFixed(1)}%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex justify-between items-center">
                <span className="font-bold">Total</span>
                <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
              </div>

              <Link href="/cart" className="block">
                <Button variant="outline" size="sm" className="w-full rounded-xl text-xs">
                  Edit Cart
                </Button>
              </Link>

              {/* Upsell suggestions */}
              <CheckoutUpsell />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
