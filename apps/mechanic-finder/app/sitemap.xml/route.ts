import { prisma } from '@rubros/db';
import { MetadataRoute } from 'next';

export async function GET(): Promise<MetadataRoute.Sitemap> {
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
  const sitemap: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];

  // Add province and city routes
  for (const province of provinces) {
    // Province route
    sitemap.push({
      url: `${baseUrl}/${province.slug}`,
      lastModified: province.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    // City routes
    for (const city of province.cities) {
      sitemap.push({
        url: `${baseUrl}/${province.slug}/${city.slug}`,
        lastModified: city.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }

  return sitemap;
}
