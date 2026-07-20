import { STORE_WHATSAPP_NUMBER, APP_NAME } from '@/lib/constants'
import { formatPrice } from './format'

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface WhatsAppOrderData {
  orderNumber: string
  customerName: string
  items: OrderItem[]
  total: number
  paymentMethod: string
  shippingAddress?: string
  city?: string
}

/**
 * Generate a WhatsApp message link for order confirmation
 * This opens WhatsApp with a pre-filled message to the store
 */
export function generateOrderWhatsAppLink(data: WhatsAppOrderData): string {
  const itemsList = data.items
    .map((item, i) => `${i + 1}. ${item.name} (x${item.quantity}) — ${formatPrice(item.price * item.quantity)}`)
    .join('\n')

  const message = `🛍️ *New Order from ${APP_NAME}*

📋 *Order:* ${data.orderNumber}
👤 *Customer:* ${data.customerName}

*Items:*
${itemsList}

💰 *Total:* ${formatPrice(data.total)}
💳 *Payment:* ${data.paymentMethod}
📍 *City:* ${data.city || 'N/A'}

Please confirm my order. Thank you! 🙏`

  const encoded = encodeURIComponent(message)
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encoded}`
}

/**
 * Generate a WhatsApp link for general inquiries
 */
export function generateWhatsAppLink(message?: string): string {
  if (message) {
    return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  }
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}`
}

/**
 * Generate WhatsApp link for order status inquiry
 */
export function generateOrderInquiryLink(orderNumber: string): string {
  const message = `Hi ${APP_NAME}! 👋\n\nI'd like to check on the status of my order: *${orderNumber}*\n\nThank you!`
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

/**
 * Generate WhatsApp link for product inquiry
 */
export function generateProductInquiryLink(productName: string, productUrl: string): string {
  const message = `Hi ${APP_NAME}! 👋\n\nI'm interested in this product:\n*${productName}*\n${productUrl}\n\nCan you provide more details?`
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

/**
 * Admin: Generate WhatsApp link to notify customer about their order
 */
export function generateCustomerNotificationLink(
  customerPhone: string,
  orderNumber: string,
  status: string
): string {
  const statusMessages: Record<string, string> = {
    processing: `Your order *${orderNumber}* is now being processed! We'll let you know when it ships. 📦`,
    shipped: `Great news! Your order *${orderNumber}* has been shipped! 🚚 You'll receive it soon.`,
    delivered: `Your order *${orderNumber}* has been delivered! 🎉 We hope you love it. Please leave us a review!`,
  }

  const message = `Hi! This is ${APP_NAME}. 🌟\n\n${statusMessages[status] || `Update on your order *${orderNumber}*: Status changed to ${status}.`}\n\nThank you for shopping with us! 💕`

  // Clean phone number
  const phone = customerPhone.replace(/[\s\-\(\)\+]/g, '')
  const fullPhone = phone.startsWith('0') ? '233' + phone.slice(1) : phone

  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`
}
