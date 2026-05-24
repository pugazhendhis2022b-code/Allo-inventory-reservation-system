import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  await prisma.reservation.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();

  const product = await prisma.product.create({
    data: {
      name: "iPhone 15",
    },
  });

  const warehouse = await prisma.warehouse.create({
    data: {
      name: "Chennai Warehouse",
    },
  });

  await prisma.inventory.create({
    data: {
      productId: product.id,
      warehouseId: warehouse.id,
      totalUnits: 5,
    },
  });

  console.log("Seeded successfully");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });