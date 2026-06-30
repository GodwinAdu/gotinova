'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import Link from 'next/link'
import { getAllProducts, deleteProduct } from '@/app/actions/admin'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  image: string
  category: string
  isActive: boolean
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const data = await getAllProducts()
        setProducts(data)
      } catch (err) {
        console.error('[v0] Load products error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      setDeleting(productId)
      await deleteProduct(productId)
      setProducts(products.filter(p => p.id !== productId))
      alert('Product deleted successfully')
    } catch (err) {
      console.error('[v0] Delete error:', err)
      alert(err instanceof Error ? err.message : 'Failed to delete product')
    } finally {
      setDeleting(null)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/admin/products/new">
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Table */}
      {loading ? (
        <Card className="p-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No products found</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Product</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Stock</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{product.category}</td>
                    <td className="px-6 py-4 text-sm font-semibold">PKR {product.price.toFixed(0)}</td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant={product.stock > 0 ? 'outline' : 'destructive'}>
                        {product.stock} units
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant={product.isActive ? 'default' : 'secondary'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/products/${product.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting === product.id}
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-destructive hover:text-destructive"
                        >
                          {deleting === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
