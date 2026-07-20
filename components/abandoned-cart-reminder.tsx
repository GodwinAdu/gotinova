'use client'

import { useEffect, useState } from 'react'
import { X, ShoppingCart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils/format'
import Link from 'next/link'

/**
 * Abandoned Cart Recovery
 * 
 * Shows a slide-up reminder when:
 * 1. User has items in cart
 * 2. They've been on the site for 60+ seconds without going to checkout
 * 3. They haven't dismissed the reminder in this session
 * 
 * Also tracks when items were added — if user returns after 1+ hours
 * with items still in cart, show reminder immediately.
 */

const STORAGE_KEY = 'luxehair-cart-reminder'
const REMINDER_DELAY = 60000 // 60 seconds before showing
const RETURN_THRESHOLD = 60 * 60 * 1000 // 1 hour

interface ReminderState {
  dismissedAt: number | null
  lastCartActivity: number
}

function getReminderState(): ReminderState {
  if (typeof window === 'undefined') return { dismissedAt: null, lastCartActivity: Date.now() }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return { dismissedAt: null, lastCartActivity: Date.now() }
}

function saveReminderState(state: ReminderState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function AbandonedCartReminder() {
  const [show, setShow] = useState(false)
  const [mounted, setMounted] = useState(false)
  const items = useCartStore((s) => s.items)
  const getTotal = useCartStore((s) => s.getTotal)
  const getItemCount = useCartStore((s) => s.getItemCount)

  useEffect(() => {
    setMounted(true)

    if (items.length === 0) return

    const state = getReminderState()
    const now = Date.now()

    // Don't show if dismissed in last 24 hours
    if (state.dismissedAt && now - state.dismissedAt < 24 * 60 * 60 * 1000) return

    // If returning user with old cart (1+ hours), show immediately
    if (state.lastCartActivity && now - state.lastCartActivity > RETURN_THRESHOLD) {
      setTimeout(() => setShow(true), 3000) // Small delay for UX
      return
    }

    // Otherwise show after 60 seconds of browsing
    const timer = setTimeout(() => {
      const currentState = getReminderState()
      if (!currentState.dismissedAt || now - currentState.dismissedAt > 24 * 60 * 60 * 1000) {
        setShow(true)
      }
    }, REMINDER_DELAY)

    return () => clearTimeout(timer)
  }, [items.length])

  // Track cart activity
  useEffect(() => {
    if (items.length > 0) {
      saveReminderState({ ...getReminderState(), lastCartActivity: Date.now() })
    }
  }, [items])

  const handleDismiss = () => {
    setShow(false)
    saveReminderState({ ...getReminderState(), dismissedAt: Date.now() })
  }

  if (!mounted || !show || items.length === 0) return null

  const total = getTotal()
  const count = getItemCount()

  return (
    <div className="fixed bottom-[4.5rem] md:bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:w-80 z-[60] animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border/60 rounded-2xl shadow-2xl p-4 space-y-3">
        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">You left something behind!</p>
            <p className="text-xs text-muted-foreground">
              {count} item{count > 1 ? 's' : ''} worth {formatPrice(total)} in your cart
            </p>
          </div>
        </div>

        {/* Items preview */}
        <div className="flex gap-1.5 overflow-hidden">
          {items.slice(0, 3).map((item) => (
            <div key={item.productId} className="w-10 h-10 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
              {item.image && item.image !== '/placeholder.jpg' ? (
                <img src={item.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground">N/A</div>
              )}
            </div>
          ))}
          {items.length > 3 && (
            <div className="w-10 h-10 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center text-xs text-muted-foreground font-medium">
              +{items.length - 3}
            </div>
          )}
        </div>

        {/* CTA */}
        <Button asChild className="w-full rounded-xl h-9 text-xs gap-2">
          <Link href="/cart" onClick={handleDismiss}>
            Complete Your Order
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
