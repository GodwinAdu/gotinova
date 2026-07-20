'use client'

import { Check, Package, Truck, Home, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrderTimelineProps {
  status: string | null
  createdAt?: Date | string
  className?: string
}

const STEPS = [
  { id: 'pending', label: 'Order Placed', icon: Clock, description: 'Your order has been received' },
  { id: 'processing', label: 'Processing', icon: Package, description: 'Preparing your items' },
  { id: 'shipped', label: 'Shipped', icon: Truck, description: 'On the way to you' },
  { id: 'delivered', label: 'Delivered', icon: Home, description: 'Order completed' },
]

function getStepIndex(status: string | null): number {
  const statusMap: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    processing: 1,
    shipped: 2,
    delivered: 3,
  }
  return statusMap[status || 'pending'] ?? 0
}

export function OrderTimeline({ status, createdAt, className }: OrderTimelineProps) {
  const currentStep = getStepIndex(status)
  const isCancelled = status === 'cancelled'

  if (isCancelled) {
    return (
      <div className={cn('flex items-center gap-3 p-4 bg-destructive/10 rounded-2xl', className)}>
        <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
          <XCircle className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <p className="font-medium text-destructive">Order Cancelled</p>
          <p className="text-xs text-muted-foreground">This order has been cancelled</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-0', className)}>
      {/* Horizontal timeline for desktop */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between relative">
          {/* Progress bar background */}
          <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-border" />
          {/* Active progress bar */}
          <div
            className="absolute top-5 left-[10%] h-0.5 bg-primary transition-all duration-500"
            style={{ width: `${Math.min(currentStep / (STEPS.length - 1), 1) * 80}%` }}
          />

          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isCompleted = index <= currentStep
            const isCurrent = index === currentStep

            return (
              <div key={step.id} className="flex flex-col items-center relative z-10 flex-1">
                {/* Circle */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                    isCompleted
                      ? 'bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20'
                      : 'bg-card border-border text-muted-foreground'
                  )}
                >
                  {isCompleted && index < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* Label */}
                <p className={cn(
                  'text-xs font-medium mt-2 text-center',
                  isCompleted ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {step.label}
                </p>

                {/* Description — show only for current step */}
                {isCurrent && (
                  <p className="text-[10px] text-primary font-medium mt-0.5 text-center">
                    {step.description}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Vertical timeline for mobile */}
      <div className="sm:hidden space-y-0">
        {STEPS.map((step, index) => {
          const Icon = step.icon
          const isCompleted = index <= currentStep
          const isCurrent = index === currentStep
          const isLast = index === STEPS.length - 1

          return (
            <div key={step.id} className="flex gap-3">
              {/* Line + circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0',
                    isCompleted
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-card border-border text-muted-foreground'
                  )}
                >
                  {isCompleted && index < currentStep ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                {!isLast && (
                  <div className={cn(
                    'w-0.5 h-8 my-0.5',
                    index < currentStep ? 'bg-primary' : 'bg-border'
                  )} />
                )}
              </div>

              {/* Content */}
              <div className="pb-6 pt-1">
                <p className={cn(
                  'text-sm font-medium leading-none',
                  isCompleted ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-xs text-primary mt-1">{step.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
