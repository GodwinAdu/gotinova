'use client'

import { Star, Quote } from 'lucide-react'
import { Card } from '@/components/ui/card'

const TESTIMONIALS = [
  {
    name: 'Akua M.',
    location: 'Accra',
    rating: 5,
    text: 'The quality of the wig I bought is incredible! It looks so natural and the delivery was super fast. Will definitely order again.',
    product: 'Premium 24" Human Hair Wig',
  },
  {
    name: 'Nana K.',
    location: 'Kumasi',
    rating: 5,
    text: 'Best online store I\'ve ever shopped from in Ghana. The customer service via WhatsApp was so helpful in choosing the right product.',
    product: 'HD Lace Front 20" Wig',
  },
  {
    name: 'Efua A.',
    location: 'Takoradi',
    rating: 4,
    text: 'Great products at fair prices. The braiding hair was exactly as described. Shipping took 3 days to Takoradi which is reasonable.',
    product: 'Curly Braiding Hair Pack',
  },
  {
    name: 'Yaw B.',
    location: 'Tema',
    rating: 5,
    text: 'Bought a gift card for my sister and she loved it! The whole process was smooth and the website is so easy to use.',
    product: 'Gift Card',
  },
]

export function Testimonials() {
  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">What Our Customers Say</h2>
          <p className="text-sm text-muted-foreground mt-2">Real reviews from real customers</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <Card key={i} className="p-5 rounded-2xl space-y-3 hover:shadow-lg transition-shadow">
              {/* Quote icon */}
              <Quote className="w-6 h-6 text-primary/20" />

              {/* Rating */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    className={`w-3.5 h-3.5 ${j < t.rating ? 'fill-amber-400 text-amber-400' : 'text-border'}`}
                  />
                ))}
              </div>

              {/* Review text */}
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                &quot;{t.text}&quot;
              </p>

              {/* Author */}
              <div className="pt-2 border-t border-border">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-[11px] text-muted-foreground">{t.location} • {t.product}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
