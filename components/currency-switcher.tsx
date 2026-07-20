'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CURRENCIES,
  getSelectedCurrency,
  setSelectedCurrency,
  getCurrency,
  fetchLiveRates,
  convertPrice,
  type CurrencyCode,
} from '@/lib/utils/currency'

export function CurrencySwitcher({ className }: { className?: string }) {
  const [current, setCurrent] = useState<CurrencyCode>('GHS')
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [ratesLoaded, setRatesLoaded] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCurrent(getSelectedCurrency())
    // Fetch live rates on mount (uses cache if fresh)
    fetchLiveRates().then(() => setRatesLoaded(true))
  }, [])

  const handleSelect = (code: CurrencyCode) => {
    setCurrent(code)
    setSelectedCurrency(code)
    setOpen(false)
    // Reload to update all prices on the page
    window.location.reload()
  }

  if (!mounted) return null

  const selected = getCurrency(current)

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-lg transition-all border border-transparent hover:border-border"
      >
        <span>{selected.flag}</span>
        <span>{selected.code}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-card border border-border/60 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-border text-[10px] text-muted-foreground flex items-center justify-between">
              <span>Display currency (prices are in GHS)</span>
              {ratesLoaded && <span className="text-emerald-500">● Live rates</span>}
            </div>
            {CURRENCIES.map((currency) => {
              // Show approximate conversion for 1000 GHS
              const sample = current !== currency.code ? convertPrice(1000, currency.code) : null

              return (
                <button
                  key={currency.code}
                  onClick={() => handleSelect(currency.code)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted transition-colors',
                    current === currency.code && 'bg-primary/5 text-primary font-medium'
                  )}
                >
                  <span className="text-base">{currency.flag}</span>
                  <div className="flex-1 text-left">
                    <span className="font-medium">{currency.code}</span>
                    <span className="text-xs text-muted-foreground ml-1.5">{currency.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{currency.symbol}</span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
