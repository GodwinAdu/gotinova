'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2, Plus, X, Info, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ImageUpload } from '@/components/image-upload'
import { ConfirmDialog } from '@/components/confirm-dialog'
import Link from 'next/link'
import { updateProduct, deleteProduct } from '@/app/actions/admin'
import { getProductById, getCategories } from '@/app/actions/products'

interface Category {
  id: string
  name: string
}

interface UploadedImage {
  id: string
  url: string
  name: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [stock, setStock] = useState('')
  const [sku, setSku] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [images, setImages] = useState<UploadedImage[]>([])

  useEffect(() => {
    loadProduct()
  }, [productId])

  const loadProduct = async () => {
    setLoading(true)
    try {
      const [product, categoriesResult] = await Promise.all([
        getProductById(productId),
        getCategories(),
      ])

      if (categoriesResult.success && categoriesResult.data) {
        setCategories(categoriesResult.data)
      }

      if (product) {
        setName(product.name || '')
        setDescription(product.description || '')
        setPrice(product.price?.toString() || '')
        setOriginalPrice(product.originalPrice?.toString() || '')
        setCategoryId(product.categoryId || '')
        setStock(product.stock?.toString() || '')
        setSku(product.sku || '')
        setIsActive(product.isActive !== false)
        if (product.image) {
          setImages([{ id: 'existing-1', url: product.image, name: 'Current image' }])
        }
      }
    } catch (err) {
      setError('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name || !price || !categoryId || !stock) {
      setError('Name, price, category, and stock are required')
      return
    }

    setSaving(true)
    try {
      const mainImage = images.length > 0 ? images[0].url : undefined

      const result = await updateProduct(productId, {
        name,
        description,
        price: price,
        originalPrice: originalPrice || null,
        categoryId,
        stock: parseInt(stock),
        sku: sku || null,
        isActive,
        image: mainImage || null,
      })

      if (result.success) {
        setSuccess('Product updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Failed to update')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    const result = await deleteProduct(productId)
    if (result.success) {
      router.push('/admin/products')
    } else {
      setError(result.error || 'Failed to delete')
    }
    setDeleting(false)
    setShowDelete(false)
  }

  const discount = price && originalPrice
    ? Math.round((1 - parseFloat(price) / parseFloat(originalPrice)) * 100)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button variant="ghost" size="sm" className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold">Edit Product</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDelete(true)}
            className="rounded-xl text-destructive hover:text-destructive gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm" className="rounded-xl gap-1">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save
          </Button>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-700 dark:text-emerald-300 font-medium">
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Basic Info */}
            <Card className="p-5 rounded-2xl space-y-4">
              <h2 className="text-base font-semibold">Product Information</h2>

              <div>
                <label className="block text-sm font-medium mb-1.5">Product Name *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product description..."
                  className="w-full px-3.5 py-2.5 border border-input rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all min-h-[100px] resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">SKU</label>
                <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. BRZ-BW-22-BLK" />
              </div>
            </Card>

            {/* Pricing */}
            <Card className="p-5 rounded-2xl space-y-4">
              <h2 className="text-base font-semibold">Pricing & Inventory</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Selling Price (GH₵) *</label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" required min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Compare-at Price
                    {discount > 0 && <Badge variant="destructive" className="ml-2 text-[10px]">-{discount}%</Badge>}
                  </label>
                  <Input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="Original price" min="0" step="0.01" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Stock *</label>
                  <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" required min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Status</label>
                  <select
                    value={isActive ? 'active' : 'draft'}
                    onChange={(e) => setIsActive(e.target.value === 'active')}
                    className="w-full h-10 px-3.5 border border-input rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                  >
                    <option value="active">Active (visible)</option>
                    <option value="draft">Draft (hidden)</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Images */}
            <Card className="p-5 rounded-2xl space-y-4">
              <h2 className="text-base font-semibold">Images</h2>
              <ImageUpload
                value={images}
                onChange={setImages}
                endpoint="productImage"
                maxFiles={5}
                maxSize={16 * 1024 * 1024}
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Category */}
            <Card className="p-5 rounded-2xl space-y-3">
              <h2 className="text-base font-semibold">Category *</h2>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 px-3.5 border border-input rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </Card>

            {/* Preview */}
            <Card className="p-5 rounded-2xl space-y-3">
              <h2 className="text-base font-semibold">Preview</h2>
              <div className="border border-border rounded-xl p-3 space-y-2">
                {images.length > 0 ? (
                  <div className="aspect-square rounded-lg bg-muted overflow-hidden">
                    <img src={images[0].url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">No image</div>
                )}
                <p className="text-sm font-medium line-clamp-2">{name || 'Product name'}</p>
                <div className="flex items-baseline gap-2">
                  {price && <span className="text-sm font-bold">GH₵ {parseFloat(price || '0').toFixed(2)}</span>}
                  {originalPrice && <span className="text-xs text-muted-foreground line-through">GH₵ {parseFloat(originalPrice).toFixed(2)}</span>}
                </div>
                <p className="text-[11px] text-muted-foreground">{stock || 0} in stock • {isActive ? 'Active' : 'Draft'}</p>
              </div>
            </Card>

            {/* Save (mobile) */}
            <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl lg:hidden" size="lg">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>
      </form>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={showDelete}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        title="Delete Product"
        description="This will permanently remove this product from your store. This cannot be undone."
        confirmLabel="Delete Product"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
