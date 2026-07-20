'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus, Gift, Copy, Check, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils/format'

interface GiftCard {
  id: string
  code: string
  description: string | null
  discountValue: string
  maxUses: number | null
  currentUses: number | null
  isActive: boolean | null
  createdAt: Date
}

export default function AdminGiftCardsPage() {
  const [cards, setCards] = useState<GiftCard[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // New card form
  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    loadCards()
  }, [])

  const loadCards = async () => {
    try {
      setLoading(true)
      const { getAllGiftCards } = await import('@/app/actions/gift-cards')
      const result = await getAllGiftCards()
      if (result.success && result.data) {
        setCards(result.data as GiftCard[])
      }
    } catch (err) {
      console.error('Failed to load gift cards:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!amount || parseFloat(amount) < 50) return
    setCreating(true)

    const { adminCreateGiftCard } = await import('@/app/actions/gift-cards')
    const result = await adminCreateGiftCard({
      amount: parseFloat(amount),
      recipientName: recipientName || 'Customer',
      note: note || undefined,
    })

    if (result.success) {
      setShowForm(false)
      setAmount('')
      setRecipientName('')
      setNote('')
      loadCards()
    }
    setCreating(false)
  }

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredCards = cards.filter(c =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="w-6 h-6 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold">Gift Cards</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" />
          Create Card
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold">Create New Gift Card</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Amount (GH₵) *</label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100" min="50" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Recipient Name</label>
              <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Customer name" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Note</label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={creating} className="rounded-xl gap-2">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
              Generate Card
            </Button>
            <Button onClick={() => setShowForm(false)} variant="outline" className="rounded-xl">Cancel</Button>
          </div>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by code or note..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      {/* Cards List */}
      {loading ? (
        <Card className="rounded-2xl p-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </Card>
      ) : filteredCards.length === 0 ? (
        <Card className="rounded-2xl p-12 text-center">
          <Gift className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No gift cards created yet</p>
        </Card>
      ) : (
        <Card className="rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Code</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Value</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Note</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Created</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.map((card) => {
                  const isUsed = (card.currentUses || 0) >= (card.maxUses || 1)
                  return (
                    <tr key={card.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-sm">{card.code}</td>
                      <td className="px-4 py-3 font-semibold text-primary">{formatPrice(card.discountValue)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={isUsed ? 'secondary' : 'success'}>
                          {isUsed ? 'Used' : 'Active'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                        {card.description || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(card.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          onClick={() => handleCopy(card.code, card.id)}
                          variant="ghost"
                          size="sm"
                          className="rounded-lg gap-1"
                        >
                          {copiedId === card.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedId === card.id ? 'Copied' : 'Copy'}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
