'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[v0] Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-destructive mb-2">Oops!</h1>
          <h2 className="text-xl font-bold text-foreground">Something went wrong</h2>
        </div>
        
        <div className="bg-muted p-4 rounded text-left text-sm text-muted-foreground font-mono">
          <p className="line-clamp-3">{error.message || 'An unexpected error occurred'}</p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => reset()}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="w-full"
          >
            Go to Home
          </Button>
        </div>
      </Card>
    </div>
  )
}
