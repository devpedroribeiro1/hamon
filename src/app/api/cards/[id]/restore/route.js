import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PATCH /api/cards/:id/restore — restaurar card deletado
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;

    const existingCard = await prisma.card.findUnique({ where: { id } });
    if (!existingCard) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    if (existingCard.block !== "deleted") {
      return NextResponse.json(
        { error: "Card is not deleted" },
        { status: 400 }
      );
    }

    const restoreBlock = existingCard.previousBlock || "inbox";

    // Registrar histórico
    await prisma.stateHistory.create({
      data: {
        cardId: id,
        fromBlock: "deleted",
        toBlock: restoreBlock,
      },
    });

    // Obter posição máxima no bloco de destino
    const maxPosition = await prisma.card.aggregate({
      where: { block: restoreBlock },
      _max: { position: true },
    });

    const card = await prisma.card.update({
      where: { id },
      data: {
        block: restoreBlock,
        previousBlock: null,
        position: (maxPosition._max.position ?? -1) + 1,
      },
      include: {
        project: true,
        stateHistory: {
          orderBy: { date: "desc" },
        },
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error("Error restoring card:", error);
    return NextResponse.json(
      { error: "Failed to restore card" },
      { status: 500 }
    );
  }
}
