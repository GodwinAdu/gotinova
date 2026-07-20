'use client'

import { useEffect } from 'react'

/**
 * Live Chat Widget — Tawk.to Integration
 * 
 * Setup:
 * 1. Go to https://www.tawk.to/ and create a free account
 * 2. Create a new property for your store
 * 3. Go to Administration > Chat Widget > Copy the widget code
 * 4. Find your Property ID and Widget ID in the script URL:
 *    https://embed.tawk.to/PROPERTY_ID/WIDGET_ID
 * 5. Add to your .env:
 *    NEXT_PUBLIC_TAWK_PROPERTY_ID=your_property_id
 *    NEXT_PUBLIC_TAWK_WIDGET_ID=your_widget_id
 * 
 * The widget appears as a chat bubble in the bottom-right corner.
 * If no Tawk.to IDs are configured, nothing renders (safe to deploy without).
 */

export function LiveChat() {
  useEffect(() => {
    const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID
    const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID

    // Don't load if not configured
    if (!propertyId || !widgetId) return
    if (propertyId === 'your_property_id') return

    // Don't double-load
    if ((window as any).Tawk_API) return

    // Initialize Tawk.to
    const s1 = document.createElement('script')
    s1.async = true
    s1.src = `https://embed.tawk.to/${propertyId}/${widgetId}`
    s1.charset = 'UTF-8'
    s1.setAttribute('crossorigin', '*')

    // Configure Tawk before it loads
    ;(window as any).Tawk_API = (window as any).Tawk_API || {}
    ;(window as any).Tawk_LoadStart = new Date()

    document.head.appendChild(s1)

    return () => {
      // Cleanup on unmount (though Tawk persists)
      try { document.head.removeChild(s1) } catch {}
    }
  }, [])

  return null // Tawk.to injects its own UI
}
