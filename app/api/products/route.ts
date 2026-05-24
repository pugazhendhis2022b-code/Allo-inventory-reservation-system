import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export async function GET() {
  const products = await prisma.inventory.findMany({
    include: {
      product: true,
      warehouse: true,
    },
  });

  const formatted = products.map((item: any) => ({
    inventoryId: item.id,
    product: item.product.name,
    warehouse: item.warehouse.name,
    available:
      item.totalUnits - item.reservedUnits,
  }));

  return Response.json(formatted);
}