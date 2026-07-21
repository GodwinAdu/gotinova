'use server'

import { db } from '@/lib/db'
import { analytics } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { adminUsers } from '@/lib/db/schema'
import { and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { v4 as uuid } from 'uuid'

const SETTINGS_DATE = '1900-01-01'

async function verifyAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const admin = await db.select().from(adminUsers).where(and(eq(adminUsers.userId, session.user.id), eq(adminUsers.isActive, true)))
  if (!admin.length) throw new Error('Not authorized as admin')
}

// ============ Types ============

export interface BundleDeal {
  minQty: number
  discount: number
  label: string
  enabled: boolean
}

export interface StoreSettings {
  // Store Info
  storeName: string
  storeEmail: string
  storePhone: string
  whatsappNumber: string
  storeAddress: string

  // Pricing
  taxRate: number // percentage e.g. 12.5
  shippingCost: number // flat rate in GHS
  freeShippingThreshold: number // free above this amount

  // Loyalty Points
  loyaltyEnabled: boolean
  pointsPerCedi: number // e.g. 0.1 = 1 point per GH₵ 10
  pointsValue: number // GH₵ value of 1 point e.g. 0.1

  // Reviews
  autoApproveReviews: boolean

  // Flash Sale
  flashSaleEnabled: boolean
  flashSaleEndDate: string | null

  // Bundle Deals
  bundleDeals: BundleDeal[]
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'GotiNova',
  storeEmail: 'achaempomaatina352@gmail.com',
  storePhone: '+233 24 959 5624',
  whatsappNumber: '233249595624',
  storeAddress: 'Kumasi, Ghana',
  taxRate: 12.5,
  shippingCost: 50,
  freeShippingThreshold: 1000,
  loyaltyEnabled: true,
  pointsPerCedi: 0.1,
  pointsValue: 0.1,
  autoApproveReviews: true,
  flashSaleEnabled: true,
  flashSaleEndDate: null,
  bundleDeals: [
    { minQty: 2, discount: 5, label: 'Buy 2, Get 5% Off', enabled: true },
    { minQty: 3, discount: 10, label: 'Buy 3, Get 10% Off', enabled: true },
    { minQty: 5, discount: 15, label: 'Buy 5, Get 15% Off', enabled: true },
  ],
}

// ============ Core CRUD ============

async function getRawSettings(): Promise<any> {
  try {
    const result = await db.select().from(analytics).where(eq(analytics.date, SETTINGS_DATE))
    if (result.length > 0 && result[0].data) {
      return JSON.parse(result[0].data)
    }
    return {}
  } catch {
    return {}
  }
}

async function saveRawSettings(data: any): Promise<void> {
  const existing = await db.select().from(analytics).where(eq(analytics.date, SETTINGS_DATE))
  if (existing.length > 0) {
    await db.update(analytics).set({ data: JSON.stringify(data) }).where(eq(analytics.date, SETTINGS_DATE))
  } else {
    await db.insert(analytics).values({ id: uuid(), date: SETTINGS_DATE, data: JSON.stringify(data) })
  }
}

// ============ Public API ============

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const raw = await getRawSettings()
    return { ...DEFAULT_SETTINGS, ...raw }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export async function saveStoreSettings(settings: Partial<StoreSettings>) {
  try {
    await verifyAdmin()
    const current = await getRawSettings()
    const updated = { ...current, ...settings }
    await saveRawSettings(updated)
    return { success: true, message: 'Settings saved successfully' }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to save settings' }
  }
}

// ============ Convenience Getters (for non-admin pages) ============

export async function getBundleDealsConfig(): Promise<BundleDeal[]> {
  const settings = await getStoreSettings()
  return settings.bundleDeals
}

export async function saveBundleDealsConfig(deals: BundleDeal[]) {
  return saveStoreSettings({ bundleDeals: deals })
}

export async function getFlashSaleConfig(): Promise<{ enabled: boolean; endDate: string | null }> {
  const settings = await getStoreSettings()
  return { enabled: settings.flashSaleEnabled, endDate: settings.flashSaleEndDate }
}

export async function saveFlashSaleConfig(config: { enabled: boolean; endDate: string | null }) {
  return saveStoreSettings({ flashSaleEnabled: config.enabled, flashSaleEndDate: config.endDate })
}

export async function getShippingConfig(): Promise<{ cost: number; freeThreshold: number }> {
  const settings = await getStoreSettings()
  return { cost: settings.shippingCost, freeThreshold: settings.freeShippingThreshold }
}

export async function getTaxRate(): Promise<number> {
  const settings = await getStoreSettings()
  return settings.taxRate / 100 // return as decimal (0.125)
}

export async function getLoyaltyConfig(): Promise<{ enabled: boolean; pointsPerCedi: number; pointsValue: number }> {
  const settings = await getStoreSettings()
  return { enabled: settings.loyaltyEnabled, pointsPerCedi: settings.pointsPerCedi, pointsValue: settings.pointsValue }
}

export async function getReviewConfig(): Promise<{ autoApprove: boolean }> {
  const settings = await getStoreSettings()
  return { autoApprove: settings.autoApproveReviews }
}
