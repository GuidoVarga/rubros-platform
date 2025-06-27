import { prisma } from '../client';

async function cleanup() {
  // Delete all records in reverse order of dependencies
  console.log('🧹 Cleaning up database...');

  // First delete businesses as they depend on categories and locations
  await prisma.business.deleteMany();
  console.log('Deleted all businesses');

  // Delete cities
  await prisma.city.deleteMany();
  console.log('Deleted all cities');

  // Then delete provinces
  await prisma.province.deleteMany();
  console.log('Deleted all provinces');

  // Finally delete categories
  await prisma.category.deleteMany();
  console.log('Deleted all categories');

  console.log('✨ Database cleanup completed');
}

async function main() {
  // First cleanup the database
  await cleanup();

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Mecánicos',
        slug: 'mecanicos',
        description: 'Talleres mecánicos y servicios automotrices',
        icon: '🔧',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Electricistas',
        slug: 'electricistas',
        description: 'Servicios de instalación y reparación eléctrica',
        icon: '⚡',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Plomeros',
        slug: 'plomeros',
        description: 'Servicios de plomería y gas',
        icon: '🚰',
      },
    }),
  ]);

  const provinces = await Promise.all([
    prisma.province.create({
      data: {
        name: 'Buenos Aires',
        slug: 'buenos-aires',
      },
    }),
    prisma.province.create({
      data: {
        name: 'Santa Fe',
        slug: 'santa-fe',
      },
    }),
    prisma.province.create({
      data: {
        name: 'Capital Federal',
        slug: 'capital-federal',
      },
    }),
    prisma.province.create({
      data: {
        name: 'Santa Cruz',
        slug: 'santa-cruz',
      },
    }),
    prisma.province.create({
      data: {
        name: 'La Pampa',
        slug: 'la-pampa',
      },
    }),
  ]);

  // Create cities
  const cities = await Promise.all([
    prisma.city.create({
      data: {
        name: 'Mar del Plata',
        slug: 'mar-del-plata',
        provinceId: provinces[0].id,
      },
    }),
    prisma.city.create({
      data: {
        name: 'Miramar',
        slug: 'miramar',
        provinceId: provinces[0].id,
      },
    }),
    prisma.city.create({
      data: {
        name: 'Rosario',
        slug: 'rosario',
        provinceId: provinces[1].id,
      },
    }),
    prisma.city.create({
      data: {
        name: 'Santa Fe',
        slug: 'santa-fe',
        provinceId: provinces[1].id,
      },
    }),
    prisma.city.create({
      data: {
        name: 'Palermo',
        slug: 'palermo',
        provinceId: provinces[2].id,
      },
    }),
    prisma.city.create({
      data: {
        name: 'Colegiales',
        slug: 'colegiales',
        provinceId: provinces[2].id,
      },
    }),
    prisma.city.create({
      data: {
        name: 'Santa Cruz',
        slug: 'santa-cruz',
        provinceId: provinces[3].id,
      },
    }),
  ]);

  // Create businesses
  const businesses = await Promise.all([
    // Mechanics in Buenos Aires - Palermo
    prisma.business.create({
      data: {
        name: 'Taller Mecánico Central',
        slug: 'taller-mecanico-central',
        description:
          'Servicio completo de mecánica automotriz con más de 20 años de experiencia. Especialistas en todas las marcas.',
        address: 'Av. Corrientes 1234',
        phone: '11-1234-5678',
        email: 'contacto@tallercentral.com',
        website: 'https://tallercentral.com',
        categoryId: categories[0].id,
        cityId: cities[0].id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'Mecánica Express Palermo',
        slug: 'mecanica-express-palermo',
        description:
          'Servicio rápido de mecánica. Diagnóstico en 1 hora. Reparaciones el mismo día.',
        address: 'Thames 1234',
        phone: '11-5678-1234',
        email: 'contacto@mecanicaexpress.com',
        website: 'https://mecanicaexpress.com',
        categoryId: categories[0].id,
        cityId: cities[0].id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'Mecánica Express Palermo2',
        slug: 'mecanica-express-palermo2',
        description:
          'Servicio rápido de mecánica. Diagnóstico en 1 hora. Reparaciones el mismo día.',
        address: 'Thames 1234',
        phone: '11-5678-1234',
        email: 'contacto@mecanicaexpress.com',
        website: 'https://mecanicaexpress.com',
        categoryId: categories[0].id,
        cityId: cities[0].id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'Mecánica Express Palermo3',
        slug: 'mecanica-express-palermo3',
        description:
          'Servicio rápido de mecánica. Diagnóstico en 1 hora. Reparaciones el mismo día.',
        address: 'Thames 1234',
        phone: '11-5678-1234',
        email: 'contacto@mecanicaexpress.com',
        website: 'https://mecanicaexpress.com',
        openingHours: '9 a. m.–7 p. m.',
        closedOn: 'Sabado, Domingo',
        categoryId: categories[0].id,
        cityId: cities[0].id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'Mecánica Express Palermo4',
        slug: 'mecanica-express-palermo4',
        description:
          'Servicio rápido de mecánica. Diagnóstico en 1 hora. Reparaciones el mismo día.',
        address: 'Thames 1234',
        phone: '11-5678-1234',
        email: 'contacto@mecanicaexpress.com',
        website: 'https://mecanicaexpress.com',
        openingHours: '9 a. m.–7 p. m.',
        closedOn: 'Sabado, Domingo',
        categoryId: categories[0].id,
        cityId: cities[0].id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'Mecánica Express Palermo5',
        slug: 'mecanica-express-palermo5',
        description:
          'Servicio rápido de mecánica. Diagnóstico en 1 hora. Reparaciones el mismo día.',
        address: 'Thames 1234',
        phone: '11-5678-1234',
        email: 'contacto@mecanicaexpress.com',
        website: 'https://mecanicaexpress.com',
        openingHours: '8 a. m.–12:30 p. m., 3–6 p. m.',
        closedOn: 'Domingo',
        latitude: -38.026376,
        longitude: -57.5585,
        googleMapsLink:
          'https://www.google.com/maps/place/Car+Service/@-38.025977,-57.5978744,14z/data=!4m10!1m2!2m1!1staller+mecanico!3m6!1s0x9584de846c54d761:0xcaf23b255bdecf6a!8m2!3d-38.0259759!4d-57.5597682!15sCg90YWxsZXIgbWVjYW5pY29aESIPdGFsbGVyIG1lY2FuaWNvkgERYXV0b19tYWNoaW5lX3Nob3CaASNDaFpEU1VoTk1HOW5TMFZKUTBGblNVTkdOMlp1U0ZsM0VBRaoBbQoJL20vMDI2enNfCgkvbS8wM2ZfczMKCS9tLzBkZ2MzdBABKhMiD3RhbGxlciBtZWNhbmljbygOMh4QASIat5-AOOGRP-c1465bdeZz2l_Rx86lK8MSCGIyExACIg90YWxsZXIgbWVjYW5pY2_gAQD6AQQIABAk!16s%2Fg%2F11g6b0fd3l?entry=ttu&g_ep=EgoyMDI1MDYxNy4wIKXMDSoASAFQAw%3D%3D',
        categoryId: categories[0].id,
        cityId: cities[0].id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'Mecánica Express Palermo6',
        slug: 'mecanica-express-palermo6',
        description:
          'Servicio rápido de mecánica. Diagnóstico en 1 hora. Reparaciones el mismo día.',
        address: 'Thames 1234',
        phone: '11-5678-1234',
        email: 'contacto@mecanicaexpress.com',
        website: 'https://mecanicaexpress.com',
        categoryId: categories[0].id,
        cityId: cities[0].id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'Mecánica Express Palermo7',
        slug: 'mecanica-express-palermo7',
        description:
          'Servicio rápido de mecánica. Diagnóstico en 1 hora. Reparaciones el mismo día.',
        address: 'Thames 1234',
        phone: '11-5678-1234',
        email: 'contacto@mecanicaexpress.com',
        website: 'https://mecanicaexpress.com',
        categoryId: categories[0].id,
        cityId: cities[0].id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'Mecánica Express Palermo8',
        slug: 'mecanica-express-palermo8',
        description:
          'Servicio rápido de mecánica. Diagnóstico en 1 hora. Reparaciones el mismo día.',
        address: 'Thames 1234',
        phone: '11-5678-1234',
        email: 'contacto@mecanicaexpress.com',
        website: 'https://mecanicaexpress.com',
        categoryId: categories[0].id,
        cityId: cities[0].id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'Mecánica Express Palermo9',
        slug: 'mecanica-express-palermo9',
        description:
          'Servicio rápido de mecánica. Diagnóstico en 1 hora. Reparaciones el mismo día.',
        address: 'Thames 1234',
        phone: '11-5678-1234',
        email: 'contacto@mecanicaexpress.com',
        website: 'https://mecanicaexpress.com',
        categoryId: categories[0].id,
        cityId: cities[0].id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'Mecánica Express Palermo10',
        slug: 'mecanica-express-palermo10',
        description:
          'Servicio rápido de mecánica. Diagnóstico en 1 hora. Reparaciones el mismo día.',
        address: 'Thames 1234',
        phone: '11-5678-1234',
        email: 'contacto@mecanicaexpress.com',
        website: 'https://mecanicaexpress.com',
        categoryId: categories[0].id,
        cityId: cities[0].id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'Mecánica Express Palermo11',
        slug: 'mecanica-express-palermo11',
        description:
          'Servicio rápido de mecánica. Diagnóstico en 1 hora. Reparaciones el mismo día.',
        address: 'Thames 1234',
        phone: '11-5678-1234',
        email: 'contacto@mecanicaexpress.com',
        website: 'https://mecanicaexpress.com',
        categoryId: categories[0].id,
        cityId: cities[0].id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'Mecánica Express Palermo12',
        slug: 'mecanica-express-palermo12',
        description:
          'Servicio rápido de mecánica. Diagnóstico en 1 hora. Reparaciones el mismo día.',
        address: 'Thames 1234',
        phone: '11-5678-1234',
        email: 'contacto@mecanicaexpress.com',
        website: 'https://mecanicaexpress.com',
        categoryId: categories[0].id,
        cityId: cities[0].id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'Mecánica Express Palermo13',
        slug: 'mecanica-express-palermo13',
        description:
          'Servicio rápido de mecánica. Diagnóstico en 1 hora. Reparaciones el mismo día.',
        address: 'Thames 1234',
        phone: '11-5678-1234',
        email: 'contacto@mecanicaexpress.com',
        website: 'https://mecanicaexpress.com',
        categoryId: categories[0].id,
        cityId: cities[0].id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'Mecánica Express Palermo14',
        slug: 'mecanica-express-palermo14',
        description:
          'Servicio rápido de mecánica. Diagnóstico en 1 hora. Reparaciones el mismo día.',
        address: 'Thames 1234',
        phone: '11-5678-1234',
        email: 'contacto@mecanicaexpress.com',
        website: 'https://mecanicaexpress.com',
        categoryId: categories[0].id,
        cityId: cities[0].id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'Mecánica Express Palermo15',
        slug: 'mecanica-express-palermo15',
        description:
          'Servicio rápido de mecánica. Diagnóstico en 1 hora. Reparaciones el mismo día.',
        address: 'Thames 1234',
        phone: '11-5678-1234',
        email: 'contacto@mecanicaexpress.com',
        website: 'https://mecanicaexpress.com',
        categoryId: categories[0].id,
        cityId: cities[0].id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'Mecánica Express Palermo16',
        slug: 'mecanica-express-palermo16',
        description:
          'Servicio rápido de mecánica. Diagnóstico en 1 hora. Reparaciones el mismo día.',
        address: 'Thames 1234',
        phone: '11-5678-1234',
        email: 'contacto@mecanicaexpress.com',
        website: 'https://mecanicaexpress.com',
        categoryId: categories[0].id,
        cityId: cities[0].id,
      },
    }),

    prisma.business.create({
      data: {
        name: 'Mecánica Express Palermo17',
        slug: 'mecanica-express-palermo17',
        description:
          'Servicio rápido de mecánica. Diagnóstico en 1 hora. Reparaciones el mismo día.',
        address: 'Thames 1234',
        phone: '11-5678-1234',
        email: 'contacto@mecanicaexpress.com',
        website: 'https://mecanicaexpress.com',
        categoryId: categories[0].id,
        cityId: cities[0].id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'Mecánica Express Palermo18',
        slug: 'mecanica-express-palermo18',
        description:
          'Servicio rápido de mecánica. Diagnóstico en 1 hora. Reparaciones el mismo día.',
        address: 'Thames 1234',
        phone: '11-5678-1234',
        email: 'contacto@mecanicaexpress.com',
        website: 'https://mecanicaexpress.com',
        categoryId: categories[0].id,
        cityId: cities[0].id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'Mecánica Express Palermo19',
        slug: 'mecanica-express-palermo19',
        description:
          'Servicio rápido de mecánica. Diagnóstico en 1 hora. Reparaciones el mismo día.',
        address: 'Thames 1234',
        phone: '11-5678-1234',
        email: 'contacto@mecanicaexpress.com',
        website: 'https://mecanicaexpress.com',
        categoryId: categories[0].id,
        cityId: cities[0].id,
      },
    }),
    // Mechanics in Buenos Aires - Belgrano
    prisma.business.create({
      data: {
        name: 'AutoTech Premium',
        slug: 'autotech-premium',
        description:
          'Especialistas en vehículos de alta gama. Servicio técnico oficial de BMW, Mercedes-Benz y Audi.',
        address: 'Av. Cabildo 2500',
        phone: '11-4545-6767',
        email: 'info@autotechpremium.com',
        website: 'https://autotechpremium.com',
        categoryId: categories[0].id,
        cityId: cities[1].id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'Diesel Masters',
        slug: 'diesel-masters',
        description:
          'Expertos en motores diesel. Reparación y mantenimiento de camiones y utilitarios.',
        address: 'Sucre 1850',
        phone: '11-4789-2323',
        email: 'contacto@dieselmasters.com.ar',
        website: 'https://dieselmasters.com.ar',
        categoryId: categories[0].id,
        cityId: cities[1].id,
      },
    }),
    // Mechanics in Buenos Aires - Recoleta
    prisma.business.create({
      data: {
        name: 'Classic Car Garage',
        slug: 'classic-car-garage',
        description:
          'Restauración y mantenimiento de autos clásicos. Más de 30 años preservando joyas automotrices.',
        address: 'Junín 1440',
        phone: '11-4812-9999',
        email: 'info@classiccargarage.com.ar',
        website: 'https://classiccargarage.com.ar',
        categoryId: categories[0].id,
        cityId: cities[2].id,
      },
    }),
    // Mechanics in Buenos Aires - Caballito
    prisma.business.create({
      data: {
        name: 'ElectriCar Service',
        slug: 'electricar-service',
        description:
          'Especialistas en vehículos eléctricos e híbridos. Servicio técnico certificado para Tesla y otros.',
        address: 'Av. Pedro Goyena 820',
        phone: '11-4982-3434',
        email: 'service@electricar.com.ar',
        website: 'https://electricar.com.ar',
        categoryId: categories[0].id,
        cityId: cities[3].id,
      },
    }),
    // Mechanics in Buenos Aires - Villa Urquiza
    prisma.business.create({
      data: {
        name: 'MotoTech Racing',
        slug: 'mototech-racing',
        description:
          'Especialistas en motocicletas deportivas y de alta cilindrada. Preparación para competición.',
        address: 'Av. Triunvirato 3600',
        phone: '11-4544-7878',
        email: 'info@mototechracing.com.ar',
        website: 'https://mototechracing.com.ar',
        categoryId: categories[0].id,
        cityId: cities[4].id,
      },
    }),
    // Mechanics in Córdoba - Nueva Córdoba
    prisma.business.create({
      data: {
        name: 'Taller del Centro',
        slug: 'taller-del-centro',
        description:
          'Tu taller de confianza en el centro de Córdoba. Mecánica general y especializada.',
        address: 'Av. Colón 1234',
        phone: '351-123-4567',
        email: 'info@tallerdelcentro.com',
        website: 'https://tallerdelcentro.com',
        categoryId: categories[0].id,
        cityId: cities[5].id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'Turbo Performance',
        slug: 'turbo-performance',
        description:
          'Especialistas en turbocompresores y preparación de motores. Potenciación y optimización.',
        address: 'Bv. Illia 557',
        phone: '351-445-8899',
        email: 'info@turboperformance.com.ar',
        website: 'https://turboperformance.com.ar',
        categoryId: categories[0].id,
        cityId: cities[5].id,
      },
    }),
    // Mechanics in Córdoba - Centro
    prisma.business.create({
      data: {
        name: 'Quick Fix Auto',
        slug: 'quick-fix-auto',
        description:
          'Servicio rápido de mecánica ligera. Cambio de aceite, frenos y mantenimiento preventivo.',
        address: '27 de Abril 784',
        phone: '351-567-8900',
        email: 'service@quickfixauto.com.ar',
        website: 'https://quickfixauto.com.ar',
        categoryId: categories[0].id,
        cityId: cities[5].id,
      },
    }),
    // Mechanics in Córdoba - Alta Córdoba
    prisma.business.create({
      data: {
        name: 'Truck & Bus Service',
        slug: 'truck-and-bus-service',
        description:
          'Especialistas en vehículos pesados. Reparación y mantenimiento de camiones y colectivos.',
        address: 'Juan B. Justo 4200',
        phone: '351-678-9012',
        email: 'info@truckservice.com.ar',
        website: 'https://truckservice.com.ar',
        categoryId: categories[0].id,
        cityId: cities[5].id,
      },
    }),
    // Mechanics in Rosario - Centro
    prisma.business.create({
      data: {
        name: 'Diagnóstico Preciso',
        slug: 'diagnostico-preciso',
        description:
          'Centro de diagnóstico computarizado. Detección y solución de fallas electrónicas.',
        address: 'Av. Pellegrini 1800',
        phone: '341-456-7890',
        email: 'info@diagnosticopreciso.com.ar',
        website: 'https://diagnosticopreciso.com.ar',
        categoryId: categories[0].id,
        cityId: cities[3].id,
      },
    }),
    // Mechanics in Rosario - Fisherton
    prisma.business.create({
      data: {
        name: 'Import Car Solutions',
        slug: 'import-car-solutions',
        description:
          'Especialistas en vehículos importados. Repuestos originales y servicio especializado.',
        address: 'Av. Eva Perón 7840',
        phone: '341-567-8901',
        email: 'contact@importcarsolutions.com.ar',
        website: 'https://importcarsolutions.com.ar',
        categoryId: categories[0].id,
        cityId: cities[3].id,
      },
    }),
    // Existing non-mechanic businesses
    prisma.business.create({
      data: {
        name: 'Electricidad 24/7',
        slug: 'electricidad-24-7',
        description:
          'Servicios eléctricos de emergencia las 24 horas. Instalaciones, reparaciones y mantenimiento.',
        address: 'Av. Santa Fe 4321',
        phone: '11-9876-5432',
        email: 'info@electricidad247.com',
        website: 'https://electricidad247.com',
        categoryId: categories[1].id,
        cityId: cities[4].id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'Plomería Profesional',
        slug: 'plomeria-profesional',
        description:
          'Expertos en plomería y gas. Servicios residenciales y comerciales.',
        address: 'Av. Cabildo 2468',
        phone: '11-2468-1357',
        email: 'contacto@plomeriapro.com',
        website: 'https://plomeriapro.com',
        categoryId: categories[2].id,
        cityId: cities[5].id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'Electricistas Unidos',
        slug: 'electricistas-unidos',
        description:
          'Red de electricistas profesionales. Cobertura en toda la ciudad de Rosario.',
        address: 'Av. Pellegrini 789',
        phone: '341-765-4321',
        email: 'contacto@electricistasunidos.com',
        website: 'https://electricistasunidos.com',
        categoryId: categories[1].id,
        cityId: cities[3].id,
      },
    }),
  ]);

  console.log('Seed completed successfully! 🌱');
  console.log(`Created ${categories.length} categories`);
  console.log(`Created ${cities.length} cities`);
  console.log(`Created ${provinces.length} provinces`);
  console.log(`Created ${businesses.length} businesses`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
