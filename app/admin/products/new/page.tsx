'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Plus, X, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ImageUpload } from '@/components/image-upload'
import Link from 'next/link'
import { createProduct } from '@/app/actions/admin'
import { getCategories } from '@/app/actions/products'

interface Category {
  id: string
  name: string
}

interface ProductAttribute {
  name: string
  value: string
}

interface UploadedImage {
  id: string
  url: string
  name: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'images'>('basic')

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [stock, setStock] = useState('')
  const [sku, setSku] = useState('')
  const [isActive, setIsActive] = useState(true)

  // Custom attributes
  const [customAttributes, setCustomAttributes] = useState<ProductAttribute[]>([])
  const [newAttrName, setNewAttrName] = useState('')
  const [newAttrValue, setNewAttrValue] = useState('')

  // Tags
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  // Images
  const [images, setImages] = useState<UploadedImage[]>([])

  useEffect(() => {
    const loadCategories = async () => {
      const result = await getCategories()
      if (result.success && result.data) {
        setCategories(result.data)
      }
    }
    loadCategories()
  }, [])

  const addCustomAttribute = () => {
    if (newAttrName.trim() && newAttrValue.trim()) {
      setCustomAttributes([...customAttributes, { name: newAttrName.trim(), value: newAttrValue.trim() }])
      setNewAttrName('')
      setNewAttrValue('')
    }
  }

