import nodemailer from 'nodemailer'

/**
 * Inventory Alert System
 * 
 * Sends email to admin when a product's stock reaches 0 or below a threshold.
 * Called after order creation (when stock is decremented).
 * 
 * Uses the same SMTP config as the main email system.
 */

const STORE_NAME = 'GotiNova'
const ADMIN_EMAIL = process.env.ADMIN_ALERT_EMAIL || process.env.SMTP_USER || ''

function createTransporter() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) return null

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

export async function sendLowStockAlert(products: Array<{
  name: string
  sku: string | null
  stock: number
}>) {
  if (!ADMIN_EMAIL || products.length === 0) return

  const transporter = createTransporter()
  if (!transporter) {
    console.log('[Inventory Alert] SMTP not configured — skipping alert')
    return
  }

  const productRows = products.map(p => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">${p.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:center;">${p.sku || '—'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:center;color:${p.stock === 0 ? '#dc2626' : '#d97706'};font-weight:bold;">
        ${p.stock === 0 ? 'OUT OF STOCK' : `${p.stock} left`}
      </td>
    </tr>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
    <div style="max-width:600px;margin:0 auto;padding:20px;">
      <div style="padding:24px 0;border-bottom:1px solid #e5e7eb;">
        <h1 style="margin:0;font-size:20px;color:#1f2937;">⚠️ ${STORE_NAME} — Inventory Alert</h1>
      </div>
      <div style="padding:24px 0;">
        <p style="margin:0 0 16px;color:#4b5563;">
          The following products need attention — stock is critically low or out:
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;border:1px solid #e5e7eb;border-radius:8px;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #e5e7eb;">Product</th>
              <th style="padding:10px 12px;text-align:center;border-bottom:2px solid #e5e7eb;">SKU</th>
              <th style="padding:10px 12px;text-align:center;border-bottom:2px solid #e5e7eb;">Stock</th>
            </tr>
          </thead>
          <tbody>${productRows}</tbody>
        </table>
        <p style="margin:24px 0 0;font-size:14px;color:#6b7280;">
          Please restock these items or mark them as inactive in the admin panel.
        </p>
        <p style="margin:16px 0 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/products/stock" 
             style="display:inline-block;padding:10px 20px;background:#8b5cf6;color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">
            Manage Inventory →
          </a>
        </p>
      </div>
      <div style="padding:16px 0;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;">
        Sent by ${STORE_NAME} Inventory System
      </div>
    </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `${STORE_NAME} <${process.env.SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `⚠️ Low Stock Alert — ${products.length} product${products.length > 1 ? 's' : ''} need attention`,
      html,
    })
    console.log(`[Inventory Alert] Sent to ${ADMIN_EMAIL} for ${products.length} products`)
  } catch (error) {
    console.error('[Inventory Alert] Failed to send:', error)
  }
}

/**
 * Check stock levels after an order and send alert if any are low.
 * Call this after order items are created.
 */
export async function checkAndAlertLowStock(productIds: string[]) {
  try {
    const { db } = await import('@/lib/db')
    const { products } = await import('@/lib/db/schema')
    const { inArray } = await import('drizzle-orm')

    const result = await db
      .select({ name: products.name, sku: products.sku, stock: products.stock })
      .from(products)
      .where(inArray(products.id, productIds))

    const lowStock = result.filter(p => p.stock <= 3)

    if (lowStock.length > 0) {
      await sendLowStockAlert(lowStock)
    }
  } catch (error) {
    console.error('[Inventory Alert] Check failed:', error)
  }
}
