import { prisma } from '../../client';

async function cleanup() {
  // Delete all records in reverse order of dependencies
  console.log('🧹 Cleaning up database...');

  // First delete businesses as they depend on categories and locations
  await prisma.business.deleteMany();
  console.log('Deleted all businesses');

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

  console.log('Seed completed successfully! 🌱');
  console.log(`Created ${categories.length} categories`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
