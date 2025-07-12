import { prisma } from '../../client';

const cleanups = {
  cities: async () => {
    await prisma.city.deleteMany();
    console.log('Deleted all cities');
  },
  provinces: async () => {
    await prisma.province.deleteMany();
    console.log('Deleted all provinces');
  },
  categories: async () => {
    await prisma.category.deleteMany();
    console.log('Deleted all categories');
  },
  businesses: async () => {
    await prisma.business.deleteMany();
    console.log('Deleted all businesses');
  },
  all: async () => {
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
  },
};

async function cleanup() {
  // Delete all records in reverse order of dependencies
  console.log('🧹 Cleaning up database...');
  console.log('process.argv ', process.argv);
  const tables = process.argv.slice(2);
  if (!tables) {
    return;
  }

  if (tables[0] === 'all') {
    await cleanups.all();
  } else {
    for (const table of tables) {
      await cleanups[table as keyof typeof cleanups]();
    }
  }

  console.log('✨ Database cleanup completed');
}

cleanup()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
