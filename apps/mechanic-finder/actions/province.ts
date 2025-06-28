'use server';

import { prisma } from '@/lib/db';

export async function getProvinceBySlug(slug: string) {
  try {
    return await prisma.province.findUnique({
      where: { slug },
      include: {
        cities: {
          where: { status: true },
          select: {
            id: true,
            name: true,
            slug: true,
          },
          orderBy: { name: 'asc' },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching province:', error);
    return null;
  }
}

export async function getProvinces({
  includeCities = false,
}: { includeCities?: boolean } = {}) {
  try {
    return await prisma.province.findMany({
      where: {
        status: true,
      },
      include: {
        cities: includeCities
          ? {
              where: { status: true },
              select: { id: true, name: true, slug: true },
              orderBy: { name: 'asc' },
            }
          : undefined,
      },
      orderBy: {
        name: 'asc',
      },
    });
  } catch (error) {
    console.error('Error fetching provinces:', error);
    throw new Error('Failed to fetch provinces');
  }
}
