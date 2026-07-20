import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Clock, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { notFound } from 'next/navigation'

// Blog content — in production this would come from a CMS/DB
const BLOG_CONTENT: Record<string, { title: string; category: string; date: string; readTime: string; content: string }> = {
  'how-to-care-for-human-hair-wigs': {
    title: 'How to Care for Human Hair Wigs',
    category: 'Wig Care',
    date: '2026-06-15',
    readTime: '5 min read',
    content: `
      <h2>Why Proper Wig Care Matters</h2>
      <p>A high-quality human hair wig is an investment. With proper care, your wig can last 1-2 years or even longer. Here's how to keep it looking salon-fresh.</p>
      
      <h2>Washing Your Wig</h2>
      <p><strong>How often:</strong> Wash every 7-10 wears, or when product buildup is noticeable.</p>
      <ol>
        <li>Gently detangle with a wide-tooth comb, starting from the ends</li>
        <li>Fill a basin with lukewarm water and add sulfate-free shampoo</li>
        <li>Submerge the wig and gently swish — don't rub or twist</li>
        <li>Rinse thoroughly with cool water</li>
        <li>Apply conditioner from mid-lengths to ends, leave for 5 minutes</li>
        <li>Rinse and gently squeeze out excess water with a towel</li>
      </ol>

      <h2>Drying</h2>
      <p>Always air dry on a wig stand. Never use a blow dryer on high heat. If you must use heat, apply a heat protectant spray first and use the lowest setting.</p>

      <h2>Storage Tips</h2>
      <ul>
        <li>Store on a wig stand or mannequin head to maintain shape</li>
        <li>Keep away from direct sunlight and heat sources</li>
        <li>Cover with a silk or satin bag when not in use</li>
        <li>Never store wet — always ensure it's completely dry</li>
      </ul>

      <h2>Styling</h2>
      <p>Human hair wigs can be styled just like your natural hair. You can curl, straighten, and even color them. However:</p>
      <ul>
        <li>Always use heat protectant before using hot tools</li>
        <li>Keep heat below 180°C / 350°F</li>
        <li>Avoid daily heat styling — give your wig rest days</li>
        <li>Use leave-in conditioner for moisture between washes</li>
      </ul>

      <h2>Products We Recommend</h2>
      <p>Use products specifically designed for wigs or sulfate-free, gentle hair care products. Avoid anything with alcohol as it can dry out the hair fibers.</p>
    `,
  },
  'choosing-the-right-wig-cap-size': {
    title: 'Choosing the Right Wig Cap Size',
    category: 'Buying Guide',
    date: '2026-06-10',
    readTime: '4 min read',
    content: `
      <h2>Why Cap Size Matters</h2>
      <p>A wig that doesn't fit properly can be uncomfortable and look unnatural. Getting the right cap size ensures your wig stays secure and looks seamless.</p>

      <h2>How to Measure Your Head</h2>
      <p>You'll need a soft measuring tape. Measure in inches or centimeters:</p>
      <ol>
        <li><strong>Circumference:</strong> Measure around your head at the hairline — from forehead, behind ears, around the nape, and back to the front</li>
        <li><strong>Front to back:</strong> From your front hairline to the nape of your neck</li>
        <li><strong>Ear to ear:</strong> From one ear over the top of your head to the other ear</li>
      </ol>

      <h2>Standard Sizes</h2>
      <p><strong>Small:</strong> 21.5" (54.5 cm) — Less common, for petite heads</p>
      <p><strong>Medium:</strong> 22.5" (57 cm) — Most common, fits the majority of women</p>
      <p><strong>Large:</strong> 23.5" (59.5 cm) — For larger head sizes</p>

      <h2>Tips for the Perfect Fit</h2>
      <ul>
        <li>Most of our wigs come with adjustable straps at the nape for fine-tuning</li>
        <li>If you're between sizes, go for the larger size and adjust with straps</li>
        <li>Wig caps can add slight bulk — wear your wig cap when measuring</li>
        <li>Bobby pins and wig clips can help secure a slightly loose wig</li>
      </ul>
    `,
  },
}

// Fallback for posts without full content
const FALLBACK_CONTENT = `
  <p>This article is coming soon. Check back later for the full content!</p>
  <p>In the meantime, browse our collection or contact us with any questions.</p>
`

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  const post = BLOG_CONTENT[slug]
  if (!post) {
    // Check if it's a known slug without content
    const knownSlugs = ['lace-front-vs-full-lace-wigs', 'protective-styles-for-natural-hair', 'how-to-install-lace-front-wig', 'heat-damage-prevention-tips']
    if (!knownSlugs.includes(slug)) {
      notFound()
    }
  }

  const title = post?.title || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  const content = post?.content || FALLBACK_CONTENT

  return (
    <>
      <Header user={session?.user} />
      <main className="min-h-screen bg-background">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Back link */}
          <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-8">
            {post?.category && (
              <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {post.category}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-4 leading-tight">
              {title}
            </h1>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              {post?.date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
              {post?.readTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTime}
                </span>
              )}
            </div>
          </header>

          {/* Content */}
          <div
            className="prose prose-sm sm:prose-base max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Footer CTA */}
          <div className="mt-12 p-6 bg-primary/5 border border-primary/10 rounded-2xl text-center">
            <h3 className="font-bold text-lg mb-2">Ready to shop?</h3>
            <p className="text-sm text-muted-foreground mb-4">Browse our premium collection of wigs and hair extensions.</p>
            <Button asChild className="rounded-xl">
              <Link href="/products">Shop Now</Link>
            </Button>
          </div>
        </article>
      </main>
    </>
  )
}
