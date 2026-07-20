'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save, Plus, Trash2, Package, Flame, Settings, Store, CreditCard, Star, Gift, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  getStoreSettings,
  saveStoreSettings,
  type StoreSettings,
  type BundleDeal,
} from '@/app/actions/settings'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [settings, setSettings] = useState<StoreSettings | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await getStoreSettings()
      setSettings(data)
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    setMessage(null)
    const result = await saveStoreSettings(settings)
    setMessage(result.success
      ? { type: 'success', text: 'All settings saved!' }
      : { type: 'error', text: result.error || 'Failed to save' }
    )
    setSaving(false)
    setTimeout(() => setMessage(null), 4000)
  }

  const updateField = (field: keyof StoreSettings, value: any) => {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
  }

  const addBundleTier = () => {
    if (!settings) return
    const deals = [...settings.bundleDeals]
    const maxQty = deals.length > 0 ? Math.max(...deals.map(d => d.minQty)) : 1
    deals.push({ minQty: maxQty + 2, discount: 5, label: `Buy ${maxQty + 2}, Get 5% Off`, enabled: true })
    updateField('bundleDeals', deals)
  }

  const updateBundleDeal = (index: number, field: keyof BundleDeal, value: any) => {
    if (!settings) return
    const deals = [...settings.bundleDeals]
    deals[index] = { ...deals[index], [field]: value }
    if (field === 'minQty' || field === 'discount') {
      deals[index].label = `Buy ${deals[index].minQty}, Get ${deals[index].discount}% Off`
    }
    updateField('bundleDeals', deals)
  }

  const removeBundleDeal = (index: number) => {
    if (!settings) return
    updateField('bundleDeals', settings.bundleDeals.filter((_, i) => i !== index))
  }

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold">Store Settings</h1>
        </div>
        <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All
        </Button>
      </div>

      {/* Message */}
      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' : 'bg-destructive/10 text-destructive'
        }`}>
          {message.text}
        </div>
      )}

      {/* Store Information */}
      <Card className="rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Store Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Store Name</label>
            <Input value={settings.storeName} onChange={(e) => updateField('storeName', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <Input value={settings.storeEmail} onChange={(e) => updateField('storeEmail', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Phone</label>
            <Input value={settings.storePhone} onChange={(e) => updateField('storePhone', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">WhatsApp Number</label>
            <Input value={settings.whatsappNumber} onChange={(e) => updateField('whatsappNumber', e.target.value)} placeholder="233201234567" />
            <p className="text-[10px] text-muted-foreground mt-1">Country code + number, no spaces or +</p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1.5">Address</label>
            <Input value={settings.storeAddress} onChange={(e) => updateField('storeAddress', e.target.value)} />
          </div>
        </div>
      </Card>

      {/* Pricing & Tax */}
      <Card className="rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Pricing & Shipping</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Tax Rate (%)</label>
            <Input type="number" value={settings.taxRate} onChange={(e) => updateField('taxRate', parseFloat(e.target.value) || 0)} min="0" max="50" step="0.5" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Shipping Cost (GH₵)</label>
            <Input type="number" value={settings.shippingCost} onChange={(e) => updateField('shippingCost', parseFloat(e.target.value) || 0)} min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Free Shipping Above (GH₵)</label>
            <Input type="number" value={settings.freeShippingThreshold} onChange={(e) => updateField('freeShippingThreshold', parseFloat(e.target.value) || 0)} min="0" />
          </div>
        </div>
      </Card>

      {/* Loyalty Points */}
      <Card className="rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Loyalty Points</h2>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={settings.loyaltyEnabled} onChange={(e) => updateField('loyaltyEnabled', e.target.checked)} className="w-4 h-4 accent-primary rounded" />
            <span className="text-sm">Enabled</span>
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Points per GH₵ 1 spent</label>
            <Input type="number" value={settings.pointsPerCedi} onChange={(e) => updateField('pointsPerCedi', parseFloat(e.target.value) || 0)} min="0" step="0.01" />
            <p className="text-[10px] text-muted-foreground mt-1">e.g. 0.1 = 1 point per GH₵ 10</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">GH₵ value per point</label>
            <Input type="number" value={settings.pointsValue} onChange={(e) => updateField('pointsValue', parseFloat(e.target.value) || 0)} min="0" step="0.01" />
            <p className="text-[10px] text-muted-foreground mt-1">e.g. 0.1 = 100 points = GH₵ 10</p>
          </div>
        </div>
      </Card>

      {/* Reviews */}
      <Card className="rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Reviews</h2>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={settings.autoApproveReviews} onChange={(e) => updateField('autoApproveReviews', e.target.checked)} className="w-4 h-4 accent-primary rounded" />
          <div>
            <span className="text-sm font-medium">Auto-approve customer reviews</span>
            <p className="text-[11px] text-muted-foreground">When disabled, reviews go to &quot;pending&quot; and require manual approval</p>
          </div>
        </label>
      </Card>

      {/* Flash Sale */}
      <Card className="rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-destructive" />
            <h2 className="text-lg font-semibold">Flash Sale</h2>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={settings.flashSaleEnabled} onChange={(e) => updateField('flashSaleEnabled', e.target.checked)} className="w-4 h-4 accent-primary rounded" />
            <span className="text-sm">Enabled</span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Sale End Date</label>
          <Input type="datetime-local" value={settings.flashSaleEndDate || ''} onChange={(e) => updateField('flashSaleEndDate', e.target.value || null)} className="max-w-xs" />
          <p className="text-[10px] text-muted-foreground mt-1">Leave empty for a rolling 24-hour countdown</p>
        </div>
      </Card>

      {/* Bundle Deals */}
      <Card className="rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Bundle Deals</h2>
          </div>
          <Button onClick={addBundleTier} variant="outline" size="sm" className="rounded-xl gap-1">
            <Plus className="w-3.5 h-3.5" />
            Add Tier
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Automatic quantity discounts applied in the cart.</p>

        {settings.bundleDeals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No bundle deals. Click &quot;Add Tier&quot; to create one.</p>
        ) : (
          <div className="space-y-2">
            {settings.bundleDeals.map((deal, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <input type="checkbox" checked={deal.enabled} onChange={(e) => updateBundleDeal(index, 'enabled', e.target.checked)} className="w-4 h-4 accent-primary rounded" />
                <span className="text-xs text-muted-foreground">Buy</span>
                <Input type="number" value={deal.minQty} onChange={(e) => updateBundleDeal(index, 'minQty', parseInt(e.target.value) || 2)} className="w-14 h-8 text-center text-sm" min="2" />
                <span className="text-xs text-muted-foreground">get</span>
                <Input type="number" value={deal.discount} onChange={(e) => updateBundleDeal(index, 'discount', parseInt(e.target.value) || 5)} className="w-14 h-8 text-center text-sm" min="1" max="50" />
                <span className="text-xs text-muted-foreground">% off</span>
                <Button onClick={() => removeBundleDeal(index)} variant="ghost" size="sm" className="ml-auto p-2 text-destructive hover:bg-destructive/10 rounded-lg">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Save button (bottom) */}
      <div className="flex justify-end pt-4 border-t border-border">
        <Button onClick={handleSave} disabled={saving} size="lg" className="rounded-xl gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All Settings
        </Button>
      </div>
    </div>
  )
}
