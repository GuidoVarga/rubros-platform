import { Metadata } from 'next'
import { prisma } from '@rubros/db'
import { generateLocalBusinessSchema } from '../../../../lib/schema'

type Props = {
  params: {
    province: string
    city: string
    business: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  const business = await prisma.business.findUnique({
    where: {
      slug: params.business,
    },
  })

  if (!business) {
    return {}
  }

  const businessUrl = `${baseUrl}/${params.province}/${params.city}/${params.business}`

  const schema = generateLocalBusinessSchema({
    name: business.name,
    description: business.description || undefined,
    address: business.address || undefined,
    telephone: business.phone || undefined,
    email: business.email || undefined,
    url: businessUrl,
  })

  return {
    title: business.name,
    description: business.description || `${business.name} en ${params.city}, ${params.province}`,
    alternates: {
      canonical: businessUrl,
    },
    other: {
      'script:ld+json': JSON.stringify(schema),
    },
  }
}