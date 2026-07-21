import nodemailer from 'nodemailer'

/**
 * Email Notification System — Nodemailer
 * 
 * Supports any SMTP provider:
 * - Gmail (with App Password)
 * - Outlook/Hotmail
 * - Zoho
 * - Custom SMTP (Namecheap, cPanel, etc.)
 * - Mailtrap (for testing)
 * 
 * Setup in .env:
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=your-email@gmail.com
 *   SMTP_PASS=your-app-password
 *   SMTP_FROM=GotiNova <orders@gotinova.com>
 */

const STORE_NAME = 'GotiNova'

function createTransporter() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const transporter = createTransporter()

  if (!transporter) {
    console.log(`[Email] Skipped (SMTP not configured) → ${to}: "${subject}"`)
    return false
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `${STORE_NAME} <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    })
    console.log(`[Email] Sent → ${to}: "${subject}"`)
    return true
  } catch (error) {
    console.error(`[Email] Failed → ${to}:`, error)
    return false
  }
}

// ============ HTML Template ============

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
<div style="max-width:600px;margin:0 auto;padding:20px;">
  <div style="text-align:center;padding:24px 0;border-bottom:1px solid #e5e7eb;">
    <h1 style="margin:0;font-size:24px;color:#1f2937;">${STORE_NAME}</h1>
    <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Premium Hair & Beauty Store</p>
  </div>
  <div style="padding:32px 0;">
    ${content}
  </div>
  <div style="text-align:center;padding:24px 0;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;">
    <p style="margin:0;">Thank you for shopping with ${STORE_NAME}</p>
    <p style="margin:8px 0 0;">Kumasi, Ghana • achaempomaatina352@gmail.com</p>
  </div>
</div>
</body>
</html>`
}

// ============ Email Functions ============

export async function sendOrderConfirmation(data: {
  customerEmail: string
  customerName: string
  orderNumber: string
  items: Array<{ name: string; quantity: number; price: number }>
  total: number
  paymentMethod: string
}) {
  if (!data.customerEmail) return false

  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">${item.name}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right;">GH₵ ${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('')

  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#1f2937;">Order Confirmed! 🎉</h2>
    <p style="margin:0 0 24px;color:#6b7280;">Hi ${data.customerName}, thank you for your order.</p>
    
    <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:14px;color:#6b7280;">Order Number</p>
      <p style="margin:0;font-size:18px;font-weight:bold;color:#1f2937;">${data.orderNumber}</p>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="border-bottom:2px solid #e5e7eb;">
          <th style="text-align:left;padding:8px 0;">Item</th>
          <th style="text-align:center;padding:8px 0;">Qty</th>
          <th style="text-align:right;padding:8px 0;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div style="margin-top:16px;padding-top:16px;border-top:2px solid #e5e7eb;text-align:right;">
      <p style="margin:0;font-size:18px;font-weight:bold;color:#1f2937;">Total: GH₵ ${data.total.toFixed(2)}</p>
      <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Payment: ${data.paymentMethod}</p>
    </div>

    <p style="margin:24px 0 0;font-size:14px;color:#6b7280;">
      We'll notify you when your order ships. Track your order from your account.
    </p>
  `)

  return sendEmail(data.customerEmail, `Order Confirmed — ${data.orderNumber}`, html)
}

export async function sendShippingNotification(data: {
  customerEmail: string
  customerName: string
  orderNumber: string
  trackingNumber?: string
}) {
  if (!data.customerEmail) return false

  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#1f2937;">Your Order Has Shipped! 🚚</h2>
    <p style="margin:0 0 24px;color:#6b7280;">Hi ${data.customerName}, great news — your order is on its way!</p>
    
    <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:14px;color:#6b7280;">Order Number</p>
      <p style="margin:0;font-size:16px;font-weight:bold;color:#1f2937;">${data.orderNumber}</p>
      ${data.trackingNumber ? `
        <p style="margin:12px 0 4px;font-size:14px;color:#6b7280;">Tracking Number</p>
        <p style="margin:0;font-size:16px;font-weight:bold;color:#1f2937;">${data.trackingNumber}</p>
      ` : ''}
    </div>

    <p style="margin:0;font-size:14px;color:#6b7280;">
      Your package should arrive within 2-5 business days. We'll let you know when it's delivered.
    </p>
  `)

  return sendEmail(data.customerEmail, `Your Order Is On Its Way — ${data.orderNumber}`, html)
}

