import { Header } from '@/components/header'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { Truck, Clock, Package, MapPin, Globe, AlertCircle, MessageCircle, CheckCircle } from 'lucide-react'

export const metadata = {
  title: 'Shipping & Delivery - GotiNova',
  description: 'GotiNova shipping rates, delivery times, and coverage information for all regions in Ghana.',
}

export default async function ShippingPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <>
      <Header user={session?.user} />
      <main className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Truck className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">Shipping &amp; Delivery</h1>
          </div>
          <p className="text-muted-foreground mb-10">
            At GotiNova, we are committed to delivering your orders safely and promptly. We deliver nationwide across all regions of Ghana. Below you will find detailed information about our shipping rates, delivery times, and policies.
          </p>

          {/* Quick Info Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="p-6 bg-card border rounded-lg">
              <Truck className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">Standard Delivery</h3>
              <p className="text-muted-foreground text-sm">GH₵ 50 flat rate for all orders under GH₵ 1,000. Delivered within 2–5 business days depending on location.</p>
            </div>
            <div className="p-6 bg-card border rounded-lg">
              <Package className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">Free Shipping</h3>
              <p className="text-muted-foreground text-sm">Enjoy free standard delivery on all orders with a subtotal of GH₵ 1,000 or more. Automatically applied at checkout.</p>
            </div>
            <div className="p-6 bg-card border rounded-lg">
              <Clock className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">Same-Day Processing</h3>
              <p className="text-muted-foreground text-sm">Orders placed before 2:00 PM are processed and dispatched the same business day.</p>
            </div>
            <div className="p-6 bg-card border rounded-lg">
              <MapPin className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">Nationwide Coverage</h3>
              <p className="text-muted-foreground text-sm">We deliver to all 16 regions of Ghana including remote and rural communities.</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Delivery Coverage</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  GotiNova delivers to all 16 regions of Ghana. Whether you are in a major city or a rural area, we will get your order to you. Our logistics network covers:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Greater Accra, Ashanti, Western, Central, and Eastern Regions</li>
                  <li>Volta, Oti, Northern, and North East Regions</li>
                  <li>Upper East, Upper West, Savannah, and Bono Regions</li>
                  <li>Bono East, Ahafo, and Western North Regions</li>
                </ul>
                <p>
                  For deliveries to more remote areas, additional transit time may be required. We will always communicate expected delivery timelines at checkout and through order updates.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">Shipping Rates</h2>
              <div className="space-y-3 text-muted-foreground">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-left p-3 font-semibold text-foreground">Order Value</th>
                        <th className="text-left p-3 font-semibold text-foreground">Shipping Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-3">Below GH₵ 1,000</td>
                        <td className="p-3">GH₵ 50 (flat rate)</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">GH₵ 1,000 and above</td>
                        <td className="p-3 font-semibold text-green-600">Free Delivery</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  Shipping fees are calculated and displayed at checkout before you complete your order. The free shipping threshold is based on the order subtotal before any coupon or discount deductions.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Delivery Times by Region</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>Estimated delivery times from the date of dispatch:</p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-left p-3 font-semibold text-foreground">Destination</th>
                        <th className="text-left p-3 font-semibold text-foreground">Estimated Delivery</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-3">Kumasi (Local)</td>
                        <td className="p-3">1–2 business days</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">Accra &amp; Tema</td>
                        <td className="p-3">2–3 business days</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">Other major cities (Cape Coast, Takoradi, Tamale, Sunyani, Ho)</td>
                        <td className="p-3">3–5 business days</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">Remote &amp; rural areas</td>
                        <td className="p-3">5–7 business days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  Please note that these are estimated timeframes. Actual delivery may vary due to factors such as public holidays, adverse weather conditions, or high order volumes during promotional periods. We will notify you promptly if any significant delays are expected.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">Order Processing</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  We process orders as quickly as possible to get your products to you without unnecessary delay:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Orders placed before 2:00 PM (GMT):</strong> Processed and dispatched the same business day</li>
                  <li><strong>Orders placed after 2:00 PM (GMT):</strong> Processed and dispatched the next business day</li>
                  <li><strong>Orders placed on weekends or public holidays:</strong> Processed on the next available business day</li>
                </ul>
                <p>
                  Once your order has been dispatched, you will receive a notification via email and/or WhatsApp with your tracking information. Processing times do not include delivery transit time.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Order Tracking</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  We keep you informed at every stage of your delivery. You can track your order through the following channels:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Account Dashboard:</strong> Log into your GotiNova account to view real-time order status updates, including processing, dispatched, in transit, and delivered stages</li>
                  <li><strong>WhatsApp Updates:</strong> Receive delivery notifications and updates directly on WhatsApp. You can also message us at +233 24 959 5624 to inquire about your order status</li>
                  <li><strong>Email Notifications:</strong> Automated email updates are sent at each major stage of your order — confirmation, dispatch, and delivery</li>
                </ul>
                <p>
                  If you have not received any updates within 48 hours of placing your order, please contact our customer support team for assistance.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">Delivery Partners</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  GotiNova partners with reliable logistics providers across Ghana to ensure your orders are delivered safely and on time. Our delivery network includes both established courier services and local delivery agents who understand the terrain and communities they serve.
                </p>
                <p>
                  All packages are carefully packed and sealed to protect your products during transit. Fragile or premium items may receive additional protective packaging at no extra cost.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Failed Delivery Attempts</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>If a delivery attempt is unsuccessful, the following steps apply:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>First attempt:</strong> If you are unavailable, our delivery partner will attempt to reach you by phone. They may leave the package with a trusted person at the address if you authorize it</li>
                  <li><strong>Second attempt:</strong> A second delivery attempt will be made within 1–2 business days at no additional cost</li>
                  <li><strong>After two failed attempts:</strong> The package will be returned to our facility. We will contact you to arrange a new delivery date, which may incur an additional delivery fee of GH₵ 50</li>
                </ul>
                <p>
                  To avoid failed deliveries, please ensure your delivery address is accurate and that someone is available to receive the package. You can also provide an alternative phone number or delivery instructions in the order notes at checkout.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Delivery Confirmation</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Upon successful delivery, you may be asked to confirm receipt. For Cash on Delivery (COD) orders, payment is collected at the time of delivery. Please ensure you have the exact amount ready as our delivery partners may not carry change for large denominations.
                </p>
                <p>
                  We recommend inspecting your package upon delivery. If you notice any damage to the outer packaging, please note this with the delivery agent and contact us immediately. Claims for damaged items must be reported within 24 hours of delivery.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">International Shipping</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <div className="bg-muted/50 border rounded-lg p-4">
                  <p className="font-semibold text-foreground mb-2">Coming Soon</p>
                  <p>
                    International shipping is not currently available. We are actively working on expanding our delivery network to serve customers outside Ghana. If you are interested in international orders, please contact us at achaempomaatina352@gmail.com and we will notify you as soon as this service becomes available.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">Questions About Your Delivery?</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  If you have any questions about shipping, need to update your delivery address, or experience any issues with your order, please do not hesitate to reach out:
                </p>
                <div className="bg-card border rounded-lg p-4 space-y-2">
                  <p><strong>GotiNova Customer Support</strong></p>
                  <p>Email: achaempomaatina352@gmail.com</p>
                  <p>Phone/WhatsApp: +233 24 959 5624</p>
                  <p>Location: Kumasi, Ghana</p>
                  <p className="text-sm mt-2">Support hours: Monday–Saturday, 8:00 AM – 6:00 PM (GMT)</p>
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
