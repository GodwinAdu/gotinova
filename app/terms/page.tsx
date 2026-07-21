import { Header } from '@/components/header'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { FileText, ShoppingBag, CreditCard, Truck, RotateCcw, Gift, Scale, AlertTriangle, Mail } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service - GotiNova',
  description: 'GotiNova terms and conditions governing the use of our e-commerce platform and services.',
}

export default async function TermsPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <>
      <Header user={session?.user} />
      <main className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-muted-foreground mb-10">
            Welcome to GotiNova. These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of our website, products, and services. By accessing or using GotiNova, you agree to be bound by these Terms. Please read them carefully before using our platform.
          </p>

          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  By accessing, browsing, or using the GotiNova website and any of its associated services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, you must not use our platform.
                </p>
                <p>
                  These Terms constitute a legally binding agreement between you (the &ldquo;Customer,&rdquo; &ldquo;User,&rdquo; or &ldquo;you&rdquo;) and GotiNova (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). We reserve the right to modify these Terms at any time, and such modifications shall be effective immediately upon posting on this page. Your continued use of the platform after any changes indicates your acceptance of the revised Terms.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">2. Account Registration</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  To access certain features of our platform, including placing orders and managing your purchase history, you may be required to create an account. When registering, you agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate, current, and complete information during the registration process</li>
                  <li>Maintain and promptly update your account information to keep it accurate and complete</li>
                  <li>Maintain the security and confidentiality of your login credentials</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account or any other breach of security</li>
                </ul>
                <p>
                  You must be at least 18 years of age to create an account. GotiNova reserves the right to suspend or terminate your account at our discretion if we suspect fraudulent activity, violation of these Terms, or any behavior that may harm other users or our business.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">3. Products &amp; Pricing</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  All products listed on GotiNova are priced in Ghana Cedis (GH₵). We make every effort to ensure that product descriptions, images, and prices displayed on our website are accurate. However, errors may occasionally occur.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Prices are subject to change without prior notice</li>
                  <li>Product images are for illustrative purposes and may vary slightly from the actual product in terms of color due to monitor settings</li>
                  <li>We reserve the right to correct any pricing errors, even after an order has been placed</li>
                  <li>Product availability is not guaranteed and items may be removed from the platform at any time</li>
                  <li>Promotional pricing and discounts are valid only for the specified duration and may be subject to additional terms</li>
                </ul>
                <p>
                  In the event of a pricing error on an order you have already placed, we will contact you to inform you of the correct price and give you the option to proceed or cancel the order.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">4. Orders &amp; Payment</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  When you place an order on GotiNova, you are making an offer to purchase the selected products subject to these Terms. All orders are subject to acceptance and availability.
                </p>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Payment Methods</h3>
                  <p>We accept the following payment methods through our secure payment partner, Paystack:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li><strong>Mobile Money:</strong> MTN Mobile Money, Vodafone Cash, AirtelTigo Money</li>
                    <li><strong>Bank Cards:</strong> Visa and Mastercard debit/credit cards</li>
                    <li><strong>Bank Transfer:</strong> Direct bank transfer via Paystack</li>
                    <li><strong>Cash on Delivery (COD):</strong> Pay in cash when your order is delivered (available for select locations)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Order Confirmation</h3>
                  <p>
                    After placing an order, you will receive an order confirmation via email and/or WhatsApp. This confirmation acknowledges receipt of your order but does not constitute acceptance. We reserve the right to decline or cancel any order for reasons including but not limited to: product unavailability, pricing errors, suspected fraud, or payment verification failure.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">5. Shipping &amp; Delivery</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  GotiNova delivers nationwide across Ghana. Standard delivery typically takes 2–5 business days depending on your location. Delivery times are estimates and not guaranteed — delays may occur due to factors beyond our control including weather, public holidays, or logistics challenges.
                </p>
                <p>
                  A standard shipping fee of GH₵ 50 applies to all orders. Orders with a subtotal of GH₵ 1,000 or more qualify for free standard delivery. Express delivery options may be available at additional cost for select locations. For full details, please see our <a href="/shipping" className="text-primary underline">Shipping Policy</a>.
                </p>
                <p>
                  Risk and title of products pass to you upon delivery. It is your responsibility to ensure someone is available at the delivery address to receive the package. If delivery is unsuccessful due to an incorrect address or unavailability, additional delivery charges may apply.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <RotateCcw className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">6. Returns &amp; Refunds</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Return Window</h3>
                  <p>
                    You may return eligible products within 7 days of delivery. To initiate a return, contact our customer support team with your order number and reason for return.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Return Conditions</h3>
                  <p>To be eligible for a return, items must:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Be unused, unworn, and in their original condition</li>
                    <li>Be in the original packaging with all tags and accessories intact</li>
                    <li>Not be items marked as &ldquo;Final Sale&rdquo; or &ldquo;Non-Returnable&rdquo;</li>
                    <li>Not show signs of use, damage, or alteration by the customer</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Refund Process</h3>
                  <p>
                    Once your returned item is received and inspected, we will notify you of the approval or rejection of your refund. Approved refunds will be processed within 5–7 business days to your original payment method. For Cash on Delivery orders, refunds will be processed via Mobile Money to the phone number on your account.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">7. Gift Cards &amp; Coupons</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>GotiNova may offer gift cards and promotional coupon codes subject to the following terms:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Gift cards are non-refundable and cannot be exchanged for cash</li>
                  <li>Gift cards do not expire unless otherwise stated at the time of purchase</li>
                  <li>Coupon codes are valid only during their specified promotional period and cannot be combined with other offers unless explicitly stated</li>
                  <li>We reserve the right to cancel or modify any promotion or coupon code at any time without prior notice</li>
                  <li>Gift cards and coupons are not replaceable if lost, stolen, or used without your authorization</li>
                  <li>Any remaining balance after a purchase stays on the gift card for future use</li>
                </ul>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">8. Intellectual Property</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  All content on the GotiNova website — including but not limited to text, graphics, logos, images, product photographs, videos, page layouts, and software — is the property of GotiNova or its content suppliers and is protected by applicable intellectual property laws.
                </p>
                <p>
                  You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any content from our website without our prior written consent, except for personal, non-commercial use such as viewing products and placing orders.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">9. Limitation of Liability</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  To the maximum extent permitted by applicable law, GotiNova and its directors, employees, partners, agents, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your access to, use of, or inability to access or use our services</li>
                  <li>Any conduct or content of any third party on our platform</li>
                  <li>Any content obtained from our services</li>
                  <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                  <li>Delays or failures in delivery by our logistics partners</li>
                </ul>
                <p>
                  In no event shall our total liability to you for all claims exceed the amount you paid to GotiNova for the specific product or service giving rise to the claim.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">10. Termination</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  We may terminate or suspend your account and access to our services immediately, without prior notice or liability, for any reason, including but not limited to a breach of these Terms. Upon termination, your right to use the platform will immediately cease.
                </p>
                <p>
                  You may also terminate your account at any time by contacting our customer support team. Upon termination, any outstanding orders will be fulfilled unless cancelled by mutual agreement. Provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">11. Governing Law</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  These Terms of Service shall be governed by and construed in accordance with the laws of the Republic of Ghana, without regard to its conflict of law provisions. Any disputes arising out of or relating to these Terms or your use of our services shall be subject to the exclusive jurisdiction of the courts of Ghana.
                </p>
                <p>
                  In the event of any dispute, both parties agree to first attempt resolution through good-faith negotiation. If the dispute cannot be resolved through negotiation within 30 days, either party may pursue legal remedies available under Ghanaian law.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">12. Contact Us</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  If you have any questions or concerns about these Terms of Service, please do not hesitate to contact us:
                </p>
                <div className="bg-card border rounded-lg p-4 space-y-2">
                  <p><strong>GotiNova</strong></p>
                  <p>Kumasi, Ghana</p>
                  <p>Email: achaempomaatina352@gmail.com</p>
                  <p>Phone/WhatsApp: +233 24 959 5624</p>
                </div>
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
