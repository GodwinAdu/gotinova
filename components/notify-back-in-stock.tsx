'use client'

import { useState } from 'react'
import { Bell, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface NotifyBackInStockProps {
  productId: string
  productName: string
}

const STORAGE_KEY = 'luxehair-stock-notifications'

function getSubscriptions(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveSubscription(productId: string, email: string) {
  const subs = getSubscriptions()
  subs[productId] = email
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subs))
}

function isSubscribed(productId: string): boolean {
  return !!getSubscriptions()[productId]
}

/**
 * Shows a "Notify me when back in stock" form for out-of-stock products.
 * Stores the subscription in localStorage (in a real app, this would call a server action
 * to store in DB and trigger an email when stock is updated).
 */
export function NotifyBackInStock({ productId, productName }: NotifyBackInStockProps) {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(() => isSubscribed(productId))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email')
      return
    }

    setLoading(true)

    // Simulate API call (in production, this would call a server action)
    await new Promise(resolve => setTimeout(resolve, 800))

    saveSubscription(productId, email.trim())
    setSubscribed(true)
    setLoading(false)
  }

  if (subscribed) {
    return (
      <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl">
        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <div>
          <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200">
            You&apos;ll be notified!
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
            We&apos;ll email you when this item is back in stock.
          </p>
        </div>
      </div>
    )
  }

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        variant="outline"
        className="w-full rounded-xl gap-2 h-11 border-dashed"
      >
        <Bell className="w-4 h-4" />
        Notify Me When Available
      </Button>
    )
  }

  return (
    <div className="p-4 bg-muted/50 border border-border rounded-xl space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="w-4 h-4 text-primary" />
        <p className="text-sm font-medium">Get notified when back in stock</p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 h-9 text-sm"
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={loading}
          size="sm"
          className="rounded-xl h-9 px-4"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Notify Me'}
        </Button>
      </form>

      {error && <p className="text-[11px] text-destructive">{error}</p>}

      <p className="text-[10px] text-muted-foreground">
        We&apos;ll only email you once when this product is restocked. No spam.
      </p>
    </div>
  )
}
