'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X, Loader2, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils/format'
import { getProducts } from '@/app/actions/products'

interface SearchResult {
  id: string
  name: string
  price: string
  image: string | null
}

export function SearchModal() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Keyboard shortcut: Cmd/Ctrl + K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setResults([])
    }
  }, [open])

  // Search with debounce
  const handleSearch = useCallback((value: string) => {
    setQuery(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await getProducts({ search: value.trim(), limit: 6 })
        if (result.success && result.data) {
          setResults(result.data.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image,
          })))
        }
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [])

  const handleSelect = () => {
    setOpen(false)
    setQuery('')
    setResults([])
  }

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-xl transition-all border border-transparent hover:border-border"
        aria-label="Search"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden lg:inline">Search...</span>
        <kbd className="hidden lg:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-card px-1.5 text-[10px] font-mono text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      {/* Search Modal */}
      {open && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative flex justify-center pt-[15vh] px-4">
            <div className="w-full max-w-lg bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-top-2 duration-200">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 border-b border-border">
                <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 py-4 bg-transparent text-base outline-none placeholder-muted-foreground/60"
                  autoComplete="off"
                />
                {query && (
                  <button
                    onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
                    className="p-1 text-muted-foreground hover:text-foreground rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {loading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
              </div>

              {/* Results */}
              <div className="max-h-[50vh] overflow-y-auto">
                {results.length > 0 ? (
                  <div className="p-2">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        onClick={handleSelect}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground">
                              N/A
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                            {product.name}
                          </p>
                          <p className="text-xs text-primary font-semibold">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}

                    {/* View all link */}
                    <Link
                      href={`/products?search=${encodeURIComponent(query)}`}
                      onClick={handleSelect}
                      className="flex items-center justify-center gap-2 p-3 mt-1 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-colors"
                    >
                      View all results
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : query && !loading ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-muted-foreground">No products found for &quot;{query}&quot;</p>
                    <Link
                      href="/products"
                      onClick={handleSelect}
                      className="text-sm text-primary hover:underline mt-2 inline-block"
                    >
                      Browse all products
                    </Link>
                  </div>
                ) : !query ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">Start typing to search products</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                      {['Wigs', 'Extensions', 'Lace Front', 'Braiding'].map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSearch(term)}
                          className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span>↵ to select</span>
                <span>esc to close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
