import { prisma, Categories } from '@rubros/db';

const THRESHOLD = 5;

export async function GET(): Promise<Response> {
  // Fetch all data in parallel with 3 queries instead of N×2
  const [provinces, totalCountsByCity, openCountsByCity] = await Promise.all([
    prisma.province.findMany({
      where: { status: true },
      include: {
        cities: { where: { status: true } },
      },
    }),
    // Total mechanics count per city
    prisma.business.groupBy({
      by: ['cityId'],
      where: {
        status: true,
        category: { slug: Categories.MECHANICS },
      },
      _count: { id: true },
    }),
    // Open businesses count per city (has opening hours defined)
    prisma.business.groupBy({
      by: ['cityId'],
      where: {
        status: true,
        category: { slug: Categories.MECHANICS },
        openingHours: { not: null },
      },
      _count: { id: true },
    }),
  ]);

  const totalMap = new Map(totalCountsByCity.map((r) => [r.cityId, r._count.id]));
  const openMap = new Map(openCountsByCity.map((r) => [r.cityId, r._count.id]));

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  const urls = [
    { loc: baseUrl, lastmod: new Date().toISOString(), changefreq: 'weekly', priority: '1.0' },
    { loc: `${baseUrl}/acerca/`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: '0.7' },
    { loc: `${baseUrl}/contacto/`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: '0.7' },
    { loc: `${baseUrl}/terminos-y-condiciones/`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: '0.5' },
    { loc: `${baseUrl}/politica-privacidad/`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: '0.5' },
  ];

  for (const province of provinces) {
    urls.push({
      loc: `${baseUrl}/${province.slug}/`,
      lastmod: province.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: '0.8',
    });

    for (const city of province.cities) {
      const totalCount = totalMap.get(city.id) ?? 0;
      const openCount = openMap.get(city.id) ?? 0;

      urls.push({
        loc: `${baseUrl}/${province.slug}/${city.slug}/`,
        lastmod: city.updatedAt.toISOString(),
        changefreq: 'weekly',
        priority: '0.6',
      });

      if (openCount >= THRESHOLD) {
        urls.push({
          loc: `${baseUrl}/${province.slug}/${city.slug}/abiertos/`,
          lastmod: city.updatedAt.toISOString(),
          changefreq: 'weekly',
          priority: '0.5',
        });
      }

      if (totalCount >= THRESHOLD) {
        urls.push({ loc: `${baseUrl}/${province.slug}/${city.slug}/cerca/`, lastmod: city.updatedAt.toISOString(), changefreq: 'weekly', priority: '0.5' });
        urls.push({ loc: `${baseUrl}/${province.slug}/${city.slug}/talleres/`, lastmod: city.updatedAt.toISOString(), changefreq: 'weekly', priority: '0.4' });
        urls.push({ loc: `${baseUrl}/${province.slug}/${city.slug}/talleres/cerca/`, lastmod: city.updatedAt.toISOString(), changefreq: 'weekly', priority: '0.4' });
      }

      if (openCount >= THRESHOLD) {
        urls.push({ loc: `${baseUrl}/${province.slug}/${city.slug}/talleres/abiertos/`, lastmod: city.updatedAt.toISOString(), changefreq: 'weekly', priority: '0.4' });
      }
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
