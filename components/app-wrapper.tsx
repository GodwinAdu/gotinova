import { ReactNode } from 'react'
import { Footer } from './footer'
import { WhatsAppFloat } from './whatsapp-button'
import { AbandonedCartReminder } from './abandoned-cart-reminder'
import { LiveChat } from './live-chat'
import { CompareBar } from './compare-bar'
import { NewsletterPopup } from './newsletter-popup'
import { SocialProofPopup } from './social-proof'
import { MobileNav } from './mobile-nav'

interface AppWrapperProps {
  children: ReactNode
}

export function AppWrapper({ children }: AppWrapperProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 pb-14 md:pb-0">{children}</div>
      <Footer />
      <MobileNav />
      <CompareBar />
      <AbandonedCartReminder />
      <WhatsAppFloat message="Hi GotiNova! 👋 I have a question about your products." />
      <LiveChat />
      <NewsletterPopup />
      <SocialProofPopup />
    </div>
  )
}
