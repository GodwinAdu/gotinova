export const dynamic = 'force-static'

export async function GET() {
  const robots = `User-agent: *
Allow: /
Allow: /products
Allow: /categories
Disallow: /admin
Disallow: /api
Disallow: /account
Disallow: /checkout
Disallow: /cart
Disallow: /*.json$
Disallow: /*?*

Sitemap: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1
`

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, s-maxage=86400',
    },
  })
}
