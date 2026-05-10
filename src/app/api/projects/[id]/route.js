import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PATCH /api/projects/:id — atualizar projeto
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, active } = body;

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });
    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (active !== undefined) updateData.active = active;

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { cards: true },
        },
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/:id — deletar projeto
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Desvincular cards do projeto antes de deletar
    await prisma.card.updateMany({
      where: { projectId: id },
      data: { projectId: null },
    });

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
