import { prisma } from '@rubros/db';
import { getOpenBusinessesCount, getMechanicsCount } from '@/actions/business';

const STATIC_URLS = [
  { loc: '', changefreq: 'weekly', priority: '1.0' },
  { loc: '/acerca/', changefreq: 'monthly', priority: '0.7' },
  { loc: '/contacto/', changefreq: 'monthly', priority: '0.7' },
  { loc: '/terminos-y-condiciones/', changefreq: 'monthly', priority: '0.5' },
  { loc: '/politica-privacidad/', changefreq: 'monthly', priority: '0.5' },
];

export async function GET(): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  let provinces: Awaited<ReturnType<typeof prisma.province.findMany>> = [];
  try {
    provinces = await prisma.province.findMany({
      where: { status: true },
      include: { cities: { where: { status: true } } },
    });
  } catch {
    const xml = buildXml(STATIC_URLS.map(u => ({
      loc: `${baseUrl}${u.loc}`,
      lastmod: new Date().toISOString(),
      changefreq: u.changefreq,
      priority: u.priority,
    })));
    return xmlResponse(xml);
  }

  // Create sitemap entries
  const urls = STATIC_URLS.map(u => ({
    loc: `${baseUrl}${u.loc}`,
    lastmod: new Date().toISOString(),
    changefreq: u.changefreq,
    priority: u.priority,
  }));

  // Add province and city routes
  for (const province of provinces) {
    // Province route
    urls.push({
      loc: `${baseUrl}/${province.slug}/`,
      lastmod: province.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: '0.8',
    });

    // City routes
    for (const city of province.cities) {
      // Base city route
      urls.push({
        loc: `${baseUrl}/${province.slug}/${city.slug}/`,
        lastmod: city.updatedAt.toISOString(),
        changefreq: 'weekly',
        priority: '0.6',
      });

      // CRITICAL: Add conditional variants with threshold logic
      const [openCount, totalCount] = await Promise.all([
        getOpenBusinessesCount(city.id),
        getMechanicsCount(city.id)
      ]);

      // Abiertos route (only if ≥5 open businesses)
      if (openCount >= 5) {
        urls.push({
          loc: `${baseUrl}/${province.slug}/${city.slug}/abiertos/`,
          lastmod: city.updatedAt.toISOString(),
          changefreq: 'weekly',
          priority: '0.5',
        });
      }

      // Cerca route (only if ≥5 total businesses)
      if (totalCount >= 5) {
        urls.push({
          loc: `${baseUrl}/${province.slug}/${city.slug}/cerca/`,
          lastmod: city.updatedAt.toISOString(),
          changefreq: 'weekly',
          priority: '0.5',
        });
      }

      // Talleres variants (same threshold as main variants)
      if (totalCount >= 5) {
        urls.push({
          loc: `${baseUrl}/${province.slug}/${city.slug}/talleres/`,
          lastmod: city.updatedAt.toISOString(),
          changefreq: 'weekly',
          priority: '0.4',
        });
      }

      if (openCount >= 5) {
        urls.push({
          loc: `${baseUrl}/${province.slug}/${city.slug}/talleres/abiertos/`,
          lastmod: city.updatedAt.toISOString(),
          changefreq: 'weekly',
          priority: '0.4',
        });
      }

      if (totalCount >= 5) {
        urls.push({
          loc: `${baseUrl}/${province.slug}/${city.slug}/talleres/cerca/`,
          lastmod: city.updatedAt.toISOString(),
          changefreq: 'weekly',
          priority: '0.4',
        });
      }
    }
  }

  return xmlResponse(buildXml(urls));
}

type SitemapUrl = { loc: string; lastmod: string; changefreq: string; priority: string };

function buildXml(urls: SitemapUrl[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
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
}

function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
