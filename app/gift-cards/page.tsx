'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Gift, Copy, Check, Loader2, Search, ArrowRight } from 'lucide-react'
import { purchaseGiftCard, checkGiftCardBalance } from '@/app/actions/gift-cards'
import { formatPrice } from '@/lib/utils/format'

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000]

export default function GiftCardsPage() {
  const [activeTab, setActiveTab] = useState<'buy' | 'check'>('buy')

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Gift Cards</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Give the gift of great hair. Perfect for any occasion!
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6 w-fit mx-auto">
            <button
              onClick={() => setActiveTab('buy')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'buy' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Buy Gift Card
            </button>
            <button
              onClick={() => setActiveTab('check')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'check' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Check Balance
            </button>
          </div>

          {activeTab === 'buy' ? <BuyGiftCard /> : <CheckBalance />}
        </div>
      </main>
    </>
  )
}

function BuyGiftCard() {
  const [amount, setAmount] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [senderName, setSenderName] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ code: string; amount: number } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount < 50) {
      setError('Minimum amount is GH₵ 50')
      return
    }
    if (!recipientName || !senderName) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    const res = await purchaseGiftCard({
      amount: numAmount,
      recipientName,
      recipientEmail,
      senderName,
      message: message || undefined,
    })

    if (res.success && res.data) {
      setResult({ code: res.data.code, amount: res.data.amount })
    } else {
      setError(res.error || 'Failed to create gift card')
    }
    setLoading(false)
  }

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (result) {
    return (
      <Card className="p-6 sm:p-8 rounded-2xl text-center space-y-5">
        <div className="w-14 h-14 mx-auto bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
          <Gift className="w-7 h-7 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Gift Card Created!</h2>
          <p className="text-sm text-muted-foreground mt-1">Share this code with {recipientName}</p>
        </div>

        {/* Code display */}
        <div className="bg-muted rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Gift Card Code</p>
          <p className="text-2xl font-mono font-bold tracking-wider">{result.code}</p>
          <p className="text-sm text-primary font-semibold mt-2">Value: {formatPrice(result.amount)}</p>
        </div>

        <Button onClick={handleCopy} variant="outline" className="rounded-xl gap-2">
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Code'}
        </Button>

        <p className="text-[11px] text-muted-foreground">
          The recipient can use this code at checkout to get {formatPrice(result.amount)} off their order.
        </p>

        <Button onClick={() => { setResult(null); setAmount(''); setRecipientName(''); setSenderName(''); setMessage('') }} variant="ghost" className="text-sm">
          Buy Another Gift Card
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-5 sm:p-6 rounded-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium mb-2">Amount (GH₵) *</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toString())}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  amount === preset.toString()
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {formatPrice(preset)}
              </button>
            ))}
          </div>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Or enter custom amount"
            min="50"
            max="10000"
          />
        </div>

        {/* Recipient */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Recipient&apos;s Name *</label>
            <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Who is this for?" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Recipient&apos;s Email</label>
            <Input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="Optional — to send code via email" />
          </div>
        </div>

        {/* Sender */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Your Name *</label>
          <Input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="From who?" required />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Personal Message (optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Happy birthday! Get yourself something beautiful 💕"
            className="w-full px-3.5 py-2.5 border border-input rounded-xl bg-background text-sm placeholder-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all min-h-[80px] resize-y"
            maxLength={200}
          />
        </div>

        {error && <p className="text-xs text-destructive font-medium">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full rounded-xl h-11">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Gift className="w-4 h-4 mr-2" />}
          {amount ? `Purchase Gift Card — ${formatPrice(parseFloat(amount) || 0)}` : 'Purchase Gift Card'}
        </Button>
      </form>
    </Card>
  )
}

function CheckBalance() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ balance: number; used: boolean; description?: string | null } | null>(null)
  const [error, setError] = useState('')

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setError('')
    setResult(null)
    setLoading(true)

    const res = await checkGiftCardBalance(code)
    if (res.success && res.data) {
      setResult(res.data)
    } else {
      setError(res.error || 'Gift card not found')
    }
    setLoading(false)
  }

  return (
    <Card className="p-5 sm:p-6 rounded-2xl space-y-5">
      <form onSubmit={handleCheck} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Gift Card Code</label>
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="GC-XXXXXXXX"
              className="uppercase font-mono"
            />
            <Button type="submit" disabled={loading} className="rounded-xl px-4">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </form>

      {error && <p className="text-xs text-destructive font-medium">{error}</p>}

      {result && (
        <div className={`p-4 rounded-xl ${result.used ? 'bg-muted' : 'bg-emerald-50 dark:bg-emerald-900/10'}`}>
          {result.used ? (
            <div className="text-center">
              <p className="font-medium text-muted-foreground">This gift card has been used</p>
              <p className="text-sm text-muted-foreground mt-1">Balance: GH₵ 0.00</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Available Balance</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatPrice(result.balance)}</p>
              {result.description && (
                <p className="text-xs text-muted-foreground mt-2">{result.description}</p>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
