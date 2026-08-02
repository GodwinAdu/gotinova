'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ImageUpload, type UploadedImage } from '@/components/image-upload'
import Link from 'next/link'
import { updateProduct } from '@/app/actions/admin'
import { getCategories } from '@/app/actions/products'

interface Category {
  id: string
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
    const loadData = async () => {
      try {
        // Load categories
        const catResult = await getCategories()
        if (catResult.success && catResult.data) {
          setCategories(catResult.data)
        }

        // Load product data
        const { getProductById } = await import('@/app/actions/products')
        const product = await getProductById(productId)

        setName(product.name)
        setDescription(product.description || '')
        setPrice(product.price.toString())
        setOriginalPrice(product.originalPrice?.toString() || '')
        setCategoryId(product.categoryId)
        setStock(product.stock.toString())
        setSku((product as any).sku || '')
        setIsActive((product as any).isActive !== false)

        // Load existing images
        const productImages = (product as any).images
          ? JSON.parse((product as any).images)
          : product.image ? [product.image] : []

        setImages(productImages.map((url: string, i: number) => ({
          id: `existing-${i}`,
          url,
          name: `Image ${i + 1}`,
        })))
      } catch (err) {
        setError('Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !price || !categoryId || !stock) {
      setError('Please fill in product name, price, category, and stock.')
      return
    }

    try {
      setSaving(true)

      const mainImage = images.length > 0 ? images[0].url : undefined
      const allImages = images.length > 0 ? JSON.stringify(images.map(i => i.url)) : undefined

      const result = await updateProduct(productId, {
        name,
        description,
        price: price,
        originalPrice: originalPrice || undefined,
        categoryId,
        stock: parseInt(stock),
        image: mainImage,
        images: allImages,
        sku: sku || undefined,
        isActive,
      })

      if (result.success) {
        router.push('/admin/products')
      } else {
        setError(result.error || 'Failed to update product')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
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
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="rounded-xl">
          <Link href="/admin/products">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-5">
            <Card className="p-5 space-y-4">
              <h2 className="text-base font-semibold">Basic Information</h2>

              <div>
                <label className="block text-sm font-medium mb-1.5">Product Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product description..."
                  className="w-full px-3.5 py-2.5 border border-input rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all min-h-[120px] resize-y"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Price (GH₵)</label>
                  <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Original Price (optional)</label>
                  <Input type="number" step="0.01" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Stock</label>
                  <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">SKU (optional)</label>
                  <Input value={sku} onChange={(e) => setSku(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full h-10 px-3.5 border border-input rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Status</label>
                  <select
                    value={isActive ? 'active' : 'draft'}
                    onChange={(e) => setIsActive(e.target.value === 'active')}
                    className="w-full h-10 px-3.5 border border-input rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft (hidden)</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Images */}
            <Card className="p-5 space-y-4">
              <h2 className="text-base font-semibold">Product Images</h2>
              <ImageUpload value={images} onChange={setImages} endpoint="productImage" maxFiles={5} />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <Card className="p-5">
              <Button type="submit" disabled={saving} className="w-full rounded-xl gap-2" size="lg">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
