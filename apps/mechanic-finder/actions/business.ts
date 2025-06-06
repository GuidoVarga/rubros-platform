"use server";

import {prisma} from "@/lib/db";
import type {GetBusinessesParams, BusinessFilters} from "@/types/business";
import {Categories} from "@rubros/db";

export async function getBusinesses({
  filters,
  orderBy = {field: "createdAt", direction: "desc"},
  pagination = {page: 1, limit: 16},
}: GetBusinessesParams = {}) {
  try {
    // Calculate offset
    const offset = (pagination.page - 1) * pagination.limit;

    // Build where clause based on filters
    const where = buildWhereClause(filters);

    // Get total count for pagination
    const total = await prisma.business.count({where});

    // Get businesses
    const businesses = await prisma.business.findMany({
      where: {
        ...where,
        category: {
          slug: Categories.MECHANICS,
        },
      },
      include: {
        category: true,
        location: {
          include: {
            city: true,
            zone: true,
          },
        },
      },
      orderBy: {
        [orderBy.field]: orderBy.direction,
      },
      skip: offset,
      take: pagination.limit,
    });

    return {
      businesses,
      pagination: {
        total,
        pages: Math.ceil(total / pagination.limit),
        current: pagination.page,
      },
    };
  } catch (error) {
    console.error("Error fetching businesses:", error);
    throw new Error("Failed to fetch businesses");
  }
}

export async function getLocations() {
  try {
    return await prisma.city.findMany({
      where: {
        status: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        zones: {
          where: {
            status: true,
          },
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw new Error("Failed to fetch locations");
  }
}

function buildWhereClause(filters?: BusinessFilters) {
  if (!filters) return {};

  const where: any = {};

  if (filters.subCategoryId) {
    where.subCategoryId = filters.subCategoryId;
  }

  if (filters.cityId || filters.zoneId) {
    where.location = {
      OR: [
        filters.cityId ? {cityId: filters.cityId} : {},
        filters.zoneId ? {zoneId: filters.zoneId} : {},
      ].filter((condition) => Object.keys(condition).length > 0),
    };
  }

  if (filters.search) {
    where.OR = [
      {name: {contains: filters.search, mode: "insensitive"}},
      {description: {contains: filters.search, mode: "insensitive"}},
    ];
  }

  return where;
}