  const removeAttribute = (index: number) => {
    setCustomAttributes(customAttributes.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !price || !categoryId || !stock) {
      setError('Please fill in product name, price, category, and stock.')
      return
    }

    try {
      setLoading(true)

      const mainImage = images.length > 0 ? images[0].url : undefined
      const allImages = images.length > 1 ? JSON.stringify(images.map(i => i.url)) : undefined

      const result = await createProduct({
        name,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        categoryId,
        stock: parseInt(stock),
        image: mainImage,
        sku: sku || undefined,
      })

      if (result.success) {
        router.push('/admin/products')
      } else {
        setError(result.error || 'Failed to create product')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const discount = price && originalPrice
    ? Math.round((1 - parseFloat(price) / parseFloat(originalPrice)) * 100)
    : 0

  const tabs = [
    { id: 'basic' as const, label: 'Basic Info' },
    { id: 'details' as const, label: 'Details & Attributes' },
    { id: 'images' as const, label: 'Images' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button variant="ghost" size="sm" className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">Add Product</h1>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-xl"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Publish Product'
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive font-medium animate-in fade-in">
          {error}
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <>
                <Card className="p-5 sm:p-6 space-y-4">
                  <h2 className="text-lg font-semibold">Product Information</h2>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Product Name *</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Premium Hair Wig 22 inch, Wireless Earbuds, Skincare Set"
                      required
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Use descriptive product names for better search visibility
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the product quality, material, usage tips, care instructions..."
                      className="w-full px-3.5 py-2.5 border border-input rounded-xl bg-background text-sm placeholder-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all min-h-[120px] resize-y"
                      rows={5}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">SKU (Stock Keeping Unit)</label>
                    <Input
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="e.g. BRZ-BW-22-BLK"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">Unique product identifier for inventory</p>
                  </div>
                </Card>

                {/* Pricing */}
                <Card className="p-5 sm:p-6 space-y-4">
                  <h2 className="text-lg font-semibold">Pricing</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Selling Price (GH₵) *</label>
                      <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        Compare-at Price (GH₵)
                        {discount > 0 && (
                          <Badge variant="destructive" className="ml-2 text-[10px]">-{discount}% off</Badge>
                        )}
                      </label>
                      <Input
                        type="number"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        placeholder="Original price (shows as crossed out)"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg">
                      <Info className="w-3.5 h-3.5" />
                      Customer saves {discount}% — that discount will show on the product card
                    </div>
                  )}
                </Card>

                {/* Inventory */}
                <Card className="p-5 sm:p-6 space-y-4">
                  <h2 className="text-lg font-semibold">Inventory</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Stock Quantity *</label>
                      <Input
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="0"
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Status</label>
                      <select
                        value={isActive ? 'active' : 'draft'}
                        onChange={(e) => setIsActive(e.target.value === 'active')}
                        className="w-full h-10 sm:h-11 px-3.5 border border-input rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all"
                      >
                        <option value="active">Active (visible to customers)</option>
                        <option value="draft">Draft (hidden)</option>
                        <option value="scheduled">Scheduled (publish later)</option>
                      </select>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* Details & Attributes Tab */}
            {activeTab === 'details' && (
              <>
                {/* Dynamic Product Attributes */}
                <Card className="p-5 sm:p-6 space-y-4">
                  <h2 className="text-lg font-semibold">Product Attributes</h2>
                  <p className="text-xs text-muted-foreground -mt-2">
                    Add specifications relevant to this product. Examples: &quot;Size&quot;: &quot;Large&quot;, &quot;Color&quot;: &quot;Black&quot;, &quot;Material&quot;: &quot;Cotton&quot;
                  </p>

                  {/* Quick-add presets for common product types */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-medium text-muted-foreground">Quick-add presets:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: '🧑‍🦱 Hair Product', attrs: [{ name: 'Hair Type', value: '' }, { name: 'Length', value: '' }, { name: 'Color', value: '' }, { name: 'Material', value: '' }] },
                        { label: '👗 Fashion', attrs: [{ name: 'Size', value: '' }, { name: 'Color', value: '' }, { name: 'Material', value: '' }] },
                        { label: '📱 Electronics', attrs: [{ name: 'Brand', value: '' }, { name: 'Model', value: '' }, { name: 'Color', value: '' }, { name: 'Warranty', value: '' }] },
                        { label: '💄 Beauty', attrs: [{ name: 'Skin Type', value: '' }, { name: 'Volume', value: '' }, { name: 'Ingredients', value: '' }] },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            const newAttrs = preset.attrs.filter(a => !customAttributes.find(ca => ca.name === a.name))
                            setCustomAttributes([...customAttributes, ...newAttrs])
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Attribute list */}
                  {customAttributes.length > 0 && (
                    <div className="space-y-2">
                      {customAttributes.map((attr, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            value={attr.name}
                            onChange={(e) => {
                              const updated = [...customAttributes]
                              updated[idx] = { ...updated[idx], name: e.target.value }
                              setCustomAttributes(updated)
                            }}
                            placeholder="Attribute name"
                            className="flex-1 h-9 text-sm"
                          />
                          <Input
                            value={attr.value}
                            onChange={(e) => {
                              const updated = [...customAttributes]
                              updated[idx] = { ...updated[idx], value: e.target.value }
                              setCustomAttributes(updated)
                            }}
                            placeholder="Value"
                            className="flex-1 h-9 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeAttribute(idx)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new attribute */}
                  <div className="flex gap-2">
                    <Input
                      value={newAttrName}
                      onChange={(e) => setNewAttrName(e.target.value)}
                      placeholder="Attribute name"
                      className="flex-1 h-9 text-sm"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomAttribute() } }}
                    />
                    <Input
                      value={newAttrValue}
                      onChange={(e) => setNewAttrValue(e.target.value)}
                      placeholder="Value"
                      className="flex-1 h-9 text-sm"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomAttribute() } }}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addCustomAttribute} className="rounded-xl px-3 h-9">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>

                {/* Tags */}
                <Card className="p-5 sm:p-6 space-y-4">
                  <h2 className="text-lg font-semibold">Tags</h2>
                  <p className="text-xs text-muted-foreground -mt-2">
                    Tags help with search and filtering (e.g. &quot;bestseller&quot;, &quot;new arrival&quot;, &quot;trending&quot;)
                  </p>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="p-0.5 hover:bg-muted rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                      className="h-9 text-sm"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addTag} className="rounded-xl px-3 h-9">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <Card className="p-5 sm:p-6 space-y-4">
                <h2 className="text-lg font-semibold">Product Images</h2>
                <p className="text-xs text-muted-foreground -mt-2">
                  Upload up to 5 images. The first image will be used as the main product image.
                </p>

                <ImageUpload
                  value={images}
                  onChange={setImages}
                  endpoint="productImage"
                  maxFiles={5}
                  maxSize={16 * 1024 * 1024}
                />

                <div className="bg-muted/50 rounded-xl p-3 space-y-1">
                  <p className="text-xs font-medium">Tips for better product images:</p>
                  <ul className="text-[11px] text-muted-foreground space-y-0.5 list-disc pl-4">
                    <li>Use a clean white or neutral background</li>
                    <li>Show the product from multiple angles</li>
                    <li>Include a shot showing the product being worn</li>
                    <li>Make sure lighting is bright and even</li>
                    <li>Minimum recommended size: 1000x1000px</li>
                  </ul>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category */}
            <Card className="p-5 space-y-4">
              <h2 className="text-base font-semibold">Category *</h2>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 sm:h-11 px-3.5 border border-input rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all"
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              {/* Create new category inline */}
              <NewCategoryInline onCreated={(cat) => {
                setCategories(prev => [...prev, cat])
                setCategoryId(cat.id)
              }} />
            </Card>

            {/* Preview */}
            <Card className="p-5 space-y-3">
              <h2 className="text-base font-semibold">Preview</h2>
              <div className="border border-border rounded-xl p-3 space-y-2">
                {images.length > 0 ? (
                  <div className="aspect-square rounded-lg bg-muted overflow-hidden">
                    <img src={images[0].url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
                <p className="text-sm font-medium line-clamp-2">{name || 'Product name'}</p>
                <div className="flex items-baseline gap-2">
                  {price && <span className="text-sm font-bold">GH₵ {parseFloat(price || '0').toFixed(2)}</span>}
                  {originalPrice && <span className="text-xs text-muted-foreground line-through">GH₵ {parseFloat(originalPrice).toFixed(2)}</span>}
                </div>
                {stock && <p className="text-[11px] text-muted-foreground">{stock} in stock</p>}
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full rounded-xl"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  'Publish Product'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => router.push('/admin/products')}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

// Inline category creation component
function NewCategoryInline({ onCreated }: { onCreated: (cat: { id: string; name: string }) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return
    setCreating(true)
    try {
      const { createCategory } = await import('@/app/actions/admin')
      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const result = await createCategory({ name: name.trim(), description: description.trim() || undefined, slug })
      if (result.success && result.data) {
        onCreated({ id: result.data.id, name: name.trim() })
        setName('')
        setDescription('')
        setOpen(false)
      }
    } catch {}
    setCreating(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-primary hover:bg-primary/5 border border-dashed border-primary/30 rounded-xl transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Create New Category
      </button>
    )
  }

  return (
    <div className="border border-border rounded-xl p-3 space-y-2.5 bg-muted/30">
      <p className="text-xs font-medium">New Category</p>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category name (e.g. Skincare)"
        className="h-8 text-sm"
      />
      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="h-8 text-sm"
      />
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={handleCreate}
          disabled={creating || !name.trim()}
          size="sm"
          className="rounded-lg flex-1 h-7 text-[11px]"
        >
          {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Create'}
        </Button>
        <Button
          type="button"
          onClick={() => setOpen(false)}
          variant="outline"
          size="sm"
          className="rounded-lg h-7 text-[11px]"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
