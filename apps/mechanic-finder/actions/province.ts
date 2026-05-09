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

export async function getTopProvincesByMechanicsCount(limit = 8) {
  try {
    const provinces = await prisma.province.findMany({
      where: { status: true },
      select: {
        id: true,
        name: true,
        slug: true,
        cities: {
          where: { status: true },
          select: {
            _count: {
              select: { businesses: { where: { status: true } } },
            },
          },
        },
      },
    });

    return provinces
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        mechanicsCount: p.cities.reduce((sum, c) => sum + c._count.businesses, 0),
      }))
      .sort((a, b) => b.mechanicsCount - a.mechanicsCount)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching top provinces:', error);
    return [];
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
