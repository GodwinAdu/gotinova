'use client'

/**
 * Product Structured Data (JSON-LD)
 * 
 * Adds schema.org Product markup for Google rich snippets.
 * This helps your products appear with price, rating, and availability in search results.
 */

interface ProductStructuredDataProps {
  name: string
  description: string | null
  price: number
  originalPrice?: number
  image: string | null
  rating: number
  reviewCount: number | null
  inStock: boolean
  sku?: string | null
  brand?: string
  url?: string
}

export function ProductStructuredData({
  name,
  description,
  price,
  originalPrice,
  image,
  rating,
  reviewCount,
  inStock,
  sku,
  brand = 'LuxeHair',
  url,
}: ProductStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: description || `${name} — Premium quality from LuxeHair`,
    image: image || undefined,
    sku: sku || undefined,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    offers: {
      '@type': 'Offer',
      url: url || (typeof window !== 'undefined' ? window.location.href : undefined),
      priceCurrency: 'GHS',
      price: price.toFixed(2),
      ...(originalPrice && { priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    ...(rating > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.toFixed(1),
        reviewCount: reviewCount || 1,
        bestRating: '5',
        worstRating: '1',
      },
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
