import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Heart, Sparkles, Shield } from 'lucide-react'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export const metadata = {
  title: 'About LuxeHair',
  description: 'Learn about our premium hair and wig collection',
}

export default async function AboutPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <>
      <Header user={session?.user} />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-20">
          <div className="container max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4 text-balance">About LuxeHair</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Premium quality hair and wigs for every style, every person, every occasion
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-20">
          <div className="container max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Our Story</h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              LuxeHair was founded with a simple mission: to provide premium quality hairpieces that
              enhance confidence and self-expression. We believe that everyone deserves to feel
              beautiful and confident, regardless of their hair journey.
            </p>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Our carefully curated collection features authentic, high-quality wigs and hair
              extensions sourced from trusted suppliers worldwide. Each product is inspected to
              ensure it meets our rigorous quality standards before reaching our customers.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Whether you&apos;re looking for a everyday style, a glamorous transformation, or
              medical solutions, LuxeHair has the perfect solution for you.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-card border-y">
          <div className="container max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Quality</h3>
                <p className="text-muted-foreground">
                  We maintain the highest standards for all our products, ensuring authentic and
                  durable hairpieces that last.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Customer First</h3>
                <p className="text-muted-foreground">
                  Your satisfaction is our priority. We provide exceptional customer service and
                  support every step of the way.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Trustworthy</h3>
                <p className="text-muted-foreground">
                  We believe in transparency, honest pricing, and reliable delivery. Your trust is
                  everything to us.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Look?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Explore our premium collection of hair and wigs today
            </p>
            <Button asChild size="lg">
              <Link href="/products">Shop Now</Link>
            </Button>
          </div>
        </section>

        {/* Contact */}
        <section className="py-20 bg-card border-t">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Have questions? We&apos;d love to hear from you
            </p>
            <div className="space-y-2">
              <p className="text-muted-foreground">Email: support@luxehair.com</p>
              <p className="text-muted-foreground">Phone: 1-800-HAIR-LUX</p>
              <p className="text-muted-foreground">Hours: Monday - Friday, 9AM - 6PM EST</p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
