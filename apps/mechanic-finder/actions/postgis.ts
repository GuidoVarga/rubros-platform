import { prisma } from '@/lib/db';
import { Categories } from '@rubros/db';

// Función para probar PostGIS y debuggear
export async function testPostGIS() {
  try {
    // 1. Verificar que PostGIS está disponible
    const postgisVersion = await prisma.$queryRawUnsafe(
      'SELECT PostGIS_Version();'
    );
    console.log('🔍 PostGIS Version:', postgisVersion);

    // 2. Verificar cuántos negocios tienen location no null
    const businessWithLocation = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count
      FROM "Business"
      WHERE location IS NOT NULL
    `);
    console.log('🔍 Businesses with location:', businessWithLocation);

    // 3. Verificar cuántos negocios tienen latitude/longitude
    const businessWithCoords = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count
      FROM "Business"
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    `);
    console.log('🔍 Businesses with coordinates:', businessWithCoords);

    // 4. Verificar algunos negocios con sus coordenadas
    const sampleBusinesses = await prisma.$queryRawUnsafe(`
      SELECT
        id,
        name,
        latitude,
        longitude,
        ST_AsText(location) as location_text
      FROM "Business"
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      LIMIT 5
    `);
    console.log('🔍 Sample businesses:', sampleBusinesses);

    // 5. Probar cálculo de distancia simple
    const userLat = -38.0023; // Mar del Plata
    const userLng = -57.5575;

    const distanceTest = await prisma.$queryRawUnsafe(
      `
      SELECT
        id,
        name,
        latitude,
        longitude,
        ST_Distance(
          location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) / 1000 as distance_km
      FROM "Business"
      WHERE location IS NOT NULL
      ORDER BY distance_km ASC
      LIMIT 5
    `,
      userLng,
      userLat
    );
    console.log('🔍 Distance test:', distanceTest);

    // 6. Verificar categorías MECHANICS
    const mechanicsCategory = await prisma.$queryRawUnsafe(
      `
      SELECT * FROM "Category" WHERE slug = $1
    `,
      Categories.MECHANICS
    );
    console.log('🔍 Mechanics category:', mechanicsCategory);

    // 7. Verificar negocios con categoría MECHANICS
    const mechanicsBusinesses = await prisma.$queryRawUnsafe(
      `
      SELECT COUNT(*) as count
      FROM "Business" b
      JOIN "Category" c ON b."categoryId" = c.id
      WHERE c.slug = $1 AND b.status = true
    `,
      Categories.MECHANICS
    );
    console.log('🔍 Mechanics businesses count:', mechanicsBusinesses);

    return {
      success: true,
      postgisVersion,
      businessWithLocation,
      businessWithCoords,
      sampleBusinesses,
      distanceTest,
      mechanicsCategory,
      mechanicsBusinesses,
    };
  } catch (error) {
    console.error('🔍 PostGIS Test Error:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Función para verificar y actualizar locations faltantes
export async function updateMissingLocations() {
  try {
    const result = await prisma.$queryRawUnsafe(`
      UPDATE "Business"
      SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
      WHERE latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND location IS NULL
    `);

    console.log('🔍 Updated missing locations:', result);
    return result;
  } catch (error) {
    console.error('🔍 Update locations error:', error);
    throw error;
  }
}
