import { Header } from '@/components/header'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export const metadata = {
  title: 'Terms of Service - LuxeHair',
  description: 'LuxeHair terms and conditions of use.',
}

export default async function TermsPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <>
      <Header user={session?.user} />
      <main className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

          <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using LuxeHair, you accept and agree to be bound by these terms of service. If you do not agree to these terms, please do not use our services.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Products and Pricing</h2>
              <p>All prices are listed in Pakistani Rupees (PKR). We reserve the right to modify prices at any time. Product availability is subject to change without notice.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Orders and Payments</h2>
              <p>We accept Cash on Delivery (COD) and advance payment methods. All orders are subject to verification and acceptance. We reserve the right to cancel any order.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Returns and Refunds</h2>
              <p>Products may be returned within 7 days of delivery if they are unused and in original packaging. Refunds will be processed within 5-7 business days after receiving the returned item.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Account Responsibility</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Limitation of Liability</h2>
              <p>LuxeHair shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services or products.</p>
            </section>

            <p className="text-xs mt-8">Last updated: January 2025</p>
          </div>
        </div>
      </main>
    </>
  )
}
