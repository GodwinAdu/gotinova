'use client'

/**
 * Recently Viewed Products — stored in localStorage
 * Max 12 items, newest first, no duplicates
 */

export interface RecentProduct {
  id: string
  name: string
  price: string | number
  image: string | null
  viewedAt: number
}

const STORAGE_KEY = 'gotinova-recently-viewed'
const MAX_ITEMS = 12

export function getRecentlyViewed(): RecentProduct[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored) as RecentProduct[]
  } catch {
    return []
  }
}

export function addToRecentlyViewed(product: Omit<RecentProduct, 'viewedAt'>): void {
  if (typeof window === 'undefined') return
  try {
    const items = getRecentlyViewed()
    // Remove existing entry for this product
    const filtered = items.filter((p) => p.id !== product.id)
    // Add to front
    const updated = [{ ...product, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Silently fail if localStorage is full
  }
}

export function clearRecentlyViewed(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
