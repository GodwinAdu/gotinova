import { Header } from '@/components/header'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { Shield, Lock, Eye, UserCheck, Cookie, Baby, Bell, Mail } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy - GotiNova',
  description: 'GotiNova privacy policy — how we collect, use, and protect your personal information.',
}

export default async function PrivacyPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <>
      <Header user={session?.user} />
      <main className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground mb-10">
            At GotiNova, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you visit our website, create an account, or make a purchase. Please read this policy carefully to understand our practices regarding your personal data.
          </p>

          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">1. Information We Collect</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Personal Information</h3>
                  <p>
                    When you create an account, place an order, or interact with our services, we may collect personal information including but not limited to: your full name, email address, phone number (including WhatsApp number), residential or delivery address, date of birth (if provided), and any other information you voluntarily provide to us through forms, customer support interactions, or account settings.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Payment Information</h3>
                  <p>
                    When you make a purchase, payment information is collected and processed securely through our payment partner, Paystack. This may include mobile money account details, debit/credit card numbers, bank account information, and transaction records. GotiNova does not directly store your full payment credentials on our servers — this data is handled by Paystack in compliance with Payment Card Industry Data Security Standards (PCI DSS).
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Device &amp; Usage Data</h3>
                  <p>
                    We automatically collect certain information when you access our website, including your IP address, browser type and version, operating system, device identifiers, referring URLs, pages viewed, time spent on pages, click patterns, and other diagnostic data. This information helps us understand how our platform is used and allows us to improve your shopping experience.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">2. How We Use Your Information</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>We use the information we collect for the following purposes:</p>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Order Processing &amp; Fulfillment</h3>
                  <p>
                    To process and fulfill your orders, manage payments through Paystack (including Mobile Money, card payments, and bank transfers), arrange delivery to your specified address, send order confirmations and shipping updates via email or WhatsApp, and handle returns or refunds where applicable.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Communication</h3>
                  <p>
                    To respond to your inquiries and customer support requests, send transactional emails (order confirmations, shipping notifications, delivery updates), notify you of changes to our services or policies, and, with your consent, send promotional offers, new product announcements, and marketing communications. You may opt out of marketing communications at any time.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Service Improvement</h3>
                  <p>
                    To analyze usage patterns and trends, improve our website functionality and user experience, personalize product recommendations and content, conduct internal research and analytics, and prevent fraudulent transactions and enhance platform security.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">3. Information Sharing &amp; Disclosure</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  GotiNova does not sell, trade, or rent your personal information to third parties for their marketing purposes. We may share your information only in the following circumstances:
                </p>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Payment Processors</h3>
                  <p>
                    We share necessary transaction data with Paystack to process your payments securely. Paystack operates under strict data protection and PCI DSS compliance standards.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Delivery Partners</h3>
                  <p>
                    We share your name, phone number, and delivery address with our logistics and courier partners solely for the purpose of delivering your orders.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Legal Requirements</h3>
                  <p>
                    We may disclose your information if required to do so by law, regulation, or legal process, or if we believe in good faith that such disclosure is necessary to protect our rights, your safety, or the safety of others, investigate fraud, or respond to a government request.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">4. Data Security</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  We take the security of your personal information seriously and implement appropriate technical and organizational measures to protect it against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>SSL/TLS encryption for all data transmitted between your browser and our servers</li>
                  <li>Secure password hashing and storage</li>
                  <li>Regular security assessments and vulnerability testing</li>
                  <li>Access controls limiting employee access to personal data on a need-to-know basis</li>
                  <li>PCI DSS compliance through our payment partner Paystack, ensuring your financial data is handled to the highest industry standards</li>
                </ul>
                <p>
                  While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security but are committed to maintaining the highest practicable standards.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Cookie className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">5. Cookies &amp; Tracking Technologies</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Our website uses cookies and similar tracking technologies to enhance your browsing experience. Cookies are small text files stored on your device that help us recognize you, remember your preferences, and understand how you use our platform.
                </p>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Types of Cookies We Use</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Essential Cookies:</strong> Required for the website to function properly, including maintaining your shopping cart and user session.</li>
                    <li><strong>Functional Cookies:</strong> Remember your preferences such as language, currency display, and recently viewed products.</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website, which pages are most popular, and how we can improve navigation and content.</li>
                  </ul>
                </div>
                <p>
                  You can control cookies through your browser settings. Disabling certain cookies may affect the functionality of our website, particularly features like your shopping cart and account login.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">6. Your Rights</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Right of Access:</strong> You may request a copy of the personal information we hold about you.</li>
                  <li><strong>Right to Correction:</strong> You may request that we correct any inaccurate or incomplete personal information.</li>
                  <li><strong>Right to Deletion:</strong> You may request that we delete your personal information, subject to our legal obligations to retain certain data (such as transaction records for tax purposes).</li>
                  <li><strong>Right to Withdraw Consent:</strong> Where we process your data based on consent (such as marketing emails), you may withdraw that consent at any time.</li>
                  <li><strong>Right to Data Portability:</strong> You may request your data in a structured, commonly used format.</li>
                </ul>
                <p>
                  To exercise any of these rights, please contact us using the details provided at the bottom of this policy. We will respond to your request within 30 days.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Baby className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">7. Children&apos;s Privacy</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe that your child has provided us with personal information without your consent, please contact us immediately. If we become aware that we have collected personal data from a child without appropriate parental consent, we will take steps to delete that information from our servers promptly.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">8. Changes to This Policy</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  GotiNova reserves the right to update or modify this Privacy Policy at any time. When we make changes, we will revise the &ldquo;Last Updated&rdquo; date at the bottom of this page. For significant changes that materially affect how we handle your personal information, we will notify you via email or a prominent notice on our website prior to the change becoming effective. Your continued use of our services after such modifications constitutes your acknowledgment of the revised policy.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">9. Contact Us</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-card border rounded-lg p-4 space-y-2">
                  <p><strong>GotiNova</strong></p>
                  <p>Kumasi, Ghana</p>
                  <p>Email: achaempomaatina352@gmail.com</p>
                  <p>Phone/WhatsApp: +233 24 959 5624</p>
                </div>
                <p>
                  We aim to respond to all privacy-related inquiries within 7 business days.
                </p>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-xs text-muted-foreground">Last Updated: July 2026</p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
