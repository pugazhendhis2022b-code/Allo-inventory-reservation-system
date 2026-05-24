import { prisma } from "@/lib/prisma";
import { z } from "zod";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {

    const reservationSchema = z.object({
  inventoryId: z.string(),
  quantity: z.number().min(1),
});

  try {

    const body =
  reservationSchema.parse(
    await req.json()
  );

    const {
      inventoryId,
      quantity,
    } = body;


    const reservation =
  await prisma.$transaction(
    async (tx: any) => {

      const inventory =
        await tx.inventory.findUnique({
          where: {
            id: inventoryId,
          },
        });

      if (!inventory) {
        throw new Error(
          "Inventory not found"
        );
      }

      const available =
        inventory.totalUnits -
        inventory.reservedUnits;

      if (available < quantity) {
        throw new Error(
          "Not enough stock"
        );
      }

     const updatedInventory =
  await tx.inventory.updateMany({
    where: {
      id: inventoryId,
      reservedUnits: {
        lte:
          inventory.totalUnits -
          quantity,
      },
    },
    data: {
      reservedUnits: {
        increment: quantity,
      },
    },
  });

if (updatedInventory.count === 0) {
  throw new Error(
    "Stock conflict detected"
  );
}

      const createdReservation =
        await tx.reservation.create({
          data: {
            inventoryId,
            quantity,
            expiresAt: new Date(
              Date.now() +
                10 * 60 * 1000
            ),
          },
        });

      return createdReservation;
    }
  );
   

    return Response.json({
      success: true,
      reservation,
    });

  } catch (error: any) {

    console.log(error);

    return Response.json(
      {
        error:
          error.message ||
          "Something went wrong",
      },
      {
        status: 500,
      }
    );

  }

}