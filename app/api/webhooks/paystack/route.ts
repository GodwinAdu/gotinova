import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { apiLimiter } from '@/lib/rate-limit'

/**
 * Paystack Webhook Handler
 * 
 * Verifies payment server-side after Paystack processes a transaction.
 * This is more secure than relying solely on the client-side callback.
 * 
 * Setup:
 * 1. In Paystack dashboard → Settings → API Keys & Webhooks
 * 2. Add webhook URL: https://yourdomain.com/api/webhooks/paystack
 * 3. Set PAYSTACK_SECRET_KEY in .env
 * 
 * Events handled:
 * - charge.success — Payment successful
 */

export async function POST(req: NextRequest) {
  try {
    // Rate limit
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'webhook'
    const { success } = await apiLimiter.check(ip)
    if (!success) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }

    const body = await req.text()
    const signature = req.headers.get('x-paystack-signature')

    // Verify webhook signature
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) {
      console.error('[Paystack Webhook] PAYSTACK_SECRET_KEY not configured')
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }

    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(body)
      .digest('hex')

    if (hash !== signature) {
      console.error('[Paystack Webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse event
    const event = JSON.parse(body)
    console.log(`[Paystack Webhook] Event: ${event.event}`)

    if (event.event === 'charge.success') {
      const { reference, amount, currency, customer } = event.data

      // Find order by payment reference (stored in paymentMethod field as "Paystack (ref)")
      // The reference format is: LH-XXXXXX-XXXXXX
      const orderResult = await db
        .select()
        .from(orders)
        .where(eq(orders.paymentMethod, `Paystack (${reference})`))

      if (orderResult.length > 0) {
        // Update payment status to paid
        await db
          .update(orders)
          .set({
            paymentStatus: 'paid',
            updatedAt: new Date(),
          })
          .where(eq(orders.id, orderResult[0].id))

        console.log(`[Paystack Webhook] Order ${orderResult[0].orderNumber} marked as paid`)
      } else {
        console.log(`[Paystack Webhook] No order found for reference: ${reference}`)
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('[Paystack Webhook] Error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Paystack only sends POST
export async function GET() {
  return NextResponse.json({ status: 'Paystack webhook endpoint active' })
}
