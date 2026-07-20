'use client'

import { useEffect, useState } from 'react'
import { X, BarChart2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCompareList, removeFromCompare, clearCompare, type CompareProduct } from '@/lib/utils/compare'
import Link from 'next/link'

/**
 * Floating comparison bar — shows at the bottom when user has items to compare.
 */
export function CompareBar() {
  const [items, setItems] = useState<CompareProduct[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setItems(getCompareList())

    const handler = () => setItems(getCompareList())
    window.addEventListener('compare-change', handler)
    return () => window.removeEventListener('compare-change', handler)
  }, [])

  if (!mounted || items.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[55] bg-card border-t border-border shadow-lg animate-in slide-in-from-bottom-2 duration-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Icon */}
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <BarChart2 className="w-4 h-4 text-primary" />
        </div>

        {/* Product thumbnails */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
          {items.map((item) => (
            <div key={item.id} className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden border border-border">
                {item.image ? (
                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground">N/A</div>
                )}
              </div>
              <button
                onClick={() => removeFromCompare(item.id)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white rounded-full flex items-center justify-center"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
          {items.length < 3 && (
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
              Add {3 - items.length} more to compare
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={clearCompare}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Clear
          </button>
          <Button asChild size="sm" className="rounded-xl gap-1 h-8" disabled={items.length < 2}>
            <Link href="/compare">
              Compare ({items.length})
              <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
