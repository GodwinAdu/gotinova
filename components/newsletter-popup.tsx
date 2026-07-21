'use client'

import { useEffect, useState } from 'react'
import { X, Mail, Gift, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { subscribeToNewsletter } from '@/app/actions/newsletter'

/**
 * Newsletter Popup — appears after 10 seconds on first visit.
 * Dismisses for 7 days after closing.
 * Also includes a footer-inline version.
 */

const STORAGE_KEY = 'gotinova-newsletter'
const POPUP_DELAY = 10000 // 10 seconds
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

interface NewsletterState {
  subscribed: boolean
  dismissedAt: number | null
}

function getState(): NewsletterState {
  if (typeof window === 'undefined') return { subscribed: false, dismissedAt: null }
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return { subscribed: false, dismissedAt: null }
  }
}

function saveState(state: NewsletterState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

async function subscribeEmail(email: string): Promise<boolean> {
  try {
    const result = await subscribeToNewsletter(email)
    return result.success
  } catch {
    return false
  }
}

// ============ Popup Version ============

export function NewsletterPopup() {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const state = getState()

    // Don't show if already subscribed or recently dismissed
    if (state.subscribed) return
    if (state.dismissedAt && Date.now() - state.dismissedAt < DISMISS_DURATION) return

    const timer = setTimeout(() => setShow(true), POPUP_DELAY)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setShow(false)
    saveState({ ...getState(), dismissedAt: Date.now() })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) return

    setLoading(true)
    const ok = await subscribeEmail(email.trim())
    if (ok) {
      setSuccess(true)
      saveState({ subscribed: true, dismissedAt: null })
      setTimeout(() => setShow(false), 3000)
    }
    setLoading(false)
  }

  if (!mounted || !show) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleDismiss} />

      {/* Modal */}
      <div className="relative bg-card border border-border/60 rounded-3xl shadow-2xl w-full max-w-sm p-6 sm:p-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Close */}
        <button onClick={handleDismiss} className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground rounded transition-colors">
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center space-y-3 py-4">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold">You&apos;re in! 🎉</h2>
            <p className="text-sm text-muted-foreground">Check your inbox for your welcome discount.</p>
          </div>
        ) : (
          <>
            {/* Icon */}
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Gift className="w-7 h-7 text-primary" />
            </div>

            {/* Content */}
            <div className="text-center space-y-2 mb-5">
              <h2 className="text-xl font-bold">Get 10% Off Your First Order</h2>
              <p className="text-sm text-muted-foreground">
                Subscribe to our newsletter for exclusive deals, new arrivals, and hair care tips.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 h-11"
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Subscribe & Get 10% Off
              </Button>
            </form>

            <p className="text-[10px] text-muted-foreground text-center mt-3">
              No spam, unsubscribe anytime. By subscribing you agree to our Privacy Policy.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// ============ Footer Inline Version ============

export function NewsletterInline() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const state = getState()
    if (state.subscribed) setSuccess(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) return

    setLoading(true)
    const ok = await subscribeEmail(email.trim())
    if (ok) {
      setSuccess(true)
      saveState({ subscribed: true, dismissedAt: null })
    }
    setLoading(false)
  }

  if (!mounted) return null

  if (success) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600">
        <CheckCircle className="w-4 h-4" />
        <span>You&apos;re subscribed!</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-sm">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="flex-1 h-9 text-sm"
        disabled={loading}
        required
      />
      <Button type="submit" size="sm" disabled={loading} className="rounded-xl h-9 px-3 text-xs">
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Subscribe'}
      </Button>
    </form>
  )
}
