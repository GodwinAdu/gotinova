'use client'

import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface Variant {
  id?: string
  name: string
  options: Record<string, string>
  price: number
  stock: number
  sku?: string
}

interface VariantEditorProps {
  variants: Variant[]
  onChange: (variants: Variant[]) => void
}

const OPTION_PRESETS = [
  { label: 'Size', values: ['S', 'M', 'L', 'XL', 'XXL'] },
  { label: 'Color', values: ['Black', 'Brown', 'Blonde', 'Red', 'Blue', 'White', 'Pink'] },
  { label: 'Length', values: ['10"', '12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"', '28"', '30"'] },
  { label: 'Material', values: ['Human Hair', 'Synthetic', 'Blend'] },
]

export function VariantEditor({ variants, onChange }: VariantEditorProps) {
  const [optionTypes, setOptionTypes] = useState<string[]>(() => {
    // Infer option types from existing variants
    if (variants.length > 0) {
      return Object.keys(variants[0].options)
    }
    return []
  })
  const [newOptionType, setNewOptionType] = useState('')

  const addOptionType = (type: string) => {
    const t = type.trim()
    if (!t || optionTypes.includes(t)) return
    setOptionTypes([...optionTypes, t])
    setNewOptionType('')
    // Add the new option key to all existing variants
    onChange(variants.map(v => ({
      ...v,
      options: { ...v.options, [t]: '' },
      name: buildVariantName({ ...v.options, [t]: '' }),
    })))
  }

  const removeOptionType = (type: string) => {
    setOptionTypes(optionTypes.filter(t => t !== type))
    onChange(variants.map(v => {
      const newOpts = { ...v.options }
      delete newOpts[type]
      return { ...v, options: newOpts, name: buildVariantName(newOpts) }
    }))
  }

  const addVariant = () => {
    const emptyOptions: Record<string, string> = {}
    optionTypes.forEach(t => { emptyOptions[t] = '' })
    onChange([...variants, {
      name: '',
      options: emptyOptions,
      price: 0,
      stock: 0,
    }])
  }

  const updateVariant = (index: number, field: string, value: any) => {
    const updated = [...variants]
    if (field === 'price' || field === 'stock') {
      updated[index] = { ...updated[index], [field]: Number(value) || 0 }
    } else if (field.startsWith('option_')) {
      const optKey = field.replace('option_', '')
      const newOpts = { ...updated[index].options, [optKey]: value }
      updated[index] = { ...updated[index], options: newOpts, name: buildVariantName(newOpts) }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    onChange(updated)
  }

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index))
  }

  const buildVariantName = (options: Record<string, string>): string => {
    return Object.values(options).filter(Boolean).join(' / ')
  }

  return (
    <Card className="p-5 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Product Variants</h2>
          <p className="text-[11px] text-muted-foreground">Add size, color, or other options with different prices</p>
        </div>
        {variants.length > 0 && (
          <Badge variant="secondary" className="text-[10px]">{variants.length} variant{variants.length !== 1 ? 's' : ''}</Badge>
        )}
      </div>

      {/* Option Types (e.g. Size, Color) */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Option types:</label>
        <div className="flex flex-wrap gap-1.5">
          {optionTypes.map((type) => (
            <Badge key={type} variant="outline" className="gap-1 pr-1 text-xs">
              {type}
              <button onClick={() => removeOptionType(type)} className="p-0.5 hover:bg-muted rounded">
                <X className="w-2.5 h-2.5" />
              </button>
            </Badge>
          ))}
        </div>

        {/* Add option type */}
        <div className="flex gap-2">
          <Input
            value={newOptionType}
            onChange={(e) => setNewOptionType(e.target.value)}
            placeholder="Add option type (e.g. Size, Color)"
            className="h-8 text-xs flex-1"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOptionType(newOptionType) } }}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => addOptionType(newOptionType)} className="h-8 px-3 text-xs rounded-lg">
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        {/* Quick preset buttons */}
        <div className="flex flex-wrap gap-1">
          {OPTION_PRESETS.filter(p => !optionTypes.includes(p.label)).map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => addOptionType(preset.label)}
              className="px-2 py-0.5 text-[10px] bg-muted hover:bg-muted/80 rounded-md transition-colors"
            >
              + {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Variants list */}
      {optionTypes.length > 0 && (
        <div className="space-y-2">
          {/* Header row */}
          <div className="grid gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide" style={{ gridTemplateColumns: `${optionTypes.map(() => '1fr').join(' ')} 80px 60px 30px` }}>
            {optionTypes.map(t => <span key={t}>{t}</span>)}
            <span>Price</span>
            <span>Stock</span>
            <span></span>
          </div>

          {/* Variant rows */}
          {variants.map((variant, idx) => (
            <div key={idx} className="grid gap-2 items-center" style={{ gridTemplateColumns: `${optionTypes.map(() => '1fr').join(' ')} 80px 60px 30px` }}>
              {optionTypes.map((type) => (
                <Input
                  key={type}
                  value={variant.options[type] || ''}
                  onChange={(e) => updateVariant(idx, `option_${type}`, e.target.value)}
                  placeholder={type}
                  className="h-8 text-xs"
                />
              ))}
              <Input
                type="number"
                value={variant.price || ''}
                onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                placeholder="₵"
                className="h-8 text-xs"
                min="0"
                step="0.01"
              />
              <Input
                type="number"
                value={variant.stock || ''}
                onChange={(e) => updateVariant(idx, 'stock', e.target.value)}
                placeholder="Qty"
                className="h-8 text-xs"
                min="0"
              />
              <button
                type="button"
                onClick={() => removeVariant(idx)}
                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Add variant button */}
          <Button type="button" variant="outline" size="sm" onClick={addVariant} className="w-full rounded-xl h-8 text-xs gap-1">
            <Plus className="w-3 h-3" /> Add Variant
          </Button>
        </div>
      )}

      {optionTypes.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4 bg-muted/30 rounded-xl">
          Add option types above (e.g. Size, Color) to create variants
        </p>
      )}
    </Card>
  )
}
