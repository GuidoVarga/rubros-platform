import { BusinessEntity } from '@rubros/db';

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
