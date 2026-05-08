import { BusinessEntity } from '@rubros/db';

export type BreadcrumbSchemaItem = { href: string; name: string };

type Organization = {
  name: string;
  url: string;
  logo?: string;
  description?: string;
};

type LocalBusiness = BusinessEntity & {
  url: string;
};

export function generateOrganizationSchema(org: Organization) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: org.url,
    ...(org.logo && { logo: org.logo }),
    ...(org.description && { description: org.description }),
  };
}

export function generateListingPageSchema(
  breadcrumbs: BreadcrumbSchemaItem[],
  businesses: { name: string; slug: string }[],
  baseUrl: string,
  provinceSlug: string,
  citySlug: string,
  pageOffset = 0
) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: `${baseUrl}${item.href}`,
        })),
      },
      {
        '@type': 'ItemList',
        itemListElement: businesses.map((biz, i) => ({
          '@type': 'ListItem',
          position: pageOffset + i + 1,
          name: biz.name,
          url: `${baseUrl}/${provinceSlug}/${citySlug}/${biz.slug}/`,
        })),
      },
    ],
  };
}

export function generateLocalBusinessSchema(business: LocalBusiness) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': business.url,
    name: business.name,
    url: business.url,
    ...(business.description && { description: business.description }),
    ...(business.image && { image: business.image }), // SEO-friendly
    ...(business.phone && { telephone: business.phone }),
    ...(business.email && { email: business.email }),
    ...(business.address && {
      address: {
        '@type': 'PostalAddress',
        ...(business.address && { streetAddress: business.address }),
        ...(business.city?.name && { addressLocality: business.city?.name }),
        ...(business.city?.province?.name && {
          addressRegion: business.city?.province?.name,
        }),
        ...(business.postalCode && { postalCode: business.postalCode }),
        ...(business.city?.postalCode && {
          postalCode: business.city?.postalCode,
        }),
        addressCountry: 'AR',
      },
    }),
    ...(business.openingHours && { openingHours: business.openingHours }), // formato "Mo-Fr 09:00-18:00"
    ...(business.latitude &&
      business.longitude && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: business.latitude,
          longitude: business.longitude,
        },
      }),
  };
}
