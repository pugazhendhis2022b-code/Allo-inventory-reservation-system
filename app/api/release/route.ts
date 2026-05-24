import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const { id } = body;

    const reservation =
      await prisma.reservation.findUnique({
        where: {
          id,
        },
      });

    if (!reservation) {

      return NextResponse.json(
        {
          error: "Reservation not found",
        },
        {
          status: 404,
        }
      );

    }

    await prisma.inventory.update({
      where: {
        id: reservation.inventoryId,
      },
      data: {
        reservedUnits: {
          decrement:
            reservation.quantity,
        },
      },
    });

    const updated =
      await prisma.reservation.update({
        where: {
          id,
        },
        data: {
          status: "RELEASED",
        },
      });

    return NextResponse.json({
      success: true,
      reservation: updated,
    });

  } catch (error: any) {

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );

  }

}