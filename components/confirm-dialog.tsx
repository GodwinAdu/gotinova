'use client'

import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null

  const iconColor = variant === 'danger' ? 'text-destructive' : variant === 'warning' ? 'text-amber-500' : 'text-primary'
  const iconBg = variant === 'danger' ? 'bg-destructive/10' : variant === 'warning' ? 'bg-amber-500/10' : 'bg-primary/10'
  const confirmBtnClass = variant === 'danger'
    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
    : variant === 'warning'
    ? 'bg-amber-500 text-white hover:bg-amber-600'
    : ''

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 slide-in-from-bottom-2 duration-200">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center mb-4`}>
          {variant === 'danger' ? (
            <Trash2 className={`w-6 h-6 ${iconColor}`} />
          ) : (
            <AlertTriangle className={`w-6 h-6 ${iconColor}`} />
          )}
        </div>

        {/* Content */}
        <h2 className="text-lg font-semibold text-foreground mb-1.5">{title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{description}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-xl ${confirmBtnClass}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Deleting...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
