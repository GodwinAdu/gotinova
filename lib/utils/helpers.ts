/**
 * Utility functions for the Hair & Wig E-commerce platform
 */

/**
 * Format currency to PKR
 */
export function formatCurrency(amount: number): string {
  return `PKR ${amount.toLocaleString('en-PK', {
    maximumFractionDigits: 0,
  })}`
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(originalPrice: number, salePrice: number): number {
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}

/**
 * Generate order number
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD-${timestamp}${random}`
}

/**
 * Generate tracking number
 */
export function generateTrackingNumber(): string {
  const prefix = 'TRK'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (Pakistani format)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+92|0)?[0-9]{10}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Generate slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
}

/**
 * Truncate text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Calculate shipping cost based on weight/distance
 */
export function calculateShippingCost(weight: number = 1, city: string = 'Karachi'): number {
  const baseRate = 200
  const perKgRate = 100
  const baseCost = baseRate + weight * perKgRate

  // Different rates for different cities
  const cityMultipliers: Record<string, number> = {
    'Karachi': 1,
    'Lahore': 1.2,
    'Islamabad': 1.3,
    'Peshawar': 1.5,
    'Multan': 1.4,
  }

  const multiplier = cityMultipliers[city] || 1.5

  return Math.round(baseCost * multiplier)
}

/**
 * Calculate tax on amount
 */
export function calculateTax(amount: number, taxRate: number = 0.17): number {
  return Math.round(amount * taxRate)
}

/**
 * Calculate total with tax and shipping
 */
export function calculateTotal(
  subtotal: number,
  shippingCost: number = 500,
  taxRate: number = 0.17
): number {
  const tax = calculateTax(subtotal, taxRate)
  return subtotal + shippingCost + tax
}

/**
 * Get average rating from array of ratings
 */
export function getAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0
  const sum = ratings.reduce((a, b) => a + b, 0)
  return Math.round((sum / ratings.length) * 10) / 10
}

/**
 * Mask credit card number
 */
export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '')
  const last4 = cleaned.slice(-4)
  return `**** **** **** ${last4}`
}

/**
 * Delay execution (for debouncing/throttling)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Parse query string
 */
export function parseQueryString(qs: string): Record<string, string> {
  const params = new URLSearchParams(qs)
  const result: Record<string, string> = {}
  params.forEach((value, key) => {
    result[key] = value
  })
  return result
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

/**
 * Array chunk helper
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * Unique array elements
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    if (!result[groupKey]) result[groupKey] = []
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}
