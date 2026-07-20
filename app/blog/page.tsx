import { Header } from '@/components/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, ArrowRight, Calendar } from 'lucide-react'
import Link from 'next/link'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export const metadata = {
  title: 'Blog — Hair Care Tips | GotiNova',
  description: 'Expert hair care tips, wig maintenance guides, and styling tutorials from GotiNova.',
}

// Blog posts data — in production, this would come from a CMS or database
const BLOG_POSTS = [
  {
    slug: 'how-to-care-for-human-hair-wigs',
    title: 'How to Care for Human Hair Wigs',
    excerpt: 'Learn the essential steps to keep your human hair wig looking fresh and lasting longer. From washing to storage tips.',
    category: 'Wig Care',
    date: '2026-06-15',
    readTime: '5 min read',
    image: null,
  },
  {
    slug: 'choosing-the-right-wig-cap-size',
    title: 'Choosing the Right Wig Cap Size',
    excerpt: 'A complete guide to measuring your head and finding the perfect cap size for maximum comfort.',
    category: 'Buying Guide',
    date: '2026-06-10',
    readTime: '4 min read',
    image: null,
  },
  {
    slug: 'lace-front-vs-full-lace-wigs',
    title: 'Lace Front vs Full Lace Wigs: Which is Right for You?',
    excerpt: 'Understanding the differences between lace front and full lace wigs to make the best choice for your lifestyle.',
    category: 'Buying Guide',
    date: '2026-06-05',
    readTime: '6 min read',
    image: null,
  },
  {
    slug: 'protective-styles-for-natural-hair',
    title: '10 Protective Styles That Won\'t Damage Your Hair',
    excerpt: 'Discover protective hairstyles that keep your natural hair healthy while looking fabulous.',
    category: 'Styling',
    date: '2026-05-28',
    readTime: '7 min read',
    image: null,
  },
  {
    slug: 'how-to-install-lace-front-wig',
    title: 'How to Install a Lace Front Wig (Beginner Guide)',
    excerpt: 'Step-by-step instructions for installing your lace front wig at home for a natural, undetectable look.',
    category: 'Tutorials',
    date: '2026-05-20',
    readTime: '8 min read',
    image: null,
  },
  {
    slug: 'heat-damage-prevention-tips',
    title: 'Preventing Heat Damage: Tips for Wig & Extension Care',
    excerpt: 'How to use heat tools safely on your wigs and extensions without causing irreversible damage.',
    category: 'Wig Care',
    date: '2026-05-15',
    readTime: '5 min read',
    image: null,
  },
]

export default async function BlogPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <>
      <Header user={session?.user} />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/8 via-background to-accent/5 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">Hair Care Blog</h1>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto">
              Expert tips, tutorials, and guides for maintaining beautiful hair and wigs.
            </p>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {BLOG_POSTS.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`}>
                  <Card className="h-full rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all group">
                    {/* Image placeholder */}
                    <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-primary/30" />
                    </div>

                    <div className="p-4 sm:p-5 space-y-3">
                      {/* Category + Date */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {post.category}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-muted-foreground">{post.readTime}</span>
                        <span className="text-xs text-primary font-medium group-hover:underline flex items-center gap-1">
                          Read more <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-bold mb-2">Want personalized advice?</h2>
            <p className="text-sm text-muted-foreground mb-5">Chat with us on WhatsApp for custom hair recommendations.</p>
            <Button asChild className="rounded-xl">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  )
}
