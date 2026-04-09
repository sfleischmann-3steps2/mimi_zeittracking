import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const entry = await prisma.timeEntry.update({
      where: { id },
      data: { deletedAt: null },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("PATCH /api/time-entries/[id]/restore error:", error);
    return NextResponse.json({ error: "Fehler beim Wiederherstellen" }, { status: 500 });
  }
}