export async function sendDeliveryConfirmation(data: {
  customerEmail: string
  customerName: string
  orderNumber: string
}) {
  if (!data.customerEmail) return false

  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#1f2937;">Order Delivered! 🎉</h2>
    <p style="margin:0 0 24px;color:#6b7280;">Hi ${data.customerName}, your order has been delivered.</p>
    
    <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:14px;color:#6b7280;">Order Number</p>
      <p style="margin:0;font-size:16px;font-weight:bold;color:#1f2937;">${data.orderNumber}</p>
    </div>

    <p style="margin:0 0 16px;font-size:14px;color:#6b7280;">
      We hope you love your new hair! Leave us a review to help other customers.
    </p>

    <div style="text-align:center;padding:16px;background:#f0fdf4;border-radius:12px;">
      <p style="margin:0;font-size:14px;font-weight:bold;color:#166534;">How was your experience?</p>
      <p style="margin:8px 0 0;font-size:28px;">⭐⭐⭐⭐⭐</p>
    </div>
  `)

  return sendEmail(data.customerEmail, `Order Delivered — ${data.orderNumber}`, html)
}

// ============ Welcome Email ============

export async function sendWelcomeEmail(data: {
  email: string
  name: string
}) {
  if (!data.email) return false

  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#7c3aed,#a78bfa);border-radius:16px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">🎉</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:24px;color:#1f2937;">Welcome to ${STORE_NAME}!</h2>
      <p style="margin:0;font-size:15px;color:#6b7280;">We're thrilled to have you join our family, ${data.name || 'there'}.</p>
    </div>

    <div style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-radius:16px;padding:24px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">Your exclusive welcome offer</p>
      <p style="margin:0;font-size:32px;font-weight:bold;color:#7c3aed;">10% OFF</p>
      <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">Use code <strong style="color:#1f2937;">WELCOME10</strong> on your first order</p>
    </div>

    <div style="margin-bottom:24px;">
      <h3 style="margin:0 0 12px;font-size:16px;color:#1f2937;">Why shop with us?</h3>
      <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center;">
        <span style="font-size:16px;">✅</span>
        <span style="font-size:14px;color:#4b5563;">100% authentic, premium quality products</span>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center;">
        <span style="font-size:16px;">✅</span>
        <span style="font-size:14px;color:#4b5563;">Fast delivery across Ghana</span>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center;">
        <span style="font-size:16px;">✅</span>
        <span style="font-size:14px;color:#4b5563;">24/7 customer support via WhatsApp</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <span style="font-size:16px;">✅</span>
        <span style="font-size:14px;color:#4b5563;">Easy returns within 7 days</span>
      </div>
    </div>

    <div style="text-align:center;margin-top:32px;">
      <a href="${process.env.BETTER_AUTH_URL || 'https://gotinova.vercel.app'}/products" style="display:inline-block;padding:14px 32px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:15px;">
        Start Shopping →
      </a>
    </div>

    <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
      Questions? Reply to this email or WhatsApp us at +233 24 959 5624
    </p>
  `)

  return sendEmail(data.email, `Welcome to ${STORE_NAME}! 🎉 Here's 10% off your first order`, html)
}

// ============ Campaign Email ============

export async function sendCampaignEmail(data: {
  to: string
  subject: string
  heading: string
  body: string
  ctaText?: string
  ctaUrl?: string
}) {
  if (!data.to) return false

  const ctaHtml = data.ctaText && data.ctaUrl ? `
    <div style="text-align:center;margin-top:24px;">
      <a href="${data.ctaUrl}" style="display:inline-block;padding:14px 32px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:15px;">
        ${data.ctaText}
      </a>
    </div>
  ` : ''

  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;font-size:22px;color:#1f2937;">${data.heading}</h2>
    <div style="font-size:15px;color:#4b5563;line-height:1.7;">
      ${data.body.replace(/\n/g, '<br/>')}
    </div>
    ${ctaHtml}
  `)

  return sendEmail(data.to, data.subject, html)
}
