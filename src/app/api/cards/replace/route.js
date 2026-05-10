import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/cards/replace — substituir card Y por card X
export async function POST(request) {
  try {
    const body = await request.json();
    const { replacingCardId, replacedCardId, startDate, duration } = body;

    // replacingCardId = card X (que substitui)
    // replacedCardId = card Y (que é substituído)

    const cardX = await prisma.card.findUnique({
      where: { id: replacingCardId },
    });
    const cardY = await prisma.card.findUnique({
      where: { id: replacedCardId },
    });

    if (!cardX || !cardY) {
      return NextResponse.json(
        { error: "One or both cards not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const isInstant = !startDate || new Date(startDate) <= now;

    if (isInstant) {
      // Substituição instantânea: Y vai para archive, X ocupa posição de Y
      await prisma.$transaction([
        // Registrar histórico de Y
        prisma.stateHistory.create({
          data: {
            cardId: cardY.id,
            fromBlock: cardY.block,
            toBlock: "archive",
          },
        }),
        // Registrar histórico de X
        prisma.stateHistory.create({
          data: {
            cardId: cardX.id,
            fromBlock: cardX.block,
            toBlock: cardY.block,
          },
        }),
        // Mover Y para archive
        prisma.card.update({
          where: { id: cardY.id },
          data: {
            block: "archive",
            previousBlock: cardY.block,
            replacedById: cardX.id,
          },
        }),
        // Mover X para posição de Y
        prisma.card.update({
          where: { id: cardX.id },
          data: {
            block: cardY.block,
            position: cardY.position,
            replacesId: cardY.id,
            // Se duração especificada, criar contagem regressiva em X
            ...(duration
              ? {
                  countdownStart: now,
                  countdownEnd: new Date(duration),
                }
              : {}),
          },
        }),
      ]);
    } else {
      // Substituição agendada: Y recebe contagem regressiva
      await prisma.card.update({
        where: { id: cardY.id },
        data: {
          countdownStart: now,
          countdownEnd: new Date(startDate),
          replacedById: cardX.id,
        },
      });

      // Marcar X como aguardando substituição
      await prisma.card.update({
        where: { id: cardX.id },
        data: {
          replacesId: cardY.id,
          // Se duração especificada, salvar para uso posterior
          ...(duration
            ? {
                countdownEnd: new Date(duration),
              }
            : {}),
        },
      });
    }

    // Retornar ambos os cards atualizados
    const updatedCards = await prisma.card.findMany({
      where: {
        id: { in: [cardX.id, cardY.id] },
      },
      include: {
        project: true,
        stateHistory: {
          orderBy: { date: "desc" },
        },
      },
    });

    return NextResponse.json(updatedCards);
  } catch (error) {
    console.error("Error replacing card:", error);
    return NextResponse.json(
      { error: "Failed to replace card" },
      { status: 500 }
    );
  }
}
