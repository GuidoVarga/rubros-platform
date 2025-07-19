'use server';

import { prisma } from '@rubros/db';
import type { BusinessEntity } from '@rubros/db/entities';
import type { GetBusinessesParams, BusinessFilters } from '@/types/business';

// Tipo extendido para incluir campos calculados
export type BusinessWithCalculatedFields = BusinessEntity & {
  distance?: number;
  isOpen?: boolean;
};
import { buildWhereClause } from '@/actions/utils';
import { Categories } from '@rubros/db';
import {
  isOpenNow,
  type HourEntry,
  calculateDistance as calculateDistanceUtil,
} from '@rubros/ui/utils';

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

    // Build where clause based on filters (excluding isOpen which is post-processed)
    const where = buildWhereClause(filters);

    let orderByParsed =
      orderBy?.field === 'distance'
        ? userLocation
          ? orderBy
          : { field: 'googleMapsRating', direction: orderBy.direction }
        : orderBy;

    // Use SQL-based function when we need distance sorting OR isOpen filter
    if (
      (userLocation && orderByParsed.field === 'distance') ||
      filters?.isOpen
    ) {
      return await getBusinessesByDistance({
        filters,
        orderBy: orderByParsed,
        pagination,
        userLocation: userLocation || { latitude: 0, longitude: 0 }, // Fallback for isOpen-only cases
        maxDistance,
      });
    }

    // Lógica original para casos simples
    // Get total count for pagination
    const total = await prisma.business.count({
      where: {
        ...where,
        category: {
          slug: Categories.MECHANICS,
        },
        status: true,
      },
    });

    // Get businesses with pagination
    const businesses = (await prisma.business.findMany({
      where: {
        ...where,
        category: {
          slug: Categories.MECHANICS,
        },
        status: true,
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
    // También agregar el campo isOpen a todos los negocios
    let businessesWithDistance = businesses;
    if (userLocation) {
      businessesWithDistance = businesses.map((business) => ({
        ...business,
        distance:
          business.latitude && business.longitude
            ? calculateDistanceUtil(
                {
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                },
                { latitude: business.latitude, longitude: business.longitude }
              )
            : undefined,
        isOpen: business.hours
          ? isOpenNow(business.hours as HourEntry[])
          : false,
      }));
    } else {
      // Agregar isOpen sin distancia
      businessesWithDistance = businesses.map((business) => ({
        ...business,
        isOpen: business.hours
          ? isOpenNow(business.hours as HourEntry[])
          : false,
      }));
    }

    return {
      businesses: businessesWithDistance as BusinessWithCalculatedFields[],
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

    // Filtro isOpen si está activo
    if (filters.isOpen) {
      const isOpenCondition = `
        EXISTS (
          SELECT 1
          FROM jsonb_array_elements(b.hours::jsonb) AS hour_entry
          WHERE
            -- Convertir el día a español y comparar con el día actual
            CASE
              WHEN hour_entry->>'day' = 'lunes' THEN 1
              WHEN hour_entry->>'day' = 'martes' THEN 2
              WHEN hour_entry->>'day' = 'miércoles' OR hour_entry->>'day' = 'miercoles' THEN 3
              WHEN hour_entry->>'day' = 'jueves' THEN 4
              WHEN hour_entry->>'day' = 'viernes' THEN 5
              WHEN hour_entry->>'day' = 'sábado' OR hour_entry->>'day' = 'sabado' THEN 6
              WHEN hour_entry->>'day' = 'domingo' THEN 0
              ELSE -1
            END = EXTRACT(DOW FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')
            AND EXISTS (
              SELECT 1
              FROM jsonb_array_elements_text(hour_entry->'times') AS time_range
              WHERE
                time_range NOT ILIKE '%cerrado%'
                AND time_range NOT ILIKE '%closed%'
                AND (
                                    -- Regex mejorado que maneja múltiples formatos de horarios con minutos
                  -- Soporta: "8 a. m.-5 p. m.", "8:30 a. m. a 7 p. m.", "9:00 a. m. - 5:00 p. m.", "2:00 p. m. - 6:30 p. m."
                  CASE
                    -- Formato AM a PM sin minutos: "8 a. m.-5 p. m."
                    WHEN time_range ~ '^[0-9]{1,2} a\\. m\\.-[0-9]{1,2} p\\. m\\.$' THEN
                      (
                        EXTRACT(HOUR FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') * 100 +
                        EXTRACT(MINUTE FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') >=
                        CAST(regexp_replace(time_range, '^([0-9]{1,2}) a\\. m\\.-.*', '\\1') AS INTEGER) * 100
                        AND
                        EXTRACT(HOUR FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') * 100 +
                        EXTRACT(MINUTE FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') <=
                        (CAST(regexp_replace(time_range, '.*-([0-9]{1,2}) p\\. m\\.$', '\\1') AS INTEGER) + 12) * 100
                      )
                    -- Formato AM a PM con minutos: "8:30 a. m.-7:15 p. m." o "8:30 a. m. a 7:15 p. m."
                    WHEN time_range ~ '^[0-9]{1,2}:[0-9]{2} a\\. m\\.[\\s\\-a]*[0-9]{1,2}:[0-9]{2} p\\. m\\.$' THEN
                      (
                        EXTRACT(HOUR FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') * 100 +
                        EXTRACT(MINUTE FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') >=
                        CAST(regexp_replace(time_range, '^([0-9]{1,2}):([0-9]{2}) a\\. m\\..*', '\\1') AS INTEGER) * 100 +
                        CAST(regexp_replace(time_range, '^([0-9]{1,2}):([0-9]{2}) a\\. m\\..*', '\\2') AS INTEGER)
                        AND
                        EXTRACT(HOUR FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') * 100 +
                        EXTRACT(MINUTE FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') <=
                        (CAST(regexp_replace(time_range, '.*[\\s\\-a]*([0-9]{1,2}):([0-9]{2}) p\\. m\\.$', '\\1') AS INTEGER) + 12) * 100 +
                        CAST(regexp_replace(time_range, '.*[\\s\\-a]*([0-9]{1,2}):([0-9]{2}) p\\. m\\.$', '\\2') AS INTEGER)
                      )
                    -- Formato PM a PM con minutos: "2:00 p. m. - 6:30 p. m."
                    WHEN time_range ~ '^[0-9]{1,2}:[0-9]{2} p\\. m\\.[\\s\\-a]*[0-9]{1,2}:[0-9]{2} p\\. m\\.$' THEN
                      (
                        EXTRACT(HOUR FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') * 100 +
                        EXTRACT(MINUTE FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') >=
                        (CAST(regexp_replace(time_range, '^([0-9]{1,2}):([0-9]{2}) p\\. m\\..*', '\\1') AS INTEGER) +
                         CASE WHEN CAST(regexp_replace(time_range, '^([0-9]{1,2}):([0-9]{2}) p\\. m\\..*', '\\1') AS INTEGER) = 12 THEN 0 ELSE 12 END) * 100 +
                        CAST(regexp_replace(time_range, '^([0-9]{1,2}):([0-9]{2}) p\\. m\\..*', '\\2') AS INTEGER)
                        AND
                        EXTRACT(HOUR FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') * 100 +
                        EXTRACT(MINUTE FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') <=
                        (CAST(regexp_replace(time_range, '.*[\\s\\-a]*([0-9]{1,2}):([0-9]{2}) p\\. m\\.$', '\\1') AS INTEGER) +
                         CASE WHEN CAST(regexp_replace(time_range, '.*[\\s\\-a]*([0-9]{1,2}):([0-9]{2}) p\\. m\\.$', '\\1') AS INTEGER) = 12 THEN 0 ELSE 12 END) * 100 +
                        CAST(regexp_replace(time_range, '.*[\\s\\-a]*([0-9]{1,2}):([0-9]{2}) p\\. m\\.$', '\\2') AS INTEGER)
                      )
                    -- Si no coincide con formatos conocidos, conservadoramente asumir cerrado
                    ELSE false
                  END
                )
            )
        )
      `;
      whereConditions.push(isOpenCondition);
    }
  }

  // Filtro por categoría MECHANICS
  whereConditions.push(`c.slug = $${paramIndex}`);
  params.push(Categories.MECHANICS);
  paramIndex++;

  // Determinar si necesitamos filtro y ordenamiento por distancia
  const needsDistanceFilter =
    userLocation.latitude !== 0 && userLocation.longitude !== 0;
  const orderByDistance = orderBy.field === 'distance' && needsDistanceFilter;

  if (needsDistanceFilter) {
    // Filtro de distancia solo si tenemos coordenadas reales
    whereConditions.push(`
      ST_DWithin(
        b.location,
        ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography,
        $${paramIndex + 2} * 1000
      )
    `);
    params.push(userLocation.longitude, userLocation.latitude, maxDistance);
    paramIndex += 3;
  }

  const whereClause = whereConditions.join(' AND ');

  // Construir ORDER BY dinámicamente
  let orderByClause;
  if (orderByDistance) {
    orderByClause = `distance ${orderBy.direction?.toUpperCase() || 'ASC'}`;
  } else {
    orderByClause = `b."${orderBy.field}" ${orderBy.direction?.toUpperCase() || 'DESC'}`;
  }

  // Query principal con distancia calculada (solo si necesitamos distancia)
  const distanceSelect = needsDistanceFilter
    ? `
    ST_Distance(
      b.location,
      ST_SetSRID(ST_MakePoint($${params.findIndex((p) => p === userLocation.longitude) + 1}, $${params.findIndex((p) => p === userLocation.latitude) + 1}), 4326)::geography
    ) / 1000 as distance,`
    : '';

  // Campo calculado para determinar si está abierto
  const isOpenSelect = `
    CASE WHEN EXISTS (
      SELECT 1
      FROM jsonb_array_elements(b.hours::jsonb) AS hour_entry
      WHERE
        -- Convertir el día a español y comparar con el día actual
        CASE
          WHEN hour_entry->>'day' = 'lunes' THEN 1
          WHEN hour_entry->>'day' = 'martes' THEN 2
          WHEN hour_entry->>'day' = 'miércoles' OR hour_entry->>'day' = 'miercoles' THEN 3
          WHEN hour_entry->>'day' = 'jueves' THEN 4
          WHEN hour_entry->>'day' = 'viernes' THEN 5
          WHEN hour_entry->>'day' = 'sábado' OR hour_entry->>'day' = 'sabado' THEN 6
          WHEN hour_entry->>'day' = 'domingo' THEN 0
          ELSE -1
        END = EXTRACT(DOW FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')
        AND EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(hour_entry->'times') AS time_range
          WHERE
            time_range NOT ILIKE '%cerrado%'
            AND time_range NOT ILIKE '%closed%'
            AND (
              -- Regex mejorado que maneja múltiples formatos de horarios con minutos
              -- Soporta: "8 a. m.-5 p. m.", "8:30 a. m. a 7 p. m.", "9:00 a. m. - 5:00 p. m.", "2:00 p. m. - 6:30 p. m."
              CASE
                -- Formato AM a PM sin minutos: "8 a. m.-5 p. m."
                WHEN time_range ~ '^[0-9]{1,2} a\\. m\\.-[0-9]{1,2} p\\. m\\.$' THEN
                  (
                    EXTRACT(HOUR FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') * 100 +
                    EXTRACT(MINUTE FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') >=
                    CAST(regexp_replace(time_range, '^([0-9]{1,2}) a\\. m\\.-.*', '\\1') AS INTEGER) * 100
                    AND
                    EXTRACT(HOUR FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') * 100 +
                    EXTRACT(MINUTE FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') <=
                    (CAST(regexp_replace(time_range, '.*-([0-9]{1,2}) p\\. m\\.$', '\\1') AS INTEGER) + 12) * 100
                  )
                -- Formato AM a PM con minutos: "8:30 a. m.-7:15 p. m." o "8:30 a. m. a 7:15 p. m."
                WHEN time_range ~ '^[0-9]{1,2}:[0-9]{2} a\\. m\\.[\\s\\-a]*[0-9]{1,2}:[0-9]{2} p\\. m\\.$' THEN
                  (
                    EXTRACT(HOUR FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') * 100 +
                    EXTRACT(MINUTE FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') >=
                    CAST(regexp_replace(time_range, '^([0-9]{1,2}):([0-9]{2}) a\\. m\\..*', '\\1') AS INTEGER) * 100 +
                    CAST(regexp_replace(time_range, '^([0-9]{1,2}):([0-9]{2}) a\\. m\\..*', '\\2') AS INTEGER)
                    AND
                    EXTRACT(HOUR FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') * 100 +
                    EXTRACT(MINUTE FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') <=
                    (CAST(regexp_replace(time_range, '.*[\\s\\-a]*([0-9]{1,2}):([0-9]{2}) p\\. m\\.$', '\\1') AS INTEGER) + 12) * 100 +
                    CAST(regexp_replace(time_range, '.*[\\s\\-a]*([0-9]{1,2}):([0-9]{2}) p\\. m\\.$', '\\2') AS INTEGER)
                  )
                -- Formato PM a PM con minutos: "2:00 p. m. - 6:30 p. m."
                WHEN time_range ~ '^[0-9]{1,2}:[0-9]{2} p\\. m\\.[\\s\\-a]*[0-9]{1,2}:[0-9]{2} p\\. m\\.$' THEN
                  (
                    EXTRACT(HOUR FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') * 100 +
                    EXTRACT(MINUTE FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') >=
                    (CAST(regexp_replace(time_range, '^([0-9]{1,2}):([0-9]{2}) p\\. m\\..*', '\\1') AS INTEGER) +
                     CASE WHEN CAST(regexp_replace(time_range, '^([0-9]{1,2}):([0-9]{2}) p\\. m\\..*', '\\1') AS INTEGER) = 12 THEN 0 ELSE 12 END) * 100 +
                    CAST(regexp_replace(time_range, '^([0-9]{1,2}):([0-9]{2}) p\\. m\\..*', '\\2') AS INTEGER)
                    AND
                    EXTRACT(HOUR FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') * 100 +
                    EXTRACT(MINUTE FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') <=
                    (CAST(regexp_replace(time_range, '.*[\\s\\-a]*([0-9]{1,2}):([0-9]{2}) p\\. m\\.$', '\\1') AS INTEGER) +
                     CASE WHEN CAST(regexp_replace(time_range, '.*[\\s\\-a]*([0-9]{1,2}):([0-9]{2}) p\\. m\\.$', '\\1') AS INTEGER) = 12 THEN 0 ELSE 12 END) * 100 +
                    CAST(regexp_replace(time_range, '.*[\\s\\-a]*([0-9]{1,2}):([0-9]{2}) p\\. m\\.$', '\\2') AS INTEGER)
                  )
                -- Si no coincide con formatos conocidos, conservadoramente asumir cerrado
                ELSE false
              END
            )
        )
    ) THEN true ELSE false END as is_open,`;

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
      b."cityId",${distanceSelect}
      ${isOpenSelect}
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
      p."updatedAt" as province_updated_at
    FROM "Business" b
    JOIN "Category" c ON b."categoryId" = c.id
    JOIN "City" city ON b."cityId" = city.id
    JOIN "Province" p ON city."provinceId" = p.id
    WHERE ${whereClause}
    ORDER BY ${orderByClause}
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
    // Add distance from SQL result if available, otherwise calculate it
    distance: row.distance ? Number(row.distance) : undefined,
    // Add isOpen field from SQL result
    isOpen: Boolean(row.is_open),
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
    businesses: businesses as BusinessWithCalculatedFields[],
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
