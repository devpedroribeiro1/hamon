import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/cards — listar todos os cards (com project e stateHistory)
export async function GET() {
  try {
    const cards = await prisma.card.findMany({
      include: {
        project: true,
        stateHistory: {
          orderBy: { date: "desc" },
        },
      },
      orderBy: { position: "asc" },
    });
    return NextResponse.json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}

// POST /api/cards — criar novo card
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, why, block, projectId } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Get the max position in the target block
    const maxPosition = await prisma.card.aggregate({
      where: { block: block || "inbox" },
      _max: { position: true },
    });

    const card = await prisma.card.create({
      data: {
        title: title.trim(),
        why: why || null,
        block: block || "inbox",
        position: (maxPosition._max.position ?? -1) + 1,
        projectId: projectId || null,
      },
      include: {
        project: true,
        stateHistory: true,
      },
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error("Error creating card:", error);
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 }
    );
  }
}
