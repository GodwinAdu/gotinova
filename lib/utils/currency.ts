'use client'

/**
 * Multi-Currency Support with Live Exchange Rates
 * 
 * Uses the free ExchangeRate-API (https://www.exchangerate-api.com/)
 * Free tier: 1,500 requests/month — more than enough for caching.
 * 
 * Rates are fetched once and cached in localStorage for 6 hours.
 * Base currency is GHS (all DB prices stored in GHS).
 * Payments always processed in GHS via Paystack.
 */

export type CurrencyCode = 'GHS' | 'USD' | 'GBP' | 'EUR' | 'NGN'

export interface Currency {
  code: CurrencyCode
  symbol: string
  name: string
  flag: string
}

export const CURRENCIES: Currency[] = [
  { code: 'GHS', symbol: 'GH₵', name: 'Ghana Cedis', flag: '🇬🇭' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
]

// Fallback rates in case API fails (1 GHS = X)
const FALLBACK_RATES: Record<CurrencyCode, number> = {
  GHS: 1,
  USD: 0.065,
  GBP: 0.052,
  EUR: 0.060,
  NGN: 105,
}

const STORAGE_KEY = 'gotinova-currency'
const RATES_CACHE_KEY = 'gotinova-exchange-rates'
const CACHE_DURATION = 6 * 60 * 60 * 1000 // 6 hours

interface CachedRates {
  rates: Record<string, number>
  fetchedAt: number
}

// ============ Rate Fetching ============

function getCachedRates(): Record<string, number> | null {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem(RATES_CACHE_KEY)
    if (!cached) return null
    const parsed: CachedRates = JSON.parse(cached)
    // Check if cache is still fresh (< 6 hours old)
    if (Date.now() - parsed.fetchedAt < CACHE_DURATION) {
      return parsed.rates
    }
    return null
  } catch {
    return null
  }
}

function saveCachedRates(rates: Record<string, number>) {
  try {
    const data: CachedRates = { rates, fetchedAt: Date.now() }
    localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(data))
  } catch {}
}

/**
 * Fetch live exchange rates from ExchangeRate-API (free, no key required for open endpoint)
 * Uses GHS as the base currency.
 */
export async function fetchLiveRates(): Promise<Record<string, number>> {
  // Check cache first
  const cached = getCachedRates()
  if (cached) return cached

  try {
    // Free API — no key needed. 
    // Alternative with key: https://v6.exchangerate-api.com/v6/YOUR_KEY/latest/GHS
    const res = await fetch('https://open.er-api.com/v6/latest/GHS', {
      next: { revalidate: 21600 }, // Cache for 6 hours
    })

    if (!res.ok) throw new Error('API failed')

    const data = await res.json()

    if (data.result === 'success' && data.rates) {
      const rates: Record<string, number> = {
        GHS: 1,
        USD: data.rates.USD || FALLBACK_RATES.USD,
        GBP: data.rates.GBP || FALLBACK_RATES.GBP,
        EUR: data.rates.EUR || FALLBACK_RATES.EUR,
        NGN: data.rates.NGN || FALLBACK_RATES.NGN,
      }
      saveCachedRates(rates)
      return rates
    }

    throw new Error('Invalid response')
  } catch {
    // Return fallback rates if API fails
    return FALLBACK_RATES
  }
}

// ============ Currency Selection ============

export function getSelectedCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'GHS'
  return (localStorage.getItem(STORAGE_KEY) as CurrencyCode) || 'GHS'
}

export function setSelectedCurrency(code: CurrencyCode) {
  localStorage.setItem(STORAGE_KEY, code)
  window.dispatchEvent(new CustomEvent('currency-change', { detail: code }))
}

export function getCurrency(code: CurrencyCode): Currency {
  return CURRENCIES.find(c => c.code === code) || CURRENCIES[0]
}

// ============ Conversion & Formatting ============

/**
 * Convert GHS amount to the selected currency using cached rates.
 * Falls back to hardcoded rates if cache is empty.
 */
export function convertPrice(ghsAmount: number | string, toCurrency?: CurrencyCode): number {
  const amount = typeof ghsAmount === 'string' ? parseFloat(ghsAmount) : ghsAmount
  if (isNaN(amount)) return 0

  const code = toCurrency || getSelectedCurrency()
  if (code === 'GHS') return amount

  const cached = getCachedRates()
  const rate = cached?.[code] || FALLBACK_RATES[code] || 1
  return amount * rate
}

/**
 * Format price in the selected currency
 */
export function formatInCurrency(ghsAmount: number | string, currencyCode?: CurrencyCode): string {
  const code = currencyCode || getSelectedCurrency()
  const currency = getCurrency(code)
  const converted = convertPrice(ghsAmount, code)

  if (code === 'GHS') {
    return `GH₵ ${converted.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return `${currency.symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
