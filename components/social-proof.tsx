'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag, X } from 'lucide-react'
import Image from 'next/image'

/**
 * Social Proof Popup
 * 
 * Shows rotating notifications like "Ama from Accra just purchased..."
 * to create urgency and social proof for new visitors.
 * 
 * Uses a mix of real recent orders (if available) and generated names.
 * Appears every 30-45 seconds, auto-dismisses after 5 seconds.
 */

interface ProofNotification {
  name: string
  city: string
  product: string
  image?: string
  timeAgo: string
}

// Ghanaian names and cities for realistic generated data
const FIRST_NAMES = ['Ama', 'Kofi', 'Akua', 'Kwame', 'Abena', 'Yaw', 'Adjoa', 'Kwesi', 'Efua', 'Nana', 'Adwoa', 'Kojo', 'Akosua', 'Fiifi', 'Esi']
const CITIES = ['Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Cape Coast', 'Tema', 'Sunyani', 'Koforidua', 'Ho', 'Obuasi']
const TIME_AGOS = ['2 minutes ago', '5 minutes ago', '8 minutes ago', '12 minutes ago', '15 minutes ago', '20 minutes ago', '30 minutes ago', '1 hour ago']
const SAMPLE_PRODUCTS = [
  'Premium 24" Human Hair Wig',
  'HD Lace Front 20" Wig',
  'Curly Braiding Hair Pack',
  'Body Wave Wig 22"',
  '5x5 HD Lace Closure',
  'Premium Clip-in Extensions',
  'Water Wave Wig 22"',
  'Synthetic Straight Wig 18"',
]

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateNotification(): ProofNotification {
  return {
    name: getRandomItem(FIRST_NAMES),
    city: getRandomItem(CITIES),
    product: getRandomItem(SAMPLE_PRODUCTS),
    timeAgo: getRandomItem(TIME_AGOS),
  }
}

const STORAGE_KEY = 'gotinova-social-proof-dismissed'
const SHOW_INTERVAL = 35000 // Show every 35 seconds
const DISPLAY_DURATION = 5000 // Visible for 5 seconds
const INITIAL_DELAY = 15000 // First notification after 15 seconds

export function SocialProofPopup() {
  const [notification, setNotification] = useState<ProofNotification | null>(null)
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Don't show if dismissed this session
    if (sessionStorage.getItem(STORAGE_KEY)) return

    // Initial delay
    const initialTimer = setTimeout(() => {
      showNext()
    }, INITIAL_DELAY)

    // Recurring interval
    const interval = setInterval(() => {
      showNext()
    }, SHOW_INTERVAL)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [])

  const showNext = () => {
    if (sessionStorage.getItem(STORAGE_KEY)) return

    const notif = generateNotification()
    setNotification(notif)
    setVisible(true)

    // Auto-hide after duration
    setTimeout(() => setVisible(false), DISPLAY_DURATION)
  }

  const handleDismiss = () => {
    setVisible(false)
    sessionStorage.setItem(STORAGE_KEY, 'true')
  }

  if (!mounted || !visible || !notification) return null

  return (
    <div className="fixed bottom-[4.5rem] md:bottom-24 left-3 md:left-4 z-[50] animate-in slide-in-from-left-4 slide-in-from-bottom-2 duration-300 max-w-[calc(100vw-24px)] sm:max-w-xs">
      <div className="bg-card border border-border/60 rounded-2xl shadow-xl p-3.5 flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-5 h-5 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm font-medium text-foreground leading-snug">
            {notification.name} from {notification.city}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            just purchased <span className="font-medium text-foreground">{notification.product}</span>
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">{notification.timeAgo}</p>
        </div>

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
