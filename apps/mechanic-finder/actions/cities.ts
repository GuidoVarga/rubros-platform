'use server';

import { prisma } from '@/lib/db';
import { Categories } from '@rubros/db';

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
          slug: Categories.MECHANICS,
        },
        cityId: cityId,
      },
    });
  } catch (error) {
    console.error('Error counting mechanics in city:', error);
    return 0;
  }
}

// Obtener ciudades destacadas de una provincia ordenadas por cantidad de mecánicos (usando Prisma)
export async function getTopCitiesByMechanicsCount(
  provinceId: string,
  limit: number = 12
) {
  try {
    // Obtener todas las ciudades de la provincia con sus negocios
    const cities = await prisma.city.findMany({
      where: {
        provinceId: provinceId,
        status: true,
      },
      include: {
        _count: {
          select: {
            businesses: {
              where: {
                status: true,
                category: {
                  slug: Categories.MECHANICS,
                },
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Filtrar ciudades que tienen mecánicos y ordenar por cantidad
    const citiesWithMechanics = cities
      .filter((city) => city._count.businesses > 0)
      .map((city) => ({
        id: city.id,
        name: city.name,
        slug: city.slug,
        postalCode: city.postalCode,
        status: city.status,
        createdAt: city.createdAt,
        updatedAt: city.updatedAt,
        provinceId: city.provinceId,
        mechanicsCount: city._count.businesses,
      }))
      .sort((a, b) => {
        // Ordenar por cantidad de mecánicos (desc) y luego por nombre (asc)
        if (b.mechanicsCount !== a.mechanicsCount) {
          return b.mechanicsCount - a.mechanicsCount;
        }
        return a.name.localeCompare(b.name);
      })
      .slice(0, limit);

    return citiesWithMechanics;
  } catch (error) {
    console.error('Error fetching top cities by mechanics count:', error);
    throw new Error('Failed to fetch top cities');
  }
}

// Obtener ciudades relacionadas excluyendo la ciudad actual (usando Prisma)
export async function getRelatedCitiesByMechanicsCount(
  provinceId: string,
  excludeCityId: string,
  limit: number = 12
) {
  try {
    // Obtener ciudades de la provincia excluyendo la actual
    const cities = await prisma.city.findMany({
      where: {
        provinceId: provinceId,
        status: true,
        id: {
          not: excludeCityId,
        },
      },
      include: {
        _count: {
          select: {
            businesses: {
              where: {
                status: true,
                category: {
                  slug: Categories.MECHANICS,
                },
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Filtrar ciudades que tienen mecánicos y ordenar por cantidad
    const citiesWithMechanics = cities
      .filter((city) => city._count.businesses > 0)
      .map((city) => ({
        id: city.id,
        name: city.name,
        slug: city.slug,
        postalCode: city.postalCode,
        status: city.status,
        createdAt: city.createdAt,
        updatedAt: city.updatedAt,
        provinceId: city.provinceId,
        mechanicsCount: city._count.businesses,
      }))
      .sort((a, b) => {
        // Ordenar por cantidad de mecánicos (desc) y luego por nombre (asc)
        if (b.mechanicsCount !== a.mechanicsCount) {
          return b.mechanicsCount - a.mechanicsCount;
        }
        return a.name.localeCompare(b.name);
      })
      .slice(0, limit);

    return citiesWithMechanics;
  } catch (error) {
    console.error('Error fetching related cities by mechanics count:', error);
    throw new Error('Failed to fetch related cities');
  }
}
