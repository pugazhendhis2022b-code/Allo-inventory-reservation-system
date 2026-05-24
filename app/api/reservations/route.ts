import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const {
      inventoryId,
      quantity,
    } = body;


    const reservation =
  await prisma.$transaction(
    async (tx) => {

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

      await tx.inventory.update({
        where: {
          id: inventoryId,
        },
        data: {
          reservedUnits: {
            increment: quantity,
          },
        },
      });

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