'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Loader2, Save, Search, Package, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { getAllProducts, bulkUpdateStock } from '@/app/actions/admin'
import { formatPrice } from '@/lib/utils/format'

interface Product {
  id: string
  name: string
  price: string
  stock: number
  sku: string | null
  isActive: boolean | null
}

interface StockChange {
  productId: string
  originalStock: number
  newStock: number
}

export default function BulkStockPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [changes, setChanges] = useState<Map<string, number>>(new Map())
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const result = await getAllProducts(200)
      if (result.success && result.data) {
        setProducts(result.data as Product[])
      }
    } catch (err) {
      console.error('Failed to load products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStockChange = (productId: string, value: string) => {
    const num = parseInt(value)
    if (isNaN(num) || num < 0) return

    const newChanges = new Map(changes)
    const product = products.find(p => p.id === productId)
    if (product && num !== product.stock) {
      newChanges.set(productId, num)
    } else {
      newChanges.delete(productId)
    }
    setChanges(newChanges)
  }

  const handleSave = async () => {
    if (changes.size === 0) return

    setSaving(true)
    setMessage(null)

    const updates = Array.from(changes.entries()).map(([productId, stock]) => ({
      productId,
      stock,
    }))

    try {
      const result = await bulkUpdateStock(updates)
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Stock updated!' })
        // Update local state
        setProducts(prev => prev.map(p => {
          const newStock = changes.get(p.id)
          return newStock !== undefined ? { ...p, stock: newStock } : p
        }))
        setChanges(new Map())
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update' })
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 4000)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const lowStockCount = products.filter(p => p.stock <= 5).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button variant="ghost" size="sm" className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Bulk Stock Update</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Update multiple product stock levels at once
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {changes.size > 0 && (
            <Badge variant="default" className="text-xs">
              {changes.size} change{changes.size > 1 ? 's' : ''}
            </Badge>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || changes.size === 0}
            className="rounded-xl gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' : 'bg-destructive/10 text-destructive'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="p-4 rounded-2xl">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Total Products</p>
              <p className="text-lg font-bold">{products.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 rounded-2xl">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xs text-muted-foreground">Low Stock</p>
              <p className="text-lg font-bold text-amber-600">{lowStockCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 rounded-2xl hidden sm:block">
          <div className="flex items-center gap-2">
            <Save className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Pending Changes</p>
              <p className="text-lg font-bold">{changes.size}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by product name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Product Stock Table */}
      <Card className="rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Product</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">SKU</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Current Stock</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">New Stock</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const hasChange = changes.has(product.id)
                const newStock = changes.get(product.id)

                return (
                  <tr
                    key={product.id}
                    className={`border-b border-border transition-colors ${
                      hasChange ? 'bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm truncate max-w-[200px]">{product.name}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      {product.sku || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={product.stock === 0 ? 'destructive' : product.stock <= 5 ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {product.stock}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <Input
                          type="number"
                          min="0"
                          defaultValue={product.stock}
                          onChange={(e) => handleStockChange(product.id, e.target.value)}
                          className={`w-20 h-8 text-center text-sm rounded-lg ${
                            hasChange ? 'border-primary ring-1 ring-primary/20' : ''
                          }`}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No products found</p>
          </div>
        )}
      </Card>

      {/* Floating save button on mobile */}
      {changes.size > 0 && (
        <div className="fixed bottom-6 left-4 right-4 sm:hidden z-40">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 rounded-xl shadow-lg gap-2"
            size="lg"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save {changes.size} Change{changes.size > 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  )
}
