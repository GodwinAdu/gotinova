'use client'

import { useState } from 'react'
import { Share2, Copy, Check, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareWishlistProps {
  items: Array<{ productId: string; name: string; price: number }>
}

/**
 * Generates a shareable wishlist link by encoding product IDs into the URL.
 * The shared page will show the products from those IDs.
 */
export function ShareWishlist({ items }: ShareWishlistProps) {
  const [copied, setCopied] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  if (items.length === 0) return null

  const generateShareLink = (): string => {
    const ids = items.map((i) => i.productId).join(',')
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/wishlist/shared?items=${encodeURIComponent(ids)}`
  }

  const generateShareText = (): string => {
    const itemList = items.slice(0, 5).map((i) => `• ${i.name}`).join('\n')
    const more = items.length > 5 ? `\n...and ${items.length - 5} more` : ''
    return `Check out my LuxeHair wishlist! 💕\n\n${itemList}${more}\n\n${generateShareLink()}`
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generateShareLink())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = generateShareLink()
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My LuxeHair Wishlist',
          text: generateShareText(),
          url: generateShareLink(),
        })
      } catch {
        // User cancelled share
      }
    } else {
      setShowOptions(true)
    }
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(generateShareText())
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="relative">
      <Button
        onClick={handleNativeShare}
        variant="outline"
        size="sm"
        className="rounded-xl gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share Wishlist
      </Button>

      {/* Share options dropdown (fallback when native share not available) */}
      {showOptions && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowOptions(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-56 bg-card border border-border/60 rounded-2xl shadow-xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => { handleCopyLink(); setShowOptions(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <button
              onClick={() => { handleWhatsAppShare(); setShowOptions(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors"
            >
              <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share via WhatsApp
            </button>
            <button
              onClick={() => { 
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(generateShareText())}`, '_blank')
                setShowOptions(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors"
            >
              <Link2 className="w-4 h-4 text-muted-foreground" />
              Share on X / Twitter
            </button>
          </div>
        </>
      )}
    </div>
  )
}
