import { Metadata } from 'next'
import { db } from '@/lib/db'
import { products, categories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params

  try {
    const result = await db.select().from(products).where(eq(products.id, id))

    if (!result.length) {
      return {
        title: 'Product Not Found — LuxeHair',
        description: 'The product you are looking for does not exist.',
      }
    }

    const product = result[0]

    // Get category name
    let categoryName = ''
    if (product.categoryId) {
      const cat = await db.select().from(categories).where(eq(categories.id, product.categoryId))
      categoryName = cat.length > 0 ? cat[0].name : ''
    }

    const price = parseFloat(product.price)
    const title = `${product.name} — LuxeHair`
    const description = product.description
      ? product.description.slice(0, 160)
      : `Shop ${product.name} at LuxeHair. ${categoryName ? `Category: ${categoryName}.` : ''} Premium quality hair products. GH₵ ${price.toFixed(2)}.`

    return {
      title,
      description,
      openGraph: {
        title: product.name,
        description,
        type: 'website',
        images: product.image ? [{ url: product.image, width: 800, height: 800, alt: product.name }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description,
        images: product.image ? [product.image] : [],
      },
      other: {
        'product:price:amount': price.toString(),
        'product:price:currency': 'GHS',
        'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
      },
    }
  } catch {
    return {
      title: 'Product — LuxeHair',
      description: 'Premium hair and wig products from LuxeHair.',
    }
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
