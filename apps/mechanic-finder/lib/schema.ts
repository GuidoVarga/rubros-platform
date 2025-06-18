type Organization = {
  name: string;
  url: string;
  logo?: string;
  description?: string;
};

type LocalBusiness = {
  name: string;
  description?: string;
  address?: string;
  telephone?: string;
  url: string;
  email?: string;
  openingHours?: string;
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
    ...(business.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: business.address,
      },
    }),
    ...(business.telephone && { telephone: business.telephone }),
    ...(business.email && { email: business.email }),
  };
}
