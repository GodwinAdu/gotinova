'use client'

/**
 * Product Comparison — stored in localStorage
 * Max 3 products at a time.
 */

export interface CompareProduct {
  id: string
  name: string
  price: string | number
  originalPrice?: string | number | null
  image: string | null
  rating: string | number | null
  description?: string | null
}

const STORAGE_KEY = 'luxehair-compare'
const MAX_ITEMS = 3

export function getCompareList(): CompareProduct[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function addToCompare(product: CompareProduct): boolean {
  const list = getCompareList()
  if (list.length >= MAX_ITEMS) return false
  if (list.find(p => p.id === product.id)) return false
  list.push(product)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  window.dispatchEvent(new CustomEvent('compare-change'))
  return true
}

export function removeFromCompare(productId: string) {
  const list = getCompareList().filter(p => p.id !== productId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  window.dispatchEvent(new CustomEvent('compare-change'))
}

export function isInCompare(productId: string): boolean {
  return getCompareList().some(p => p.id === productId)
}

export function clearCompare() {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('compare-change'))
}
