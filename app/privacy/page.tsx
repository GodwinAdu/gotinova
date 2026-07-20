import { Header } from '@/components/header'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export const metadata = {
  title: 'Privacy Policy - LuxeHair',
  description: 'LuxeHair privacy policy and data handling practices.',
}

export default async function PrivacyPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <>
      <Header user={session?.user} />
      <main className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

          <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This includes your name, email address, shipping address, and payment information.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
              <p>We use the information we collect to process orders, communicate with you about your account, provide customer support, and improve our services.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Information Sharing</h2>
              <p>We do not sell or share your personal information with third parties except as necessary to process your orders (e.g., shipping carriers) or as required by law.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Security</h2>
              <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Cookies</h2>
              <p>We use cookies to maintain your session and preferences. You can disable cookies in your browser settings, but some features may not work properly.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Contact Us</h2>
              <p>If you have questions about this privacy policy, please contact us at support@luxehair.com.</p>
            </section>

            <p className="text-xs mt-8">Last updated: January 2025</p>
          </div>
        </div>
      </main>
    </>
  )
}
