'use server';

import { prisma } from '@/lib/db';

export async function getCitiesByProvince(provinceId: string) {
  try {
    return await prisma.city.findMany({
      where: {
        status: true,
        provinceId: provinceId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw new Error('Failed to fetch cities');
  }
}

export async function getCityBySlug(slug: string) {
  try {
    return await prisma.city.findUnique({
      where: { slug },
      include: {
        province: true,
      },
    });
  } catch (error) {
    console.error('Error fetching city:', error);
    return null;
  }
}

export async function getTotalMechanicsInCity(cityId: string) {
  try {
    return await prisma.business.count({
      where: {
        status: true,
        category: {
          slug: 'mecanicos',
        },
        cityId: cityId,
      },
    });
  } catch (error) {
    console.error('Error counting mechanics in city:', error);
    return 0;
  }
}
