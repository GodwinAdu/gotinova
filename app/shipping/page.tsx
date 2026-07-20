import { Header } from '@/components/header'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { Truck, Clock, Package, MapPin } from 'lucide-react'

export const metadata = {
  title: 'Shipping Policy - GotiNova',
  description: 'GotiNova shipping policy, delivery times, and costs.',
}

export default async function ShippingPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <>
      <Header user={session?.user} />
      <main className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">Shipping Policy</h1>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="p-6 bg-card border rounded-lg">
              <Truck className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">Standard Delivery</h3>
              <p className="text-muted-foreground text-sm">3-5 business days across Ghana. GH₵ 50 flat rate.</p>
            </div>
            <div className="p-6 bg-card border rounded-lg">
              <Clock className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">Express Delivery</h3>
              <p className="text-muted-foreground text-sm">1-2 business days in major cities. Additional charges apply.</p>
            </div>
            <div className="p-6 bg-card border rounded-lg">
              <Package className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">Free Shipping</h3>
              <p className="text-muted-foreground text-sm">On orders above GH₵ 1,000 within Ghana.</p>
            </div>
            <div className="p-6 bg-card border rounded-lg">
              <MapPin className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">Coverage</h3>
              <p className="text-muted-foreground text-sm">We deliver to all major cities and most areas in Ghana.</p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Delivery Times</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Accra, Kumasi, Tamale: 1-3 business days</li>
                <li>Other major cities: 3-5 business days</li>
                <li>Remote areas: 5-7 business days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Order Tracking</h2>
              <p>Once your order is shipped, you will receive a tracking number via email. You can track your order status from your account dashboard.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Delivery Issues</h2>
              <p>If your order has not arrived within the expected timeframe, please contact us at achaempomaatina352@gmail.com. We will investigate and resolve the issue promptly.</p>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
