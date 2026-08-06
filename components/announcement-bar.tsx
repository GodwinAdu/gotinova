'use client'

import { useState, useEffect } from 'react'
import { X, Truck, Gift, Zap } from 'lucide-react'
import Link from 'next/link'

const ANNOUNCEMENTS = [
  { text: '🚚 Free Delivery on orders over GH₵ 1,000', icon: Truck, link: '/shipping' },
  { text: '🎉 New customers get 10% off — Use code WELCOME10', icon: Gift, link: '/products' },
  { text: '⚡ Flash Deals updated daily — Shop now!', icon: Zap, link: '/products' },
]

export function AnnouncementBar() {
  const [current, setCurrent] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check session storage
    if (sessionStorage.getItem('announcement-dismissed')) {
      setDismissed(true)
    }
  }, [])

  useEffect(() => {
    if (dismissed) return
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % ANNOUNCEMENTS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [dismissed])

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('announcement-dismissed', 'true')
  }

  if (!mounted || dismissed) return null

  const announcement = ANNOUNCEMENTS[current]

  return (
    <div className="bg-primary text-primary-foreground relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-9 sm:h-10">
          <Link
            href={announcement.link}
            className="flex items-center gap-2 text-[11px] sm:text-xs font-medium hover:opacity-90 transition-opacity animate-in fade-in duration-500"
            key={current}
          >
            <span>{announcement.text}</span>
          </Link>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Progress dots */}
      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-1">
        {ANNOUNCEMENTS.map((_, i) => (
          <div
            key={i}
            className={`h-[2px] rounded-full transition-all duration-300 ${
              i === current ? 'w-3 bg-white' : 'w-1 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
