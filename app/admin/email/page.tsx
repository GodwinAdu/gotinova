'use client'

import { useState, useEffect } from 'react'
import { Mail, Send, Users, CheckCircle, Loader2, Search, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAllCustomerEmails, sendEmailCampaign } from '@/app/actions/email-campaigns'

interface Customer {
  id: string
  name: string | null
  email: string
  createdAt: Date | null
}

export default function AdminEmailPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Campaign form
  const [subject, setSubject] = useState('')
  const [heading, setHeading] = useState('')
  const [body, setBody] = useState('')
  const [ctaText, setCtaText] = useState('')
  const [ctaUrl, setCtaUrl] = useState('')

  // Recipients
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    setLoading(true)
    const result = await getAllCustomerEmails()
    if (result.success && result.data) {
      setCustomers(result.data as Customer[])
    }
    setLoading(false)
  }

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([])
      setSelectAll(false)
    } else {
      setSelectedIds(filteredCustomers.map(c => c.id))
      setSelectAll(true)
    }
  }

  const toggleCustomer = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
    setSelectAll(false)
  }

  const filteredCustomers = customers.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(null)

    if (!subject.trim() || !heading.trim() || !body.trim()) {
      setError('Please fill in subject, heading, and body')
      return
    }
    if (selectedIds.length === 0 && !selectAll) {
      setError('Please select at least one recipient')
      return
    }

    setSending(true)
    const result = await sendEmailCampaign({
      subject: subject.trim(),
      heading: heading.trim(),
      body: body.trim(),
      ctaText: ctaText.trim() || undefined,
      ctaUrl: ctaUrl.trim() || undefined,
      recipientIds: selectAll && selectedIds.length === customers.length ? ['all'] : selectedIds,
    })

    if (result.success) {
      setSuccess(result.message || 'Campaign sent successfully!')
      setSubject('')
      setHeading('')
      setBody('')
      setCtaText('')
      setCtaUrl('')
      setSelectedIds([])
      setSelectAll(false)
    } else {
      setError(result.error || 'Failed to send campaign')
    }
    setSending(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Mail className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Email Campaigns</h1>
          <p className="text-sm text-muted-foreground">Send targeted emails to your customers</p>
        </div>
      </div>

      {/* Success/Error */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{success}</p>
        </div>
      )}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSend}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compose Section */}
          <div className="lg:col-span-2 space-y-5">
            <Card className="p-5 sm:p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                Compose Email
              </h2>

              <div>
                <label className="block text-sm font-medium mb-1.5">Email Subject *</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. 🎉 Exclusive Sale — 30% Off This Weekend!"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Heading *</label>
                <Input
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder="e.g. Weekend Flash Sale!"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Body Content *</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={"Write your email message here...\n\nYou can use multiple paragraphs.\nLine breaks will be preserved."}
                  className="w-full px-3.5 py-2.5 border border-input rounded-xl bg-background text-sm placeholder-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all min-h-[160px] resize-y"
                  required
                />
                <p className="text-[11px] text-muted-foreground mt-1">Line breaks will appear as new paragraphs in the email</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Button Text (optional)</label>
                  <Input
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g. Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Button Link (optional)</label>
                  <Input
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="e.g. https://gotinova.vercel.app/products"
                  />
                </div>
              </div>
            </Card>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={sending || (!selectedIds.length && !selectAll)}
              size="lg"
              className="w-full rounded-xl h-12"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending to {selectAll ? customers.length : selectedIds.length} recipients...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Campaign to {selectAll ? `All (${customers.length})` : `${selectedIds.length} Selected`}
                </>
              )}
            </Button>
          </div>

          {/* Recipients Panel */}
          <div className="space-y-4">
            <Card className="p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Recipients
                </h2>
                <Badge variant="secondary" className="text-[10px]">
                  {selectedIds.length || (selectAll ? customers.length : 0)} selected
                </Badge>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search customers..."
                  className="pl-9 h-9 text-sm"
                />
              </div>

              {/* Select All */}
              <button
                type="button"
                onClick={toggleSelectAll}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium mb-2 transition-colors ${
                  selectAll
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Select All ({customers.length})
              </button>

              {/* Customer list */}
              {loading ? (
                <div className="py-8 text-center">
                  <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto space-y-1 pr-1">
                  {filteredCustomers.map((customer) => {
                    const selected = selectAll || selectedIds.includes(customer.id)
                    return (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => toggleCustomer(customer.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                          selected
                            ? 'bg-primary/5 border border-primary/20'
                            : 'hover:bg-muted/50 border border-transparent'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          selected ? 'bg-primary border-primary' : 'border-border'
                        }`}>
                          {selected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{customer.name || 'No name'}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{customer.email}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </Card>

            {/* Quick stats */}
            <Card className="p-4 rounded-2xl bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">Campaign Preview</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Recipients:</span>
                  <span className="font-medium">{selectAll ? customers.length : selectedIds.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Subject:</span>
                  <span className="font-medium truncate max-w-[150px]">{subject || '—'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Has CTA:</span>
                  <span className="font-medium">{ctaText && ctaUrl ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
