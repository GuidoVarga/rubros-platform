import { prisma } from '@rubros/db';

export async function GET(): Promise<Response> {
  // Fetch all active provinces with their cities
  const provinces = await prisma.province.findMany({
    where: {
      status: true,
    },
    include: {
      cities: {
        where: {
          status: true,
        },
      },
    },
  });

  // Base URL from environment or default
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  // Create sitemap entries
  const urls = [
    {
      loc: baseUrl,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '1.0',
    },
    {
      loc: `${baseUrl}/acerca`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.7',
    },
    {
      loc: `${baseUrl}/contacto`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.7',
    },
  ];

  // Add province and city routes
  for (const province of provinces) {
    // Province route
    urls.push({
      loc: `${baseUrl}/${province.slug}`,
      lastmod: province.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: '0.8',
    });

    // City routes
    for (const city of province.cities) {
      urls.push({
        loc: `${baseUrl}/${province.slug}/${city.slug}`,
        lastmod: city.updatedAt.toISOString(),
        changefreq: 'weekly',
        priority: '0.6',
      });
    }
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
