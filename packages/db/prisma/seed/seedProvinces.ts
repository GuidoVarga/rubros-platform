import { prisma } from '../../client';

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

  const provinces = await Promise.all([
    prisma.province.create({
      data: {
        name: 'La Rioja',
        slug: 'la-rioja',
      },
    }),
    prisma.province.create({
      data: {
        name: 'San Juan',
        slug: 'san-juan',
      },
    }),
    prisma.province.create({
      data: {
        name: 'Catamarca',
        slug: 'catamarca',
      },
    }),
    prisma.province.create({
      data: {
        name: 'Santiago del Estero',
        slug: 'santiago-del-estero',
      },
    }),
    prisma.province.create({
      data: {
        name: 'Tucumán',
        slug: 'tucuman',
      },
    }),
    prisma.province.create({
      data: {
        name: 'San Luis',
        slug: 'san-luis',
      },
    }),
    prisma.province.create({
      data: {
        name: 'Chaco',
        slug: 'chaco',
      },
    }),
    prisma.province.create({
      data: {
        name: 'Córdoba',
        slug: 'cordoba',
      },
    }),
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
    prisma.province.create({
      data: {
        name: 'Entre Rios',
        slug: 'entre-rios',
      },
    }),
    prisma.province.create({
      data: {
        name: 'Chubut',
        slug: 'chubut',
      },
    }),
    prisma.province.create({
      data: {
        name: 'Neuquén',
        slug: 'neuquen',
      },
    }),
    prisma.province.create({
      data: {
        name: 'Río Negro',
        slug: 'rio-negro',
      },
    }),
    prisma.province.create({
      data: {
        name: 'Tierra del Fuego',
        slug: 'tierra-del-fuego',
      },
    }),
    prisma.province.create({
      data: {
        name: 'Formosa',
        slug: 'formosa',
      },
    }),
    prisma.province.create({
      data: {
        name: 'Jujuy',
        slug: 'jujuy',
      },
    }),
    prisma.province.create({
      data: {
        name: 'Salta',
        slug: 'salta',
      },
    }),
    prisma.province.create({
      data: {
        name: 'Mendoza',
        slug: 'mendoza',
      },
    }),
    prisma.province.create({
      data: {
        name: 'Misiones',
        slug: 'misiones',
      },
    }),
    prisma.province.create({
      data: {
        name: 'Corrientes',
        slug: 'corrientes',
      },
    }),
  ]);

  console.log(`Created ${provinces.length} provinces`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
