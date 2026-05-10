import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/cards/:id — obter um card
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const card = await prisma.card.findUnique({
      where: { id },
      include: {
        project: true,
        stateHistory: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json(card);
  } catch (error) {
    console.error("Error fetching card:", error);
    return NextResponse.json(
      { error: "Failed to fetch card" },
      { status: 500 }
    );
  }
}

// PATCH /api/cards/:id — atualizar card
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, why, block, projectId, position } = body;

    const existingCard = await prisma.card.findUnique({ where: { id } });
    if (!existingCard) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (why !== undefined) updateData.why = why;
    if (projectId !== undefined) updateData.projectId = projectId;
    if (position !== undefined) updateData.position = position;

    // Se mudou de bloco, registrar no histórico
    if (block !== undefined && block !== existingCard.block) {
      updateData.block = block;
      updateData.previousBlock = existingCard.block;

      await prisma.stateHistory.create({
        data: {
          cardId: id,
          fromBlock: existingCard.block,
          toBlock: block,
        },
      });
    }

    const card = await prisma.card.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
        stateHistory: {
          orderBy: { date: "desc" },
        },
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error("Error updating card:", error);
    return NextResponse.json(
      { error: "Failed to update card" },
      { status: 500 }
    );
  }
}

// DELETE /api/cards/:id — soft delete (mover para "deleted")
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const existingCard = await prisma.card.findUnique({ where: { id } });
    if (!existingCard) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Registrar histórico
    await prisma.stateHistory.create({
      data: {
        cardId: id,
        fromBlock: existingCard.block,
        toBlock: "deleted",
      },
    });

    const card = await prisma.card.update({
      where: { id },
      data: {
        block: "deleted",
        previousBlock: existingCard.block,
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
    console.error("Error deleting card:", error);
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    );
  }
}
