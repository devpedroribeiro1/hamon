import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PATCH /api/cards/reorder — reordenar cards
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { cards } = body; // Array of { id, block, position }

    if (!Array.isArray(cards)) {
      return NextResponse.json(
        { error: "cards must be an array" },
        { status: 400 }
      );
    }

    // Batch update all card positions
    const updates = cards.map((card) =>
      prisma.card.update({
        where: { id: card.id },
        data: {
          block: card.block,
          position: card.position,
        },
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering cards:", error);
    return NextResponse.json(
      { error: "Failed to reorder cards" },
      { status: 500 }
    );
  }
}
