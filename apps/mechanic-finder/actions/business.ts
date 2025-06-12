'use server';

import { prisma } from '@/lib/db';
import type { GetBusinessesParams } from '@/types/business';
import { Categories } from '@rubros/db';
import { BusinessEntity } from '@rubros/db/entities';
import { buildWhereClause } from './utils';

export async function getBusinesses({
  filters,
  orderBy = { field: 'createdAt', direction: 'desc' },
  pagination = { page: 1, limit: 16 },
}: GetBusinessesParams = {}) {
  try {
    // Calculate offset
    const offset = (pagination.page - 1) * pagination.limit;

    // Build where clause based on filters
    const where = buildWhereClause(filters);

    // Get total count for pagination
    const total = await prisma.business.count({ where });

    // Get businesses
    const businesses = (await prisma.business.findMany({
      where: {
        ...where,
        category: {
          slug: Categories.MECHANICS,
        },
      },
      include: {
        category: true,
        city: {
          include: {
            province: true,
          },
        },
      },
      orderBy: {
        [orderBy.field]: orderBy.direction,
      },
      skip: offset,
      take: pagination.limit,
    })) as BusinessEntity[];

    return {
      businesses,
      pagination: {
        total,
        pages: Math.ceil(total / pagination.limit),
        current: pagination.page,
      },
    };
  } catch (error) {
    console.error('Error fetching businesses:', error);
    throw new Error('Failed to fetch businesses');
  }
}

// Función auxiliar para contar mecánicos en toda la provincia
export async function getTotalMechanicsInProvince(provinceId: string) {
  try {
    return await prisma.business.count({
      where: {
        status: true,
        category: {
          slug: 'mecanicos',
        },
        city: {
          provinceId: provinceId,
        },
      },
    });
  } catch (error) {
    console.error('Error counting mechanics in province:', error);
    return 0;
  }
}
