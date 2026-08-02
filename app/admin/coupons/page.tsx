'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Loader2, Tag, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils/format'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface Coupon {
  id: string
  code: string
  description: string | null
  discountType: string
  discountValue: string
  maxUses: number | null
  currentUses: number | null
  minOrderAmount: string | null
  validFrom: string | null
  validTo: string | null
  isActive: boolean | null
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  // Create form state
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [minOrderAmount, setMinOrderAmount] = useState('')
  const [validFrom, setValidFrom] = useState('')
  const [validTo, setValidTo] = useState('')
  const [error, setError] = useState('')

  const loadCoupons = async () => {
    try {
      const { getAllCoupons } = await import('@/app/actions/admin-coupons')
      const result = await getAllCoupons()
      if (result.success && result.data) {
        setCoupons(result.data)
      }
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCoupons() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!code.trim() || !discountValue) {
      setError('Code and discount value are required')
      return
    }

    try {
      setCreating(true)
      const { createCouponAction } = await import('@/app/actions/admin-coupons')
      const result = await createCouponAction({
        code: code.trim().toUpperCase(),
        description: description.trim() || null,
        discountType,
        discountValue: parseFloat(discountValue),
        maxUses: maxUses ? parseInt(maxUses) : null,
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        validFrom: validFrom || null,
        validTo: validTo || null,
      })

      if (result.success) {
        setShowCreate(false)
        resetForm()
        loadCoupons()
      } else {
        setError(result.error || 'Failed to create coupon')
      }
    } catch {
      setError('An error occurred')
    } finally {
      setCreating(false)
    }
  }

  const handleToggle = async (couponId: string, isActive: boolean) => {
    const { toggleCouponStatus } = await import('@/app/actions/admin-coupons')
    await toggleCouponStatus(couponId, !isActive)
    loadCoupons()
  }

  const handleDelete = async (couponId: string) => {
    const { deleteCouponAction } = await import('@/app/actions/admin-coupons')
    await deleteCouponAction(couponId)
    setDeleteTarget(null)
    loadCoupons()
  }

  const resetForm = () => {
    setCode('')
    setDescription('')
    setDiscountType('percentage')
    setDiscountValue('')
    setMaxUses('')
    setMinOrderAmount('')
    setValidFrom('')
    setValidTo('')
    setError('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Coupons</h1>
          <p className="text-sm text-muted-foreground mt-1">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" />
          Create Coupon
        </Button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card className="p-5 space-y-4">
          <h2 className="font-semibold">New Coupon</h2>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Code</label>
                <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SAVE20" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="20% off all orders" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                  className="w-full h-10 px-3 border border-input rounded-xl bg-background text-sm"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (GH₵)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Discount Value {discountType === 'percentage' ? '(%)' : '(GH₵)'}
                </label>
                <Input type="number" step="0.01" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Min Order (GH₵, optional)</label>
                <Input type="number" step="0.01" value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Max Uses (optional)</label>
                <Input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Unlimited" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Valid From (optional)</label>
                <Input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Valid To (optional)</label>
                <Input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={creating} className="rounded-xl gap-2">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
                Create
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setShowCreate(false); resetForm() }} className="rounded-xl">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Coupon List */}
      <div className="space-y-3">
        {coupons.length === 0 ? (
          <Card className="p-10 text-center">
            <Tag className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">No coupons yet. Create one to get started.</p>
          </Card>
        ) : (
          coupons.map((coupon) => (
            <Card key={coupon.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm font-mono">{coupon.code}</span>
                  <Badge variant={coupon.isActive ? 'default' : 'secondary'} className="text-[10px]">
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {coupon.discountType === 'percentage' ? (
                    <Badge variant="outline" className="text-[10px]">{parseFloat(coupon.discountValue)}% off</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">{formatPrice(parseFloat(coupon.discountValue))} off</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {coupon.description || 'No description'}
                  {coupon.minOrderAmount && ` • Min order: ${formatPrice(parseFloat(coupon.minOrderAmount))}`}
                  {coupon.maxUses && ` • Used: ${coupon.currentUses || 0}/${coupon.maxUses}`}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleToggle(coupon.id, coupon.isActive ?? false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title={coupon.isActive ? 'Deactivate' : 'Activate'}
                >
                  {coupon.isActive ? (
                    <ToggleRight className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                <button
                  onClick={() => setDeleteTarget(coupon.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete Coupon"
        description="This coupon will be permanently deleted. This action cannot be undone."
      />
    </div>
  )
}
