'use client'

/**
 * Paystack Payment Integration
 * 
 * Uses Paystack Inline Popup for Ghana (GHS) payments.
 * Supports: Mobile Money (MTN, Vodafone, AirtelTigo), Cards, Bank Transfer
 * 
 * Setup:
 * 1. Create an account at https://paystack.com
 * 2. Get your PUBLIC key from Settings > API Keys & Webhooks
 * 3. Add to .env: NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
 */

export interface PaystackConfig {
  email: string
  amount: number // in pesewas (GHS * 100)
  currency?: string
  reference?: string
  metadata?: Record<string, any>
  channels?: ('card' | 'mobile_money' | 'bank_transfer' | 'qr' | 'bank')[]
  onSuccess: (response: PaystackResponse) => void
  onCancel: () => void
}

export interface PaystackResponse {
  reference: string
  trans: string
  status: string
  message: string
  transaction: string
  trxref: string
}

/**
 * Generate a unique payment reference
 */
export function generateReference(): string {
  return `LH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

/**
 * Initialize Paystack payment popup
 */
export function initializePaystack(config: PaystackConfig): void {
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

  if (!publicKey) {
    console.error('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not set')
    config.onCancel()
    return
  }

  // Load Paystack script if not already loaded
  if (!(window as any).PaystackPop) {
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v2/inline.js'
    script.onload = () => openPaystack(config, publicKey)
    script.onerror = () => {
      console.error('Failed to load Paystack script')
      config.onCancel()
    }
    document.head.appendChild(script)
  } else {
    openPaystack(config, publicKey)
  }
}

function openPaystack(config: PaystackConfig, publicKey: string) {
  try {
    const handler = (window as any).PaystackPop.setup({
      key: publicKey,
      email: config.email,
      amount: config.amount, // in pesewas
      currency: config.currency || 'GHS',
      ref: config.reference || generateReference(),
      channels: config.channels || ['mobile_money', 'card', 'bank_transfer'],
      metadata: {
        custom_fields: [
          ...(config.metadata ? Object.entries(config.metadata).map(([key, value]) => ({
            display_name: key,
            variable_name: key.toLowerCase().replace(/\s+/g, '_'),
            value: String(value),
          })) : []),
        ],
      },
      callback: (response: PaystackResponse) => {
        config.onSuccess(response)
      },
      onClose: () => {
        config.onCancel()
      },
    })
    handler.openIframe()
  } catch (err) {
    console.error('Paystack initialization error:', err)
    config.onCancel()
  }
}
