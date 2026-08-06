'use client'

import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils/format'

interface ProductVariant {
  id: string
  name: string
  options: Record<string, string>
  price: number
  stock: number
  image?: string | null
}

interface VariantSelectorProps {
  variants: ProductVariant[]
  onSelect: (variant: ProductVariant | null) => void
  className?: string
}

export function VariantSelector({ variants, onSelect, className }: VariantSelectorProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  // Get all option types and their possible values
  const optionGroups = useMemo(() => {
    const groups: Record<string, Set<string>> = {}
    variants.forEach((v) => {
      Object.entries(v.options).forEach(([key, value]) => {
        if (!groups[key]) groups[key] = new Set()
        groups[key].add(value)
      })
    })
    return Object.entries(groups).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }))
  }, [variants])

  // Find matching variant based on selected options
  const selectedVariant = useMemo(() => {
    if (Object.keys(selectedOptions).length === 0) return null
    return variants.find((v) =>
      Object.entries(selectedOptions).every(([key, val]) => v.options[key] === val)
    ) || null
  }, [selectedOptions, variants])

  // Notify parent of selection change
  useEffect(() => {
    onSelect(selectedVariant)
  }, [selectedVariant, onSelect])

  // Check if a specific option value is available (has stock in at least one variant)
  const isOptionAvailable = (optionName: string, optionValue: string): boolean => {
    return variants.some((v) => {
      // Must match this option value
      if (v.options[optionName] !== optionValue) return false
      // Must match all other selected options
      for (const [key, val] of Object.entries(selectedOptions)) {
        if (key === optionName) continue
        if (v.options[key] !== val) return false
      }
      return v.stock > 0
    })
  }

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: prev[optionName] === value ? '' : value, // Toggle if same
    }))
  }

  if (variants.length === 0) return null

  return (
    <div className={cn('space-y-4', className)}>
      {optionGroups.map((group) => (
        <div key={group.name}>
          <label className="block text-xs sm:text-sm font-medium mb-2">
            {group.name}
            {selectedOptions[group.name] && (
              <span className="text-muted-foreground font-normal ml-1.5">: {selectedOptions[group.name]}</span>
            )}
          </label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {group.values.map((value) => {
              const isSelected = selectedOptions[group.name] === value
              const available = isOptionAvailable(group.name, value)

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleOptionSelect(group.name, value)}
                  disabled={!available}
                  className={cn(
                    'px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium border transition-all',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : available
                      ? 'bg-card border-border text-foreground hover:border-primary/50 hover:bg-primary/5'
                      : 'bg-muted/50 border-border/50 text-muted-foreground/50 line-through cursor-not-allowed'
                  )}
                >
                  {value}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Selected variant info */}
      {selectedVariant && (
        <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-xl">
          <div>
            <p className="text-xs text-muted-foreground">Selected: <span className="font-medium text-foreground">{selectedVariant.name}</span></p>
            {selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
              <p className="text-[10px] text-amber-600 font-medium mt-0.5">Only {selectedVariant.stock} left!</p>
            )}
          </div>
          <p className="text-sm sm:text-base font-bold text-primary">{formatPrice(selectedVariant.price)}</p>
        </div>
      )}
    </div>
  )
}
