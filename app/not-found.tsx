import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        <div>
          <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
          <h2 className="text-2xl font-bold text-foreground">Page Not Found</h2>
        </div>
        
        <p className="text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="space-y-3">
          <Link href="/" className="block">
            <Button className="w-full bg-primary hover:bg-primary/90">Go to Home</Button>
          </Link>
          <Link href="/products" className="block">
            <Button variant="outline" className="w-full">Browse Products</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
