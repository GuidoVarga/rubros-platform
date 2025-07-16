'use server';

import { prisma } from '@/lib/db';
import type { GetBusinessesParams } from '@/types/business';
import { Categories } from '@rubros/db';
import { BusinessEntity } from '@rubros/db/entities';
import { buildWhereClause } from './utils';

export async function getBusinesses({
  filters,
  orderBy = { field: 'googleMapsRating', direction: 'desc' },
  pagination = { page: 1, limit: 16 },
  userLocation,
  maxDistance = 999999999, // Radio máximo en kilómetros
}: GetBusinessesParams = {}) {
  try {
    // Calculate offset
    const offset = (pagination.page - 1) * pagination.limit;

    // Build where clause based on filters
    const where = buildWhereClause(filters);

    let orderByParsed =
      orderBy?.field === 'distance'
        ? userLocation
          ? orderBy
          : { field: 'googleMapsRating', direction: orderBy.direction }
        : orderBy;

    // Si tenemos ubicación del usuario y queremos ordenar por distancia
    if (userLocation && orderByParsed.field === 'distance') {
      return await getBusinessesByDistance({
        filters,
        orderBy: orderByParsed,
        pagination,
        userLocation,
        maxDistance,
      });
    }

    console.log('orderByParsed ', orderByParsed);

    // Lógica original para otros tipos de ordenamiento
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
        [orderByParsed.field]: orderByParsed.direction,
      },
      skip: offset,
      take: pagination.limit,
    })) as BusinessEntity[];

    // Si tenemos ubicación del usuario, agregar distancia a cada negocio
    let businessesWithDistance = businesses;
    if (userLocation) {
      businessesWithDistance = businesses.map((business) => ({
        ...business,
        distance:
          business.latitude && business.longitude
            ? calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                business.latitude,
                business.longitude
              )
            : undefined,
      }));
    }

    return {
      businesses: businessesWithDistance,
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

// Nueva función para ordenamiento por distancia usando PostGIS
async function getBusinessesByDistance({
  filters,
  orderBy,
  pagination,
  userLocation,
  maxDistance,
}: {
  filters: any;
  orderBy: any;
  pagination: any;
  userLocation: { latitude: number; longitude: number };
  maxDistance: number;
}) {
  const offset = (pagination.page - 1) * pagination.limit;
  console.log('getBusinessesByDistance userLocation ', userLocation);
  console.log('orderBy ', orderBy);

  // Construir condiciones WHERE dinámicamente
  const whereConditions = ['b.status = true'];
  const params: any[] = [];
  let paramIndex = 1;

  // Añadir filtros dinámicamente basado en tu función buildWhereClause
  if (filters) {
    if (filters.cityId) {
      whereConditions.push(`b."cityId" = $${paramIndex}`);
      params.push(filters.cityId);
      paramIndex++;
    }

    if (filters.categoryId) {
      whereConditions.push(`b."categoryId" = $${paramIndex}`);
      params.push(filters.categoryId);
      paramIndex++;
    }

    if (filters.search) {
      whereConditions.push(
        `(b.name ILIKE $${paramIndex} OR b.description ILIKE $${paramIndex})`
      );
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    // Añadir otros filtros según tu función buildWhereClause
  }

  // Filtro por categoría MECHANICS
  params.push(Categories.MECHANICS);
  paramIndex++;

  // Filtro de distancia
  whereConditions.push(`
    ST_DWithin(
      b.location,
      ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography,
      $${paramIndex + 2} * 1000
    )
  `);
  params.push(userLocation.longitude, userLocation.latitude, maxDistance);
  paramIndex += 3;

  const whereClause = whereConditions.join(' AND ');

  // Query principal con distancia calculada
  const businessesQuery = `
    SELECT
      b.id,
      b.name,
      b.slug,
      b.description,
      b.address,
      b.phone,
      b.email,
      b.website,
      b.image,
      b."postalCode",
      b."openingHours",
      b.latitude,
      b.longitude,
      ST_AsText(b.location) as location,
      b.hours,
      b."googleMapsLink",
      b."closedOn",
      b."googlePlaceId",
      b."googleMapsRating",
      b.status,
      b."createdAt",
      b."updatedAt",
      b."categoryId",
      b."cityId",
      c.name as category_name,
      c.slug as category_slug,
      c.icon as category_icon,
      c.id as category_id,
      c.description as category_description,
      c.status as category_status,
      c."createdAt" as category_created_at,
      c."updatedAt" as category_updated_at,
      city.name as city_name,
      city.slug as city_slug,
      city.id as city_id,
      city."postalCode" as city_postal_code,
      city.status as city_status,
      city."createdAt" as city_created_at,
      city."updatedAt" as city_updated_at,
      city."provinceId" as city_province_id,
      p.name as province_name,
      p.slug as province_slug,
      p.id as province_id,
      p.status as province_status,
      p."createdAt" as province_created_at,
      p."updatedAt" as province_updated_at,
      ST_Distance(
        b.location,
        ST_SetSRID(ST_MakePoint($${params.findIndex((p) => p === userLocation.longitude) + 1}, $${params.findIndex((p) => p === userLocation.latitude) + 1}), 4326)::geography
      ) / 1000 as distance
    FROM "Business" b
    JOIN "Category" c ON b."categoryId" = c.id
    JOIN "City" city ON b."cityId" = city.id
    JOIN "Province" p ON city."provinceId" = p.id
    WHERE ${whereClause}
    ORDER BY distance ${orderBy.direction?.toUpperCase() || 'ASC'}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  // Query para contar total
  const countQuery = `
    SELECT COUNT(*) as total
    FROM "Business" b
    JOIN "Category" c ON b."categoryId" = c.id
    JOIN "City" city ON b."cityId" = city.id
    WHERE ${whereClause}
  `;

  params.push(pagination.limit, offset);
  const countParams = params.slice(0, -2); // Remover limit y offset para el count

  const [businessesResult, countResult] = await Promise.all([
    prisma.$queryRawUnsafe(businessesQuery, ...params),
    prisma.$queryRawUnsafe(countQuery, ...countParams),
  ]);

  const total = Number((countResult as any)[0].total);

  // Formatear resultados para que coincidan con la estructura original
  const businesses = (businessesResult as any[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    address: row.address,
    phone: row.phone,
    email: row.email,
    website: row.website,
    image: row.image,
    postalCode: row.postalCode,
    openingHours: row.openingHours,
    latitude: row.latitude,
    longitude: row.longitude,
    hours: row.hours,
    googleMapsLink: row.googleMapsLink,
    closedOn: row.closedOn,
    googlePlaceId: row.googlePlaceId,
    googleMapsRating: row.googleMapsRating,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    categoryId: row.categoryId,
    cityId: row.cityId,
    distance: Number(row.distance),
    category: {
      id: row.category_id,
      name: row.category_name,
      slug: row.category_slug,
      icon: row.category_icon,
      description: row.category_description,
      status: row.category_status,
      createdAt: row.category_created_at,
      updatedAt: row.category_updated_at,
    },
    city: {
      id: row.city_id,
      name: row.city_name,
      slug: row.city_slug,
      postalCode: row.city_postal_code,
      status: row.city_status,
      createdAt: row.city_created_at,
      updatedAt: row.city_updated_at,
      provinceId: row.city_province_id,
      province: {
        id: row.province_id,
        name: row.province_name,
        slug: row.province_slug,
        status: row.province_status,
        createdAt: row.province_created_at,
        updatedAt: row.province_updated_at,
      },
    },
  }));

  return {
    businesses,
    pagination: {
      total,
      pages: Math.ceil(total / pagination.limit),
      current: pagination.page,
    },
  };
}

// Función para calcular distancia usando la fórmula de Haversine (fallback)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Función auxiliar para contar mecánicos en toda la provincia
export async function getTotalMechanicsInProvince(provinceId: string) {
  try {
    return await prisma.business.count({
      where: {
        status: true,
        category: {
          slug: Categories.MECHANICS,
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

// Función auxiliar para contar mecánicos
export async function getMechanicsCount(cityId: string) {
  try {
    return await prisma.business.count({
      where: {
        cityId,
        status: true,
        category: {
          slug: Categories.MECHANICS,
        },
      },
    });
  } catch (error) {
    console.error('Error counting mechanics:', error);
    return 0;
  }
}

export async function getBusinessBySlug(
  slug: string
): Promise<BusinessEntity | null> {
  try {
    return (await prisma.business.findFirst({
      where: {
        slug,
      },
      include: {
        category: true,
        city: {
          include: {
            province: true,
          },
        },
      },
    })) as BusinessEntity | null;
  } catch (error) {
    console.error('Error fetching business by slug:', error);
    return null;
  }
}
