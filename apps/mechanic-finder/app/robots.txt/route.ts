import { MetadataRoute } from 'next';

export function GET(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  return {
    rules: [
      {
        userAgent: '*',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
