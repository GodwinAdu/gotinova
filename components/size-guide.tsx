'use client'

import { useState } from 'react'
import { Ruler, X, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/modal'

export function SizeGuideButton() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'cap' | 'length'>('cap')

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
      >
        <Ruler className="w-3.5 h-3.5" />
        Size Guide
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md sm:max-w-lg rounded-3xl p-0 overflow-hidden max-h-[85vh] overflow-y-auto">
          <DialogTitle className="sr-only">Size & Measurement Guide</DialogTitle>
          <DialogDescription className="sr-only">Guide for wig cap sizes and hair lengths</DialogDescription>

          {/* Header */}
          <div className="p-5 sm:p-6 pb-0">
            <div className="flex items-center gap-2 mb-1">
              <Ruler className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Size & Measurement Guide</h2>
            </div>
            <p className="text-xs text-muted-foreground">Find your perfect fit</p>
          </div>

          {/* Tabs */}
          <div className="px-5 sm:px-6 pt-4">
            <div className="flex gap-1 p-1 bg-muted rounded-xl">
              <button
                onClick={() => setActiveTab('cap')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'cap' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Cap Size
              </button>
              <button
                onClick={() => setActiveTab('length')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'length' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Hair Length
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6">
            {activeTab === 'cap' ? <CapSizeGuide /> : <LengthGuide />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function CapSizeGuide() {
  const sizes = [
    { size: 'Small', circumference: '21.5"  (54.5 cm)', forehead: '13"', nape: '5.5"', ear: '14"' },
    { size: 'Medium', circumference: '22.5"  (57 cm)', forehead: '13.5"', nape: '6"', ear: '14.5"' },
    { size: 'Large', circumference: '23.5"  (59.5 cm)', forehead: '14"', nape: '6.5"', ear: '15"' },
  ]

  return (
    <div className="space-y-5">
      {/* How to measure */}
      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-sm font-medium">How to Measure</p>
        </div>
        <ol className="text-xs text-muted-foreground space-y-1.5 pl-6 list-decimal">
          <li>Use a soft measuring tape</li>
          <li>Measure around your head at the hairline — from forehead, over ears, around the nape, and back</li>
          <li>Keep the tape snug but not tight</li>
          <li>Note down the measurement in inches or cm</li>
        </ol>
      </div>

      {/* Size table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-3 font-semibold">Size</th>
              <th className="text-left py-2 px-3 font-semibold">Circumference</th>
              <th className="text-left py-2 px-3 font-semibold">Forehead</th>
              <th className="text-left py-2 pl-3 font-semibold">Ear to Ear</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((s) => (
              <tr key={s.size} className="border-b border-border last:border-0">
                <td className="py-2.5 pr-3 font-medium">{s.size}</td>
                <td className="py-2.5 px-3 text-muted-foreground">{s.circumference}</td>
                <td className="py-2.5 px-3 text-muted-foreground">{s.forehead}</td>
                <td className="py-2.5 pl-3 text-muted-foreground">{s.ear}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tip */}
      <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-xl px-3 py-2">
        💡 Most women fit a <strong>Medium (22.5&quot;)</strong> cap size. Our wigs come with adjustable straps for a custom fit.
      </p>
    </div>
  )
}

function LengthGuide() {
  const lengths = [
    { length: '8"', look: 'Above chin', style: 'Pixie / Short bob' },
    { length: '10"', look: 'Chin length', style: 'Classic bob' },
    { length: '12"', look: 'Below chin', style: 'Long bob / Lob' },
    { length: '14"', look: 'Above shoulders', style: 'Shoulder length' },
    { length: '16"', look: 'Shoulder level', style: 'Medium length' },
    { length: '18"', look: 'Below shoulders', style: 'Medium-long' },
    { length: '20"', look: 'Mid-back', style: 'Long' },
    { length: '22"', look: 'Lower back', style: 'Extra long' },
    { length: '24"+', look: 'Waist level', style: 'Super long' },
  ]

  return (
    <div className="space-y-5">
      {/* Visual reference */}
      <div className="bg-muted/50 rounded-2xl p-4">
        <p className="text-xs font-medium mb-3 text-center">Length Reference (approximate)</p>
        <div className="flex items-end justify-center gap-1.5 h-32">
          {[8, 10, 12, 14, 16, 18, 20, 22, 24].map((len, i) => (
            <div key={len} className="flex flex-col items-center gap-1">
              <div
                className="w-4 bg-gradient-to-t from-primary/80 to-primary/30 rounded-full"
                style={{ height: `${20 + i * 12}px` }}
              />
              <span className="text-[9px] text-muted-foreground">{len}&quot;</span>
            </div>
          ))}
        </div>
      </div>

      {/* Length table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-3 font-semibold">Length</th>
              <th className="text-left py-2 px-3 font-semibold">Falls To</th>
              <th className="text-left py-2 pl-3 font-semibold">Style</th>
            </tr>
          </thead>
          <tbody>
            {lengths.map((l) => (
              <tr key={l.length} className="border-b border-border last:border-0">
                <td className="py-2 pr-3 font-medium">{l.length}</td>
                <td className="py-2 px-3 text-muted-foreground">{l.look}</td>
                <td className="py-2 pl-3 text-muted-foreground">{l.style}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note */}
      <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-xl px-3 py-2">
        💡 Hair length is measured when straight. Curly/wavy textures will appear shorter due to the curl pattern.
      </p>
    </div>
  )
}
