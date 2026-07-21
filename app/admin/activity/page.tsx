'use client'

import { useEffect, useState } from 'react'
import { ClipboardList, Trash2, Package, ShoppingCart, User, Settings, Gift, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getActivityLog, clearActivityLog, type ActivityEntry } from '@/lib/activity-log'
import { ConfirmDialog } from '@/components/confirm-dialog'

const ACTION_ICONS: Record<string, typeof Package> = {
  product: Package,
  order: ShoppingCart,
  customer: User,
  settings: Settings,
  'gift-card': Gift,
}

function getActionColor(action: string): string {
  if (action.includes('create') || action.includes('add')) return 'text-emerald-600'
  if (action.includes('delete') || action.includes('refund')) return 'text-destructive'
  if (action.includes('update') || action.includes('change')) return 'text-blue-600'
  return 'text-muted-foreground'
}

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

export default function AdminActivityPage() {
  const [entries, setEntries] = useState<ActivityEntry[]>([])
  const [mounted, setMounted] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)

  useEffect(() => {
    setMounted(true)
    setEntries(getActivityLog())
  }, [])

  const handleClear = () => {
    clearActivityLog()
    setEntries([])
    setShowClearDialog(false)
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold">Activity Log</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setEntries(getActivityLog())} variant="outline" size="sm" className="rounded-xl gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          {entries.length > 0 && (
            <Button onClick={() => setShowClearDialog(true)} variant="outline" size="sm" className="rounded-xl gap-1 text-destructive hover:text-destructive">
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {entries.length === 0 ? (
        <Card className="rounded-2xl p-12 text-center">
          <ClipboardList className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No activity recorded yet</p>
          <p className="text-xs text-muted-foreground mt-1">Actions will be logged as you manage the store</p>
        </Card>
      ) : (
        <Card className="rounded-2xl overflow-hidden">
          <div className="divide-y divide-border">
            {entries.map((entry) => {
              const Icon = ACTION_ICONS[entry.resource] || ClipboardList
              return (
                <div key={entry.id} className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className={`w-4 h-4 ${getActionColor(entry.action)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className={`font-medium ${getActionColor(entry.action)}`}>{entry.action}</span>
                      {entry.details && (
                        <span className="text-muted-foreground"> — {entry.details}</span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">{entry.resource}</Badge>
                      {entry.resourceId && (
                        <span className="text-[10px] text-muted-foreground font-mono">{entry.resourceId.slice(0, 8)}...</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                    {formatTimeAgo(entry.timestamp)}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Clear confirmation dialog */}
      <ConfirmDialog
        open={showClearDialog}
        onConfirm={handleClear}
        onCancel={() => setShowClearDialog(false)}
        title="Clear Activity Log"
        description="Are you sure you want to clear all activity history? This action cannot be undone."
        confirmLabel="Clear All"
        variant="warning"
      />
    </div>
  )
}
