'use client'

import { ReactNode, lazy, Suspense } from 'react'
import { Footer } from './footer'
import { MobileNav } from './mobile-nav'

// Lazy-load non-critical widgets — they don't need to be in the initial bundle
const WhatsAppFloat = lazy(() => import('./whatsapp-button').then(m => ({ default: m.WhatsAppFloat })))
const AbandonedCartReminder = lazy(() => import('./abandoned-cart-reminder').then(m => ({ default: m.AbandonedCartReminder })))
const LiveChat = lazy(() => import('./live-chat').then(m => ({ default: m.LiveChat })))
const CompareBar = lazy(() => import('./compare-bar').then(m => ({ default: m.CompareBar })))
const NewsletterPopup = lazy(() => import('./newsletter-popup').then(m => ({ default: m.NewsletterPopup })))
const SocialProofPopup = lazy(() => import('./social-proof').then(m => ({ default: m.SocialProofPopup })))

interface AppWrapperProps {
  children: ReactNode
}

export function AppWrapper({ children }: AppWrapperProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 pb-14 md:pb-0">{children}</div>
      <Footer />
      <MobileNav />
      <Suspense fallback={null}>
        <CompareBar />
        <AbandonedCartReminder />
        <WhatsAppFloat message="Hi GotiNova! 👋 I have a question about your products." />
        <LiveChat />
        <NewsletterPopup />
        <SocialProofPopup />
      </Suspense>
    </div>
  )
}
