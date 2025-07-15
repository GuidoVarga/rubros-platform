import { prisma } from '../../client';

async function cleanup() {
  // Delete all records in reverse order of dependencies
  console.log('🧹 Cleaning up database...');

  // Then delete provinces
  await prisma.province.deleteMany();
  console.log('Deleted all provinces');

  console.log('✨ Database cleanup completed');
}

async function main() {
  // First cleanup the database
  await cleanup();

  const provincesArray = [
    {
      name: 'La Rioja',
      slug: 'la-rioja',
    },
    {
      name: 'San Juan',
      slug: 'san-juan',
    },
    {
      name: 'Catamarca',
      slug: 'catamarca',
    },
    {
      name: 'Santiago del Estero',
      slug: 'santiago-del-estero',
    },
    {
      name: 'Tucumán',
      slug: 'tucuman',
    },
    {
      name: 'San Luis',
      slug: 'san-luis',
    },
    {
      name: 'Chaco',
      slug: 'chaco',
    },
    {
      name: 'Córdoba',
      slug: 'cordoba',
    },
    {
      name: 'Buenos Aires',
      slug: 'buenos-aires',
    },
    {
      name: 'Santa Fe',
      slug: 'santa-fe',
    },
    {
      name: 'Capital Federal',
      slug: 'capital-federal',
    },
    {
      name: 'Santa Cruz',
      slug: 'santa-cruz',
    },
    {
      name: 'La Pampa',
      slug: 'la-pampa',
    },
    {
      name: 'Entre Rios',
      slug: 'entre-rios',
    },
    {
      name: 'Chubut',
      slug: 'chubut',
    },
    {
      name: 'Neuquén',
      slug: 'neuquen',
    },
    {
      name: 'Río Negro',
      slug: 'rio-negro',
    },
    {
      name: 'Tierra del Fuego',
      slug: 'tierra-del-fuego',
    },
    {
      name: 'Formosa',
      slug: 'formosa',
    },
    {
      name: 'Jujuy',
      slug: 'jujuy',
    },
    {
      name: 'Salta',
      slug: 'salta',
    },
    {
      name: 'Mendoza',
      slug: 'mendoza',
    },
    {
      name: 'Misiones',
      slug: 'misiones',
    },
    {
      name: 'Corrientes',
      slug: 'corrientes',
    },
  ];

  for (const province of provincesArray) {
    await prisma.province.create({
      data: {
        name: province.name,
        slug: province.slug,
      },
    });
  }

  console.log(`Created ${provincesArray.length} provinces`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
