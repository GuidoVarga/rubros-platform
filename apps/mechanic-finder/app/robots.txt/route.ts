import { MetadataRoute } from 'next';

export async function GET(): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Disallow admin or private areas (if any)
# Disallow: /admin/
# Disallow: /private/

# Allow all search engines to crawl all pages
# This helps with SEO for our mechanic directory
Allow: /
Allow: /acerca
Allow: /contacto
Allow: /*/*
Allow: /*/*/*
Allow: /*/*/*/*
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
