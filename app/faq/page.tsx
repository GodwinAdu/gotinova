import { Header } from '@/components/header'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export const metadata = {
  title: 'FAQ - GotiNova',
  description: 'Frequently asked questions about GotiNova products and services.',
}

const faqs = [
  {
    question: 'What types of hair do you offer?',
    answer: 'We offer Brazilian, Malaysian, Peruvian, and Indian hair in various textures including straight, body wave, loose wave, deep wave, and curly. We also carry HD lace closures, frontals, and ready-to-wear wigs.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 3-5 business days within Ghana. Express delivery (1-2 days) is available for major cities. Orders above GH₵ 1,000 qualify for free shipping.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We accept returns within 7 days of delivery for unused products in their original packaging. Please contact our support team to initiate a return.',
  },
  {
    question: 'How do I track my order?',
    answer: 'Once your order is shipped, you will receive a tracking number via email. You can also view your order status by logging into your account and visiting the Orders page.',
  },
  {
    question: 'Do you offer Cash on Delivery?',
    answer: 'Yes, we offer Cash on Delivery (COD) for all orders within Ghana. You can also choose to pay in advance via mobile money or bank transfer.',
  },
  {
    question: 'How do I care for my hair extensions?',
    answer: 'Wash gently with sulfate-free shampoo, condition regularly, detangle from ends to roots with a wide-tooth comb, and air dry when possible. Avoid excessive heat styling to maintain longevity.',
  },
  {
    question: 'Are your products authentic?',
    answer: 'Yes, all our products are 100% authentic and sourced from verified suppliers. Each product undergoes quality inspection before being listed in our store.',
  },
  {
    question: 'Can I cancel my order?',
    answer: 'Orders can be cancelled before they are shipped. Once shipped, you will need to wait for delivery and then initiate a return. Contact achaempomaatina352@gmail.com for cancellation requests.',
  },
]

export default async function FAQPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <>
      <Header user={session?.user} />
      <main className="min-h-screen bg-background">
        <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-16">
          <div className="container max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Find answers to common questions about our products and services.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container max-w-3xl mx-auto px-4">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card border rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12 p-6 bg-card border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Still have questions?</h3>
              <p className="text-muted-foreground mb-4">
                Can&apos;t find what you&apos;re looking for? Contact our support team.
              </p>
              <p className="text-primary font-medium">achaempomaatina352@gmail.com</p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
