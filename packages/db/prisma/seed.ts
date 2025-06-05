import {prisma} from "../client";

async function main() {
  // Create a test category
  const category = await prisma.category.create({
    data: {
      name: "Mecánicos",
      slug: "mecanicos",
      description: "Talleres mecánicos y servicios automotrices",
      icon: "🔧",
    },
  });

  // Create a test city
  const city = await prisma.city.create({
    data: {
      name: "Buenos Aires",
      slug: "buenos-aires",
    },
  });

  // Create a test zone
  const zone = await prisma.zone.create({
    data: {
      name: "Palermo",
      slug: "palermo",
      cityId: city.id,
    },
  });

  // Create locations for both city and zone
  const cityLocation = await prisma.location.create({
    data: {
      type: "CITY",
      cityId: city.id,
    },
  });

  const zoneLocation = await prisma.location.create({
    data: {
      type: "ZONE",
      zoneId: zone.id,
    },
  });

  // Create test businesses
  await prisma.business.create({
    data: {
      name: "Taller Mecánico Central",
      slug: "taller-mecanico-central",
      description: "Servicio completo de mecánica automotriz",
      address: "Av. Corrientes 1234",
      phone: "11-1234-5678",
      email: "contacto@tallercentral.com",
      website: "https://tallercentral.com",
      categoryId: category.id,
      locationId: cityLocation.id,
    },
  });

  await prisma.business.create({
    data: {
      name: "Mecánica Express Palermo",
      slug: "mecanica-express-palermo",
      description: "Servicio rápido de mecánica",
      address: "Thames 1234",
      phone: "11-5678-1234",
      email: "contacto@mecanicaexpress.com",
      website: "https://mecanicaexpress.com",
      categoryId: category.id,
      locationId: zoneLocation.id,
    },
  });

  console.log("Seed completed successfully! 🌱");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
